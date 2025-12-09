import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });

export default {
    port: process.env.PORT || 8080,
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/qalybaha',
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    brevoApiKey: process.env.BREVO_API_KEY,
    brevoSenderEmail: process.env.BREVO_SENDER_EMAIL || 'noreply@qalybaha.com',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    nodeEnv: process.env.NODE_ENV || 'development',

    // License settings
    trialDays: 14,

    // Plan limits
    plans: {
        free: {
            name: 'Miễn phí',
            maxProducts: 50,
            maxUsers: 1,
            canExport: false
        },
        premium: {
            name: 'Nâng cao',
            maxProducts: null, // unlimited
            maxUsers: 2,
            canExport: true
        }
    }
};
