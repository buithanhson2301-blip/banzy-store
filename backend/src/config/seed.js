import { User, Shop } from '../models/index.js';
import config from './index.js';

export const seedAdmin = async () => {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@qalybaha.com' });
        if (existingAdmin) {
            console.log('   Admin account already exists');
            return;
        }

        // Create shop
        const shop = new Shop({
            name: 'Shop Demo',
            slug: 'shop-demo',
            license: {
                plan: 'premium',
                trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
                status: 'trial'
            }
        });
        await shop.save();

        // Create admin user
        const admin = new User({
            email: 'admin@qalybaha.com',
            password: 'admin123',
            name: 'Admin Demo',
            shopId: shop._id,
            role: 'owner',
            emailVerified: true
        });
        await admin.save();

        // Update shop owner
        shop.ownerId = admin._id;
        await shop.save();

        console.log('   ✅ Created demo admin account:');
        console.log('      Email: admin@qalybaha.com');
        console.log('      Password: admin123');
    } catch (error) {
        console.error('   Failed to seed admin:', error.message);
    }
};
