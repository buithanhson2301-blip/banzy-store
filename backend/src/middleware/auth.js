import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { User, Shop } from '../models/index.js';

// Verify JWT token
export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Vui lòng đăng nhập' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.jwtSecret);

        const user = await User.findById(decoded.userId).populate('shopId');

        if (!user) {
            return res.status(401).json({ message: 'Người dùng không tồn tại' });
        }

        req.user = user;
        req.shop = user.shopId;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token không hợp lệ' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token đã hết hạn' });
        }
        next(error);
    }
};

// Check if license is valid
export const checkLicense = async (req, res, next) => {
    try {
        const shop = req.shop;

        if (!shop) {
            return res.status(403).json({ message: 'Shop không tồn tại' });
        }

        if (!shop.isLicenseValid()) {
            return res.status(403).json({
                message: 'License đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng.',
                code: 'LICENSE_EXPIRED'
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

// Check user role
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Bạn không có quyền thực hiện hành động này'
            });
        }
        next();
    };
};

// Check plan limits (e.g., max products)
export const checkPlanLimit = (limitType) => {
    return async (req, res, next) => {
        try {
            const shop = req.shop;
            const limits = shop.getPlanLimits();

            if (limitType === 'products' && limits.maxProducts) {
                const Product = (await import('../models/Product.js')).default;
                const count = await Product.countDocuments({ shopId: shop._id, status: 'active' });

                if (count >= limits.maxProducts) {
                    return res.status(403).json({
                        message: `Gói ${limits.name} giới hạn ${limits.maxProducts} sản phẩm. Vui lòng nâng cấp.`,
                        code: 'PLAN_LIMIT_REACHED'
                    });
                }
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
