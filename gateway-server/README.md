# Hydropower SCADA Gateway

Node.js gateway server for integrating Modbus/IEC104 SCADA data with Supabase database.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
nano .env
```

3. Update `.env` with your configuration:
   - `SUPABASE_SERVICE_ROLE_KEY`: Get from Lovable Cloud backend
   - `MODBUS_HOST`: IP address of your Modbus RTU/gateway
   - `MODBUS_PORT`: Usually 502 for Modbus TCP
   - `MODBUS_SLAVE_ID`: Slave address (1-247)

4. Run the gateway:
```bash
npm start
```

## Development Mode

```bash
npm run dev
```

## Architecture

- `src/index.js` - Main entry point and polling loop
- `src/config.js` - Logger configuration
- `src/modbus-client.js` - Modbus TCP/RTU connection handler
- `src/tag-manager.js` - Tag mapping and value scaling
- `src/data-ingestion.js` - Database insertion logic
- `src/aggregation-service.js` - Hourly data aggregation

## Deployment

For production deployment on Linux/Raspberry Pi:

```bash
npm install pm2 -g
pm2 start src/index.js --name scada-gateway
pm2 save
pm2 startup
```

## Logs

Logs are stored in `logs/gateway.log` and console output.

View PM2 logs:
```bash
pm2 logs scada-gateway
```

## Troubleshooting

### Connection Issues
- Verify network connectivity to Modbus device
- Check firewall rules (port 502)
- Confirm correct IP address and slave ID

### Data Quality Issues
- Check tag mappings in Admin UI
- Verify scaling factors and offsets
- Review Modbus address map from engineer
