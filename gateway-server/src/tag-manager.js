const { createClient } = require('@supabase/supabase-js');
const { logger } = require('./config');

class TagManager {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    this.tags = [];
    this.lastReloadTime = null;
  }

  async loadTagMappings() {
    try {
      const { data, error } = await this.supabase
        .from('scada_tag_mappings')
        .select('*')
        .eq('is_active', true)
        .order('polling_priority', { ascending: true });

      if (error) {
        throw new Error(`Failed to load tag mappings: ${error.message}`);
      }

      this.tags = data || [];
      this.lastReloadTime = new Date();
      logger.info(`📋 Loaded ${this.tags.length} active SCADA tags`);
      return this.tags.length;
    } catch (error) {
      logger.error(`Error loading tag mappings: ${error.message}`);
      throw error;
    }
  }

  async reloadIfNeeded() {
    // Reload tags every 5 minutes to pick up configuration changes
    if (!this.lastReloadTime || (Date.now() - this.lastReloadTime.getTime()) > 300000) {
      await this.loadTagMappings();
    }
  }

  getActiveTags() {
    return this.tags;
  }

  getActiveTagCount() {
    return this.tags.length;
  }

  scaleValue(rawValue, scalingFactor, offset) {
    return (rawValue * scalingFactor) + offset;
  }

  checkAlarms(tag, scaledValue) {
    let isAlarm = false;
    let type = null;

    if (tag.alarm_high !== null && scaledValue > tag.alarm_high) {
      isAlarm = true;
      type = 'high';
    } else if (tag.alarm_low !== null && scaledValue < tag.alarm_low) {
      isAlarm = true;
      type = 'low';
    } else if (
      (tag.min_value !== null && scaledValue < tag.min_value) ||
      (tag.max_value !== null && scaledValue > tag.max_value)
    ) {
      isAlarm = true;
      type = 'out_of_range';
    }

    return { isAlarm, type };
  }
}

module.exports = TagManager;
