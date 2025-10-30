const { createClient } = require('@supabase/supabase-js');
const { logger } = require('./config');

class DataIngestion {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  async upsertReading(readingData) {
    try {
      const { error } = await this.supabase
        .from('scada_readings')
        .upsert(readingData, { onConflict: 'tag_mapping_id' });

      if (error) {
        logger.error(`❌ Error upserting reading: ${error.message}`);
        throw error;
      }
    } catch (error) {
      logger.error(`Database upsert failed: ${error.message}`);
    }
  }

  async updateOperationalLog(tag, scaledValue) {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const hour = now.getHours();

    try {
      const updatePayload = {
        [tag.target_field]: scaledValue,
        data_source: 'scada',
        logged_at: now.toISOString(),
      };

      if (tag.target_table === 'transformer_logs') {
        updatePayload.transformer_number = tag.transformer_number;
        updatePayload.date = dateStr;
        updatePayload.hour = hour;

        const { error } = await this.supabase
          .from('transformer_logs')
          .upsert(updatePayload, { 
            onConflict: 'date,hour,transformer_number',
            ignoreDuplicates: false 
          });

        if (error) {
          logger.error(`❌ Error updating transformer log: ${error.message}`);
        }
      } else if (tag.target_table === 'generator_logs') {
        updatePayload.date = dateStr;
        updatePayload.hour = hour;

        const { error } = await this.supabase
          .from('generator_logs')
          .upsert(updatePayload, { 
            onConflict: 'date,hour',
            ignoreDuplicates: false 
          });

        if (error) {
          logger.error(`❌ Error updating generator log: ${error.message}`);
        }
      }
    } catch (error) {
      logger.error(`Operational log update failed: ${error.message}`);
    }
  }

  async updateConnectionHealth(connectionName, status) {
    try {
      const { error } = await this.supabase
        .from('scada_connection_health')
        .upsert({
          connection_name: connectionName,
          ...status,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'connection_name' });

      if (error) {
        logger.error(`Connection health update failed: ${error.message}`);
      }
    } catch (error) {
      logger.error(`Health monitor error: ${error.message}`);
    }
  }
}

module.exports = DataIngestion;
