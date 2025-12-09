import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
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
    description: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        default: 'Khác'
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    costPrice: {
        type: Number,
        default: 0,
        min: 0
    },
    quantity: {
        type: Number,
        default: 0,
        min: 0
    },
    minStock: {
        type: Number,
        default: 5
    },
    unit: {
        type: String,
        default: 'cái'
    },
    images: [String],
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Compound index for shop + code uniqueness
productSchema.index({ shopId: 1, code: 1 }, { unique: true, sparse: true });

// Check if low stock
productSchema.methods.isLowStock = function () {
    return this.quantity <= this.minStock;
};

export default mongoose.model('Product', productSchema);
