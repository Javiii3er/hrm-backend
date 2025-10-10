import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = process.env.PORT || 3000; 

export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'HRM System API running!', 
        environment: process.env.NODE_ENV || 'development'
    });
});

async function startServer() {
    try {
        await prisma.$connect();
        console.log('Database connected successfully.');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Access at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to database or start server:', error);
        process.exit(1);
    }
}

startServer();