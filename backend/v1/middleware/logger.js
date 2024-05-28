import { createLogger } from 'winston';
import { transports, format } from 'winston';
import expressWinston from 'express-winston'

// Setup format of logging
const myFormat = format.printf(({ level, meta, message, timestamp }) => {
  return `${timestamp} ${level.toUpperCase()}: ${message} ${meta ? JSON.stringify(meta.res.statusCode) : ''}`;
});

// Setup a logger
export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.json(),
    format.timestamp(),
    myFormat,
  ),
  transports: [
    new transports.File({
      level: 'info',
      filename: 'v1/logs/app.log'
    }),
    new transports.File({
      level: 'error',
      filename: 'v1/logs/errors.log',
      handleExceptions: true
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    handleExceptions: true
  }));
};

// Setup a logger for express app
export const appLogger = expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  statusLevels: true,
  colorize: false, // To prevent ANSI codes in log message
  expressFormat: true,
});
