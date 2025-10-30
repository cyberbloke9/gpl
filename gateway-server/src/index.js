require('dotenv').config();
const ModbusClient = require('./modbus-client');
const TagManager = require('./tag-manager');
const DataIngestion = require('./data-ingestion');
const AggregationService = require('./aggregation-service');
const { logger } = require('./config');
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

class SCADAGateway {
  constructor() {
    this.modbusClient = new ModbusClient();
    this.tagManager = new TagManager();
    this.dataIngestion = new DataIngestion();
    this.aggregationService = new AggregationService();
    this.isRunning = false;
    this.pollingInterval = null;
    this.consecutiveErrors = 0;
    this.maxConsecutiveErrors = 5;
  }

  async initialize() {
    logger.info('🚀 Starting SCADA Gateway...');
    
    try {
      // Load tag mappings from Supabase
      const tagCount = await this.tagManager.loadTagMappings();
      
      if (tagCount === 0) {
        logger.warn('⚠️  No active SCADA tags found. Please configure tags in Admin UI.');
        logger.info('Gateway will keep running and check for tags periodically...');
      } else {
        logger.info(`✅ Loaded ${tagCount} active SCADA tags`);
      }

      // Connect to Modbus
      await this.modbusClient.connect(
        process.env.MODBUS_HOST,
        parseInt(process.env.MODBUS_PORT),
        parseInt(process.env.MODBUS_SLAVE_ID)
      );
      logger.info('✅ Connected to Modbus device');

      // Update connection health
      await this.dataIngestion.updateConnectionHealth('modbus_primary', {
        connection_type: 'modbus_tcp',
        host: process.env.MODBUS_HOST,
        port: parseInt(process.env.MODBUS_PORT),
        slave_address: parseInt(process.env.MODBUS_SLAVE_ID),
        is_connected: true,
        last_successful_read: new Date().toISOString(),
        consecutive_failures: 0,
      });

      // Start aggregation service (hourly rollup)
      this.aggregationService.start();

      this.isRunning = true;
      logger.info('🟢 SCADA Gateway is running');
    } catch (error) {
      logger.error('❌ Failed to initialize gateway:', error);
      
      // Update connection health
      await this.dataIngestion.updateConnectionHealth('modbus_primary', {
        connection_type: 'modbus_tcp',
        host: process.env.MODBUS_HOST,
        port: parseInt(process.env.MODBUS_PORT),
        slave_address: parseInt(process.env.MODBUS_SLAVE_ID),
        is_connected: false,
        last_failed_read: new Date().toISOString(),
        error_message: error.message,
      });
      
      throw error;
    }
  }

  async pollTags() {
    if (!this.isRunning) return;

    // Reload tags periodically to pick up changes
    await this.tagManager.reloadIfNeeded();

    const tags = this.tagManager.getActiveTags();
    
    if (tags.length === 0) {
      return; // No tags to poll
    }

    let successCount = 0;
    let errorCount = 0;
    
    for (const tag of tags) {
      try {
        // Read from Modbus
        const rawValue = await this.modbusClient.readRegister(
          tag.modbus_address,
          tag.modbus_function_code,
          tag.data_type
        );

        // Scale and process value
        const scaledValue = this.tagManager.scaleValue(
          rawValue,
          tag.scaling_factor || 1,
          tag.offset || 0
        );

        // Check alarms
        const alarmStatus = this.tagManager.checkAlarms(tag, scaledValue);

        // Insert into scada_readings table (upsert)
        await this.dataIngestion.upsertReading({
          tag_mapping_id: tag.id,
          raw_value: rawValue,
          scaled_value: scaledValue,
          quality_code: 0, // 0 = Good
          is_alarm: alarmStatus.isAlarm,
          alarm_type: alarmStatus.type,
          source: 'modbus',
          timestamp: new Date().toISOString(),
          received_at: new Date().toISOString(),
        });

        // If mapped to transformer_logs or generator_logs, update those too
        if (tag.target_table === 'transformer_logs' || tag.target_table === 'generator_logs') {
          await this.dataIngestion.updateOperationalLog(tag, scaledValue);
        }

        logger.debug(`📊 ${tag.tag_name}: ${scaledValue.toFixed(2)} ${tag.unit || ''}`);
        successCount++;
      } catch (error) {
        errorCount++;
        logger.error(`❌ Error reading tag ${tag.tag_name}: ${error.message}`);
        
        // Insert bad quality reading
        await this.dataIngestion.upsertReading({
          tag_mapping_id: tag.id,
          raw_value: 0,
          scaled_value: 0,
          quality_code: 1, // 1 = Bad
          source: 'modbus',
          timestamp: new Date().toISOString(),
          received_at: new Date().toISOString(),
        });
      }
    }

    // Update connection health stats
    if (successCount > 0 || errorCount > 0) {
      await this.dataIngestion.updateConnectionHealth('modbus_primary', {
        connection_type: 'modbus_tcp',
        host: process.env.MODBUS_HOST,
        port: parseInt(process.env.MODBUS_PORT),
        slave_address: parseInt(process.env.MODBUS_SLAVE_ID),
        is_connected: successCount > 0,
        last_successful_read: successCount > 0 ? new Date().toISOString() : undefined,
        last_failed_read: errorCount > 0 ? new Date().toISOString() : undefined,
        consecutive_failures: errorCount > 0 ? this.consecutiveErrors++ : 0,
      });
    }

    // Handle too many errors
    if (errorCount > 0 && successCount === 0) {
      this.consecutiveErrors++;
      if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
        logger.error(`💥 Too many consecutive errors (${this.consecutiveErrors}), attempting reconnection...`);
        this.consecutiveErrors = 0;
        try {
          await this.modbusClient.reconnect();
        } catch (reconnectError) {
          logger.error(`Reconnection failed: ${reconnectError.message}`);
        }
      }
    } else {
      this.consecutiveErrors = 0;
    }
  }

  start() {
    const interval = parseInt(process.env.POLLING_INTERVAL_MS) || 2000;
    
    this.pollingInterval = setInterval(async () => {
      await this.pollTags();
    }, interval);

    logger.info(`🔄 Polling tags every ${interval}ms`);
  }

  async shutdown() {
    logger.info('🛑 Shutting down SCADA Gateway...');
    this.isRunning = false;
    
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    
    await this.modbusClient.disconnect();
    this.aggregationService.stop();
    
    logger.info('👋 Gateway shutdown complete');
    process.exit(0);
  }
}

// Main execution
(async () => {
  const gateway = new SCADAGateway();
  
  try {
    await gateway.initialize();
    gateway.start();
  } catch (error) {
    logger.error('💥 Gateway crashed:', error);
    process.exit(1);
  }

  // Graceful shutdown handlers
  process.on('SIGINT', () => gateway.shutdown());
  process.on('SIGTERM', () => gateway.shutdown());
  process.on('uncaughtException', (error) => {
    logger.error('💥 Uncaught exception:', error);
    gateway.shutdown();
  });
})();
