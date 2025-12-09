import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
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
    code: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true
    },
    address: {
        type: String,
        default: ''
    },
    contactPerson: {
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
    totalAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Compound index for shop + code uniqueness
supplierSchema.index({ shopId: 1, code: 1 }, { unique: true, sparse: true });

export default mongoose.model('Supplier', supplierSchema);
