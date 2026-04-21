/********************************
 * Logger Module
 * 
 * This module sets up multiple loggers using Winston with daily rotating file transports.
 * Each logger is configured to log messages in a specific format and rotate logs daily.
 ********************************/

const {createLogger, format, transports} = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const {combine, timestamp, printf} = format;

const logFormat = printf(({level, message, timestamp}) => {
    return `<${level.toUpperCase()}> ${timestamp} : ${message}`;
});

// Helper to create loggers for different files
const buildLogger = (filename) => {
  return createLogger({
    level: 'info',
    format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      logFormat
    ),
    transports: [
      new DailyRotateFile({
        filename: `logs/${filename}-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
      })
    ]
  });
};

module.exports = {
    // appLogger: buildLogger('app'),
    dbLogger: buildLogger('db'),
    xpressionLogger: buildLogger('xpression'),
    responseLogger: buildLogger('response'),
    serverLogger: buildLogger('server'),
    apiLogger: buildLogger('api')
};