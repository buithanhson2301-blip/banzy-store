import mongoose from 'mongoose';

const integrationSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
        index: true
    },
    platform: {
        type: String,
        enum: ['shopee', 'lazada', 'facebook'],
        required: true
    },
    status: {
        type: String,
        enum: ['disconnected', 'connected', 'error'],
        default: 'disconnected'
    },
    credentials: {
        // Shopee
        shopeeShopId: String,
        shopeeAccessToken: String,
        shopeeRefreshToken: String,
        shopeeTokenExpiry: Date,

        // Lazada
        lazadaSellerId: String,
        lazadaAccessToken: String,
        lazadaRefreshToken: String,
        lazadaTokenExpiry: Date,

        // Facebook
        facebookPageId: String,
        facebookAccessToken: String,
        facebookTokenExpiry: Date
    },
    settings: {
        autoSyncProducts: { type: Boolean, default: true },
        autoSyncOrders: { type: Boolean, default: true },
        syncInterval: { type: Number, default: 30 }, // minutes
        lastSyncAt: Date,
        lastError: String
    },
    stats: {
        totalProductsSynced: { type: Number, default: 0 },
        totalOrdersSynced: { type: Number, default: 0 },
        lastOrderSyncAt: Date,
        lastProductSyncAt: Date
    }
}, {
    timestamps: true
});

// Compound index for shop + platform uniqueness
integrationSchema.index({ shopId: 1, platform: 1 }, { unique: true });

// Hide sensitive data
integrationSchema.methods.toJSON = function () {
    const obj = this.toObject();
    if (obj.credentials) {
        // Mask tokens
        if (obj.credentials.shopeeAccessToken) obj.credentials.shopeeAccessToken = '***';
        if (obj.credentials.shopeeRefreshToken) obj.credentials.shopeeRefreshToken = '***';
        if (obj.credentials.lazadaAccessToken) obj.credentials.lazadaAccessToken = '***';
        if (obj.credentials.lazadaRefreshToken) obj.credentials.lazadaRefreshToken = '***';
        if (obj.credentials.facebookAccessToken) obj.credentials.facebookAccessToken = '***';
    }
    return obj;
};

export default mongoose.model('Integration', integrationSchema);
