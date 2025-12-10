import mongoose from 'mongoose';
import crypto from 'crypto';

// Simple encryption for sensitive data
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'vtp-integration-key-32chars!!'; // 32 chars for AES-256
const ALGORITHM = 'aes-256-cbc';

function encrypt(text) {
    if (!text) return text;
    try {
        const iv = crypto.randomBytes(16);
        const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        return text;
    }
}

function decrypt(text) {
    if (!text || !text.includes(':')) return text;
    try {
        const parts = text.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encryptedText = parts[1];
        const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        return text;
    }
}

const shippingProviderSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
        index: true
    },
    provider: {
        type: String,
        enum: ['viettel_post', 'ghn', 'ghtk', 'jt_express', 'vnpost'],
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Encrypted credentials
    apiToken: {
        type: String,
        set: encrypt,
        get: decrypt
    },
    username: String,
    // Sender/Warehouse information
    senderInfo: {
        fullName: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        wardId: Number,      // Mã phường/xã
        districtId: Number,  // Mã quận/huyện  
        provinceId: Number,  // Mã tỉnh/thành
        wardName: String,
        districtName: String,
        provinceName: String
    },
    // Webhook configuration
    webhookSecret: String,
    webhookConfigured: {
        type: Boolean,
        default: false
    },
    // Last status check
    lastVerifiedAt: Date,
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'failed'],
        default: 'pending'
    }
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
});

// Compound index: one provider per shop
shippingProviderSchema.index({ shopId: 1, provider: 1 }, { unique: true });

// Method to get decrypted token
shippingProviderSchema.methods.getToken = function () {
    return this.apiToken;
};

// Static method to find active provider for a shop
shippingProviderSchema.statics.findActiveForShop = async function (shopId, provider) {
    return this.findOne({
        shopId,
        provider,
        isActive: true
    });
};

export default mongoose.model('ShippingProvider', shippingProviderSchema);
