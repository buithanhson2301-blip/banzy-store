import ShippingProvider from '../models/ShippingProvider.js';
import { Order } from '../models/index.js';
import * as viettelPostService from '../services/viettelPostService.js';

/**
 * Get shipping provider settings for current shop
 */
export const getShippingSettings = async (req, res, next) => {
    try {
        const settings = await ShippingProvider.find({
            shopId: req.shop._id
        });

        // Don't expose raw token in response
        const safeSettings = settings.map(s => ({
            _id: s._id,
            provider: s.provider,
            isActive: s.isActive,
            hasToken: !!s.apiToken,
            senderInfo: s.senderInfo,
            webhookConfigured: s.webhookConfigured,
            verificationStatus: s.verificationStatus,
            lastVerifiedAt: s.lastVerifiedAt,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt
        }));

        res.json(safeSettings);
    } catch (error) {
        next(error);
    }
};

/**
 * Get settings for a specific provider
 */
export const getProviderSettings = async (req, res, next) => {
    try {
        const { provider } = req.params;

        const settings = await ShippingProvider.findOne({
            shopId: req.shop._id,
            provider
        });

        if (!settings) {
            return res.json({
                provider,
                isConfigured: false,
                isActive: false
            });
        }

        res.json({
            _id: settings._id,
            provider: settings.provider,
            isConfigured: true,
            isActive: settings.isActive,
            hasToken: !!settings.apiToken,
            senderInfo: settings.senderInfo,
            webhookConfigured: settings.webhookConfigured,
            verificationStatus: settings.verificationStatus,
            updatedAt: settings.updatedAt
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Save/Update shipping provider settings
 */
export const saveShippingSettings = async (req, res, next) => {
    try {
        const { provider } = req.params;
        const { apiToken, senderInfo, isActive } = req.body;

        // Validate provider
        const validProviders = ['viettel_post', 'ghn', 'ghtk', 'jt_express', 'vnpost'];
        if (!validProviders.includes(provider)) {
            return res.status(400).json({
                message: 'Đơn vị vận chuyển không hợp lệ'
            });
        }

        // Validate required sender info
        if (senderInfo) {
            if (!senderInfo.fullName || !senderInfo.phone || !senderInfo.address) {
                return res.status(400).json({
                    message: 'Vui lòng điền đầy đủ thông tin người gửi'
                });
            }
        }

        // Find existing or create new
        let settings = await ShippingProvider.findOne({
            shopId: req.shop._id,
            provider
        });

        if (settings) {
            // Update existing
            if (apiToken) settings.apiToken = apiToken;
            if (senderInfo) settings.senderInfo = senderInfo;
            if (typeof isActive === 'boolean') settings.isActive = isActive;
            settings.verificationStatus = 'pending'; // Reset verification
        } else {
            // Create new
            settings = new ShippingProvider({
                shopId: req.shop._id,
                provider,
                apiToken,
                senderInfo,
                isActive: isActive !== false
            });
        }

        await settings.save();

        res.json({
            message: 'Đã lưu cấu hình thành công',
            provider: settings.provider,
            isActive: settings.isActive,
            hasToken: !!settings.apiToken,
            senderInfo: settings.senderInfo
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Verify token by making a test API call
 */
export const verifyToken = async (req, res, next) => {
    try {
        const { provider } = req.params;

        const settings = await ShippingProvider.findOne({
            shopId: req.shop._id,
            provider
        });

        if (!settings || !settings.apiToken) {
            return res.status(400).json({
                message: 'Chưa cấu hình token cho đơn vị vận chuyển này'
            });
        }

        // Test by getting provinces list
        if (provider === 'viettel_post') {
            const result = await viettelPostService.getProvinces();

            if (result.success && result.provinces.length > 0) {
                settings.verificationStatus = 'verified';
                settings.lastVerifiedAt = new Date();
                await settings.save();

                return res.json({
                    success: true,
                    message: 'Token hợp lệ! Đã kết nối thành công với Viettel Post',
                    provincesCount: result.provinces.length
                });
            } else {
                settings.verificationStatus = 'failed';
                await settings.save();

                return res.status(400).json({
                    success: false,
                    message: 'Không thể kết nối với Viettel Post. Vui lòng kiểm tra lại token.'
                });
            }
        }

        res.status(400).json({ message: 'Chưa hỗ trợ đơn vị vận chuyển này' });
    } catch (error) {
        next(error);
    }
};

/**
 * Send order to shipping provider
 */
export const sendOrderToShipping = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { provider = 'viettel_post' } = req.body;

        // Get order
        const order = await Order.findOne({
            _id: orderId,
            shopId: req.shop._id
        });

        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        if (order.trackingCode) {
            return res.status(400).json({
                message: 'Đơn hàng đã được gửi cho đơn vị vận chuyển',
                trackingCode: order.trackingCode
            });
        }

        // Get shipping provider settings
        const settings = await ShippingProvider.findActiveForShop(req.shop._id, provider);

        if (!settings) {
            return res.status(400).json({
                message: 'Chưa cấu hình đơn vị vận chuyển. Vui lòng vào Cài đặt > Vận chuyển để cấu hình.'
            });
        }

        if (!settings.apiToken) {
            return res.status(400).json({
                message: 'Chưa có API token. Vui lòng cấu hình token trong phần Cài đặt.'
            });
        }

        // Create shipping order
        const result = await viettelPostService.createShippingOrder(
            order,
            settings.senderInfo,
            settings.getToken()
        );

        if (!result.success) {
            return res.status(400).json({
                message: result.error || 'Không thể tạo đơn vận chuyển'
            });
        }

        // Update order with shipping info
        order.shippingProvider = provider;
        order.trackingCode = result.trackingCode;
        order.shippingOrderId = result.shippingOrderId;
        order.shippingStatus = 'Đã tiếp nhận';
        order.shippingStatusCode = 100;
        order.estimatedDelivery = result.estimatedDelivery;
        order.shippingUpdatedAt = new Date();

        // Update status if still pending/processing
        if (['pending', 'processing'].includes(order.status)) {
            order.status = 'shipping';
            order.statusHistory.push({
                status: 'shipping',
                note: `Đã gửi cho ${provider === 'viettel_post' ? 'Viettel Post' : provider}. Mã vận đơn: ${result.trackingCode}`,
                changedBy: req.user._id
            });
        }

        await order.save();

        res.json({
            success: true,
            message: 'Đã tạo đơn vận chuyển thành công',
            trackingCode: result.trackingCode,
            estimatedDelivery: result.estimatedDelivery,
            shippingFee: result.shippingFee
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Track order status from shipping provider
 */
export const trackOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findOne({
            _id: orderId,
            shopId: req.shop._id
        });

        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        if (!order.trackingCode || !order.shippingProvider) {
            return res.status(400).json({
                message: 'Đơn hàng chưa được gửi cho đơn vị vận chuyển'
            });
        }

        // Get shipping provider settings
        const settings = await ShippingProvider.findActiveForShop(
            req.shop._id,
            order.shippingProvider
        );

        if (!settings) {
            return res.status(400).json({ message: 'Không tìm thấy cấu hình vận chuyển' });
        }

        // Get status from VTP
        const result = await viettelPostService.getOrderStatus(
            order.trackingCode,
            settings.getToken()
        );

        if (!result.success) {
            return res.status(400).json({ message: result.error });
        }

        // Update order if status changed
        if (order.shippingStatusCode !== result.statusCode) {
            order.shippingStatus = result.statusLabel;
            order.shippingStatusCode = result.statusCode;
            order.shippingUpdatedAt = new Date();

            // Update main status based on shipping status
            if (result.status !== order.status) {
                order.status = result.status;
                order.statusHistory.push({
                    status: result.status,
                    note: `Cập nhật từ Viettel Post: ${result.statusLabel}`,
                    changedBy: null // System update
                });
            }

            await order.save();
        }

        res.json({
            success: true,
            trackingCode: order.trackingCode,
            shippingStatus: result.statusLabel,
            shippingStatusCode: result.statusCode,
            systemStatus: result.status,
            updatedAt: order.shippingUpdatedAt
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Cancel shipping order
 */
export const cancelShipping = async (req, res, next) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findOne({
            _id: orderId,
            shopId: req.shop._id
        });

        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        if (!order.trackingCode) {
            return res.status(400).json({ message: 'Đơn hàng chưa có mã vận đơn' });
        }

        const settings = await ShippingProvider.findActiveForShop(
            req.shop._id,
            order.shippingProvider
        );

        if (!settings) {
            return res.status(400).json({ message: 'Không tìm thấy cấu hình vận chuyển' });
        }

        const result = await viettelPostService.cancelShippingOrder(
            order.trackingCode,
            settings.getToken()
        );

        if (!result.success) {
            return res.status(400).json({ message: result.error });
        }

        // Update order
        order.shippingStatus = 'Đã hủy';
        order.shippingStatusCode = 502;
        order.shippingUpdatedAt = new Date();
        order.statusHistory.push({
            status: order.status,
            note: 'Đã hủy vận chuyển trên Viettel Post',
            changedBy: req.user._id
        });

        await order.save();

        res.json({
            success: true,
            message: 'Đã hủy đơn vận chuyển'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Calculate shipping fee
 */
export const calculateFee = async (req, res, next) => {
    try {
        const {
            receiverProvinceId,
            receiverDistrictId,
            weight = 500,
            productPrice = 0,
            codAmount = 0,
            provider = 'viettel_post'
        } = req.body;

        const settings = await ShippingProvider.findActiveForShop(req.shop._id, provider);

        if (!settings) {
            return res.status(400).json({
                message: 'Chưa cấu hình đơn vị vận chuyển'
            });
        }

        const result = await viettelPostService.calculateShippingFee({
            senderProvinceId: settings.senderInfo.provinceId,
            senderDistrictId: settings.senderInfo.districtId,
            receiverProvinceId,
            receiverDistrictId,
            weight,
            productPrice,
            codAmount
        }, settings.getToken());

        if (!result.success) {
            return res.status(400).json({ message: result.error });
        }

        res.json({
            success: true,
            fee: result.fee,
            details: result.feeDetails
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get location data (provinces, districts, wards)
 */
export const getProvinces = async (req, res, next) => {
    try {
        const result = await viettelPostService.getProvinces();
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getDistricts = async (req, res, next) => {
    try {
        const { provinceId } = req.params;
        const result = await viettelPostService.getDistricts(provinceId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getWards = async (req, res, next) => {
    try {
        const { districtId } = req.params;
        const result = await viettelPostService.getWards(districtId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
