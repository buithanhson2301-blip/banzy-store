import express from 'express';
import cors from 'cors';
import config from './config/index.js';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/error.js';

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import customerRoutes from './routes/customers.js';
import orderRoutes from './routes/orders.js';
import dashboardRoutes from './routes/dashboard.js';
import staffRoutes from './routes/staff.js';
import supplierRoutes from './routes/suppliers.js';
import integrationRoutes from './routes/integrations.js';
import tierRoutes from './routes/tierRoutes.js';
import shippingRoutes from './routes/shipping.js';
import webhookRoutes from './routes/webhooks.js';

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigins = [
    config.frontendUrl,
    'https://banzy.store',
    'https://www.banzy.store',
    'http://localhost:3000'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/tier-settings', tierRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/webhooks', webhookRoutes); // Public endpoints, no /api prefix

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`🚀 QALY BAHA API running on port ${PORT}`);
    console.log(`   Environment: ${config.nodeEnv}`);
});

export default app;
