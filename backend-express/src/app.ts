import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

import apiRoutes from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { logger } from './utils/logger';
import { apiLimiter } from './middlewares/rateLimiter.middleware';
// Request Logging
app.use((req, res, next) => {
    logger.info(`[${req.method}] ${req.url}`);
    next();
});

// Global Rate Limiting
app.use('/api', apiLimiter);

// Routes will be added here
app.use('/api', apiRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
    });
}

export default app;
