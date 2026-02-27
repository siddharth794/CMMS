import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name || 'Error';

    if (process.env.NODE_ENV === 'development') {
        logger.error(err);
    } else {
        logger.error(`[Error] ${error.name}: ${error.message}`, { stack: err.stack });
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: err.status,
            name: err.name,
            message: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        });
    }

    // Prisma specific errors could be handled here if needed

    // Default error
    return res.status(500).json({
        status: 'error',
        name: 'InternalServerError',
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
