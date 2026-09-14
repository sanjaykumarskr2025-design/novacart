import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/v1/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'NovaCart Enterprise API', timestamp: new Date() });
});

// Products API
app.get('/api/v1/products', async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({ include: { category: true } });
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch products' });
    }
});

app.post('/api/v1/products', async (req: Request, res: Response) => {
    try {
        const { name, slug, description, categoryId, price, original_price, stock, imageUrl, badge } = req.body;
        const product = await prisma.product.create({
            data: {
                name,
                slug,
                description,
                categoryId,
                price,
                originalPrice: original_price,
                stock: parseInt(stock, 10),
                imageUrl,
                badge
            }
        });
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, error: 'Failed to create product' });
    }
});

// Orders API
app.get('/api/v1/orders', async (req: Request, res: Response) => {
    try {
        const orders = await prisma.order.findMany({ include: { customer: true, orderItems: true } });
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch orders' });
    }
});

app.patch('/api/v1/orders/:id/status', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, supplierStatus } = req.body;
        const updated = await prisma.order.update({
            where: { id },
            data: { status, supplierStatus }
        });
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(400).json({ success: false, error: 'Failed to update order status' });
    }
});

app.listen(PORT, () => {
    console.log(`NovaCart Enterprise API running on port ${PORT}`);
});

export default app;
