// Script to create admin account
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qalybaha';

async function createAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;

        // Check if admin exists
        const existingUser = await db.collection('users').findOne({ email: 'admin@qalybaha.com' });
        if (existingUser) {
            console.log('Admin already exists!');
            console.log('Email: admin@qalybaha.com');
            console.log('Password: admin123');
            process.exit(0);
        }

        // Create shop first
        const shopResult = await db.collection('shops').insertOne({
            name: 'Shop Demo',
            slug: 'shop-demo',
            license: {
                plan: 'premium',
                trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                status: 'trial'
            },
            settings: {
                currency: 'VND',
                timezone: 'Asia/Ho_Chi_Minh'
            },
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const shopId = shopResult.insertedId;

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // Create admin user
        const userResult = await db.collection('users').insertOne({
            email: 'admin@qalybaha.com',
            password: hashedPassword,
            name: 'Admin Demo',
            shopId: shopId,
            role: 'owner',
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Update shop with ownerId
        await db.collection('shops').updateOne(
            { _id: shopId },
            { $set: { ownerId: userResult.insertedId } }
        );

        console.log('\n✅ Admin account created successfully!\n');
        console.log('========================================');
        console.log('  Email:    admin@qalybaha.com');
        console.log('  Password: admin123');
        console.log('========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

createAdmin();
