import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        default: ''
    },
    note: {
        type: String,
        default: ''
    },
    totalOrders: {
        type: Number,
        default: 0
    },
    totalSpent: {
        type: Number,
        default: 0
    },
    tier: {
        type: Number,
        default: 0 // 0=Thường, 1=Bạc, 2=Vàng, 3=Kim cương
    }
}, {
    timestamps: true
});

// Compound index for shop + phone uniqueness
customerSchema.index({ shopId: 1, phone: 1 }, { unique: true });

export default mongoose.model('Customer', customerSchema);
