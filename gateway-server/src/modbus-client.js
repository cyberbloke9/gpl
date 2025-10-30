const ModbusRTU = require('modbus-serial');
const { logger } = require('./config');

class ModbusClient {
  constructor() {
    this.client = new ModbusRTU();
    this.isConnected = false;
    this.slaveId = 1;
    this.host = null;
    this.port = null;
  }

  async connect(host, port, slaveId) {
    this.host = host;
    this.port = port;
    this.slaveId = slaveId;
    
    try {
      await this.client.connectTCP(host, { port });
      this.client.setID(slaveId);
      this.client.setTimeout(parseInt(process.env.MODBUS_TIMEOUT) || 5000);
      
      this.isConnected = true;
      logger.info(`✅ Modbus connected to ${host}:${port} (Slave ${slaveId})`);
      return true;
    } catch (error) {
      logger.error(`❌ Modbus connection failed: ${error.message}`);
      this.isConnected = false;
      throw error;
    }
  }

  async readRegister(address, functionCode, dataType) {
    if (!this.isConnected) {
      throw new Error('Modbus not connected');
    }

    let rawValue;
    const registerCount = (dataType === 'float32' || dataType === 'uint32' || dataType === 'int32') ? 2 : 1;

    try {
      switch (functionCode) {
        case 1: // Read Coil
          const coilData = await this.client.readCoils(address, 1);
          rawValue = coilData.data[0] ? 1 : 0;
          break;
        
        case 2: // Read Discrete Input
          const discreteData = await this.client.readDiscreteInputs(address, 1);
          rawValue = discreteData.data[0] ? 1 : 0;
          break;
        
        case 3: // Read Holding Register
          const holdingData = await this.client.readHoldingRegisters(address, registerCount);
          rawValue = this.parseRegisterValue(holdingData.data, dataType);
          break;
        
        case 4: // Read Input Register
          const inputData = await this.client.readInputRegisters(address, registerCount);
          rawValue = this.parseRegisterValue(inputData.data, dataType);
          break;
        
        default:
          throw new Error(`Unsupported function code: ${functionCode}`);
      }

      return rawValue;
    } catch (error) {
      logger.error(`Read register ${address} failed: ${error.message}`);
      throw error;
    }
  }

  parseRegisterValue(registers, dataType) {
    const buffer = Buffer.alloc(registers.length * 2);
    
    for (let i = 0; i < registers.length; i++) {
      buffer.writeUInt16BE(registers[i], i * 2);
    }

    switch (dataType) {
      case 'uint16':
        return buffer.readUInt16BE(0);
      case 'int16':
        return buffer.readInt16BE(0);
      case 'uint32':
        return buffer.readUInt32BE(0);
      case 'int32':
        return buffer.readInt32BE(0);
      case 'float32':
        return buffer.readFloatBE(0);
      case 'boolean':
        return registers[0] !== 0;
      default:
        return registers[0];
    }
  }

  async disconnect() {
    if (this.isConnected) {
      try {
        await this.client.close();
        this.isConnected = false;
        logger.info('🔌 Modbus disconnected');
      } catch (error) {
        logger.error(`Error disconnecting: ${error.message}`);
      }
    }
  }

  async reconnect() {
    logger.info('🔄 Attempting to reconnect...');
    await this.disconnect();
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    return await this.connect(this.host, this.port, this.slaveId);
  }
}

module.exports = ModbusClient;
