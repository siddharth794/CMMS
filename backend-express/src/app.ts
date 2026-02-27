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
// Routes will be added here
app.use('/api', apiRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;
