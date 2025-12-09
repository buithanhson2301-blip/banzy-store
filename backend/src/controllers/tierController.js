import TierSettings from '../models/TierSettings.js';
import Customer from '../models/Customer.js';

// Get tier settings for shop
export const getTierSettings = async (req, res, next) => {
    try {
        let settings = await TierSettings.findOne({ shopId: req.shop._id });

        // Create default settings if not exists
        if (!settings) {
            settings = new TierSettings({ shopId: req.shop._id });
            await settings.save();
        }

        res.json({ data: settings });
    } catch (error) {
        next(error);
    }
};

// Update tier settings
export const updateTierSettings = async (req, res, next) => {
    try {
        const { tiers } = req.body;

        if (!tiers || !Array.isArray(tiers) || tiers.length !== 4) {
            return res.status(400).json({ message: 'Phải có đúng 4 hạng khách hàng' });
        }

        // Validate tiers are in ascending order
        for (let i = 1; i < tiers.length; i++) {
            if (tiers[i].minSpent < tiers[i - 1].minSpent || tiers[i].minOrders < tiers[i - 1].minOrders) {
                return res.status(400).json({ message: 'Điều kiện các hạng phải tăng dần' });
            }
        }

        let settings = await TierSettings.findOne({ shopId: req.shop._id });

        if (!settings) {
            settings = new TierSettings({ shopId: req.shop._id, tiers });
        } else {
            settings.tiers = tiers;
        }

        await settings.save();

        // Recalculate all customer tiers
        await recalculateAllCustomerTiers(req.shop._id, tiers);

        res.json({ data: settings, message: 'Đã cập nhật cài đặt phân hạng' });
    } catch (error) {
        next(error);
    }
};

// Helper function to calculate customer tier
export const calculateCustomerTier = (totalSpent, totalOrders, tiers) => {
    let tier = 0;

    for (let i = tiers.length - 1; i >= 0; i--) {
        // Either condition is met = qualify for this tier
        if (totalSpent >= tiers[i].minSpent || totalOrders >= tiers[i].minOrders) {
            tier = tiers[i].level;
            break;
        }
    }

    return tier;
};

// Recalculate all customers' tiers for a shop
export const recalculateAllCustomerTiers = async (shopId, tiers) => {
    const customers = await Customer.find({ shopId });

    for (const customer of customers) {
        const newTier = calculateCustomerTier(customer.totalSpent, customer.totalOrders, tiers);
        if (customer.tier !== newTier) {
            customer.tier = newTier;
            await customer.save();
        }
    }
};

// Update single customer tier (called when order is completed)
export const updateCustomerTier = async (customerId, shopId) => {
    try {
        const customer = await Customer.findById(customerId);
        if (!customer) return;

        let settings = await TierSettings.findOne({ shopId });
        if (!settings) {
            settings = new TierSettings({ shopId });
            await settings.save();
        }

        const newTier = calculateCustomerTier(customer.totalSpent, customer.totalOrders, settings.tiers);
        if (customer.tier !== newTier) {
            customer.tier = newTier;
            await customer.save();
        }
    } catch (error) {
        console.error('Failed to update customer tier:', error);
    }
};
