/********************************
 * Request Logger Middleware
 * 
 * This middleware logs incoming HTTP requests and their responses,
 * including method, URL, status code, and response time.
 ********************************/

const { apiLogger } = require('./logger');

module.exports = function (req, res, next) {
    const start = Date.now();

    res.on( 'finish', () => {
        const duration = Date.now() - start;
        const logMessage = `${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`;

        if (res.statusCode >= 500) {
            apiLogger.error(logMessage);
        } else if (res.statusCode >= 400) {
            apiLogger.warn(logMessage);
        } else {
            apiLogger.info(logMessage)
        }
    });

    next();
};