import mongoose from 'mongoose';
import config from '../config/index.js';

const shopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
        // Auto-generated in pre-save hook
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        // Not required initially - set after user is created during registration
    },
    description: {
        type: String,
        default: ''
    },
    phone: String,
    address: String,
    license: {
        plan: {
            type: String,
            enum: ['free', 'premium'],
            default: 'free'
        },
        trialEndsAt: {
            type: Date,
            default: () => new Date(Date.now() + config.trialDays * 24 * 60 * 60 * 1000)
        },
        expiresAt: Date,
        status: {
            type: String,
            enum: ['trial', 'active', 'expired'],
            default: 'trial'
        }
    },
    settings: {
        currency: { type: String, default: 'VND' },
        lowStockThreshold: { type: Number, default: 5 }
    }
}, {
    timestamps: true
});

// Generate slug from name (before validation)
shopSchema.pre('validate', function (next) {
    if (!this.slug && this.name) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .concat('-', Date.now().toString(36));
    }
    next();
});

// Check if license is valid
shopSchema.methods.isLicenseValid = function () {
    const now = new Date();

    if (this.license.status === 'trial') {
        return now < this.license.trialEndsAt;
    }

    if (this.license.status === 'active') {
        return !this.license.expiresAt || now < this.license.expiresAt;
    }

    return false;
};

// Get plan limits
shopSchema.methods.getPlanLimits = function () {
    return config.plans[this.license.plan] || config.plans.free;
};

export default mongoose.model('Shop', shopSchema);
