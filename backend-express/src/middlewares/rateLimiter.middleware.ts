import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';

// General rate limiter for all API routes
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res, next, options) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        // Optionally, throw a standardized AppError
        next(new AppError('Too many requests, please try again later.', options.statusCode));
    }
});

// Specific rate limiter for authentication routes (stricter)
export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 failed/login requests per `window`
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
        next(new AppError('Too many login attempts from this IP, please try again after an hour', options.statusCode));
    }
});
