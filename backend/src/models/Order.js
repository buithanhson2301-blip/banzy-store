import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: String,
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    }
}, { _id: false });

const statusHistorySchema = new mongoose.Schema({
    status: String,
    note: String,
    changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    changedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
        index: true
    },
    orderCode: {
        type: String
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    customerName: String,
    customerPhone: String,
    customerEmail: String,
    customerSource: {
        type: String,
        enum: ['instagram', 'facebook', 'other'],
        default: 'instagram'
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'transfer', 'cash'],
        default: 'cod'
    },
    shippingAddress: {
        type: String,
        required: true
    },
    items: [orderItemSchema],
    subtotal: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    shippingFee: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    // Shipping provider info
    shippingProvider: {
        type: String,
        enum: ['viettel_post', 'ghn', 'ghtk', 'jt_express', 'vnpost', 'manual', null],
        default: null
    },
    trackingCode: String,           // Mã vận đơn từ ĐVVC
    shippingOrderId: String,        // ID đơn trên hệ thống ĐVVC
    shippingStatus: String,         // Trạng thái chi tiết từ ĐVVC
    shippingStatusCode: Number,     // Mã trạng thái từ ĐVVC
    estimatedDelivery: Date,        // Ngày giao dự kiến
    actualDelivery: Date,           // Ngày giao thực tế
    shippingUpdatedAt: Date,        // Lần cập nhật cuối từ webhook
    status: {
        type: String,
        enum: ['pending', 'processing', 'ready_to_ship', 'shipping', 'delivered', 'completed', 'cancelled', 'returned'],
        default: 'pending'
    },
    note: String,
    statusHistory: [statusHistorySchema],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Compound index for shop + orderCode
orderSchema.index({ shopId: 1, orderCode: 1 }, { unique: true });
orderSchema.index({ shopId: 1, status: 1 });
orderSchema.index({ shopId: 1, createdAt: -1 });

// Generate order code before save
orderSchema.pre('save', function (next) {
    if (!this.orderCode) {
        this.orderCode = 'DH' + Date.now().toString().slice(-8);
    }
    next();
});

export default mongoose.model('Order', orderSchema);
