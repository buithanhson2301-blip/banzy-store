import mongoose from 'mongoose';

const tierSchema = new mongoose.Schema({
    level: { type: Number, required: true }, // 0, 1, 2, 3
    name: { type: String, required: true },
    minSpent: { type: Number, default: 0 }, // Minimum spending to reach this tier
    minOrders: { type: Number, default: 0 }, // Minimum orders to reach this tier
    color: { type: String, default: '#888888' } // Color for display
});

const tierSettingsSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
        unique: true
    },
    tiers: {
        type: [tierSchema],
        default: [
            { level: 0, name: 'Thường', minSpent: 0, minOrders: 0, color: '#9CA3AF' },
            { level: 1, name: 'Bạc', minSpent: 2000000, minOrders: 5, color: '#94A3B8' },
            { level: 2, name: 'Vàng', minSpent: 10000000, minOrders: 20, color: '#EAB308' },
            { level: 3, name: 'Kim cương', minSpent: 50000000, minOrders: 50, color: '#06B6D4' }
        ]
    }
}, {
    timestamps: true
});

export default mongoose.model('TierSettings', tierSettingsSchema);
