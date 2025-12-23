const fs = require('fs');
const path = require('path');
const config = require('../config');

/**
 * Production Error Handler
 * Safe error handling with logging
 */

const LOG_PATH = path.join(__dirname, '../logs');

// Ensure logs directory exists
if (!fs.existsSync(LOG_PATH)) {
    fs.mkdirSync(LOG_PATH, { recursive: true });
}

function logError(message, error = null) {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] ${message}`;
    
    if (error) {
        logMessage += `\nError: ${error.message}\nStack: ${error.stack}`;
    }
    
    logMessage += '\n';
    
    try {
        fs.appendFileSync(path.join(LOG_PATH, 'app-errors.log'), logMessage);
    } catch (err) {
        console.error('Failed to write error log:', err);
    }
}

// Express error handler middleware
function errorHandler(err, req, res, next) {
    // Log the error
    logError(`Error in ${req.method} ${req.path}`, err);
    
    // Don't expose error details in production
    if (config.env === 'production') {
        if (req.path.startsWith('/api')) {
            return res.status(err.status || 500).json({
                error: 'Internal Server Error'
            });
        }
        
        return res.status(err.status || 500).render('error', {
            error: 'An error occurred. Please try again later.'
        });
    }
    
    // Development: show full error
    if (req.path.startsWith('/api')) {
        return res.status(err.status || 500).json({
            error: err.message,
            stack: err.stack
        });
    }
    
    res.status(err.status || 500).render('error', {
        error: err.message,
        stack: err.stack
    });
}

module.exports = { errorHandler, logError };

