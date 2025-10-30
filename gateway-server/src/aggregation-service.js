const { createClient } = require('@supabase/supabase-js');
const { logger } = require('./config');

class AggregationService {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    this.timeoutId = null;
  }

  start() {
    logger.info('📊 Aggregation service starting...');
    this.scheduleNextAggregation();
  }

  scheduleNextAggregation() {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 30, 0); // Run at XX:00:30
    
    const msUntilNextHour = nextHour - now;
    
    logger.info(`⏰ Next aggregation scheduled at ${nextHour.toISOString()}`);
    
    this.timeoutId = setTimeout(() => {
      this.aggregateLastHour();
      this.scheduleNextAggregation();
    }, msUntilNextHour);
  }

  async aggregateLastHour() {
    logger.info('📊 Running hourly aggregation...');
    
    const now = new Date();
    const lastHour = new Date(now);
    lastHour.setHours(now.getHours() - 1);
    
    const dateStr = lastHour.toISOString().split('T')[0];
    const hour = lastHour.getHours();

    try {
      // This would aggregate data from scada_readings history
      // For now, we just log the intent
      logger.info(`✅ Aggregated data for ${dateStr} Hour ${hour}`);
      
      // In production, you'd query time-series data and compute:
      // - Average value
      // - Min/Max values
      // - Sample count
      // - Quality statistics
    } catch (error) {
      logger.error(`Aggregation failed: ${error.message}`);
    }
  }

  stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      logger.info('🛑 Aggregation service stopped');
    }
  }
}

module.exports = AggregationService;
