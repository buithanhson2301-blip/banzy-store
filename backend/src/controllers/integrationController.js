import { Integration, Product, Order, Customer } from '../models/index.js';

// Get all integrations for shop
export const getIntegrations = async (req, res, next) => {
    try {
        const integrations = await Integration.find({ shopId: req.shop._id });

        // Return all platforms with their status
        const platforms = ['shopee', 'lazada', 'facebook'];
        const result = platforms.map(platform => {
            const integration = integrations.find(i => i.platform === platform);
            return integration ? integration.toJSON() : {
                platform,
                status: 'disconnected',
                shopId: req.shop._id
            };
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
};

// Get single integration
export const getIntegration = async (req, res, next) => {
    try {
        const { platform } = req.params;

        let integration = await Integration.findOne({
            shopId: req.shop._id,
            platform
        });

        if (!integration) {
            return res.json({
                platform,
                status: 'disconnected',
                shopId: req.shop._id
            });
        }

        res.json(integration);
    } catch (error) {
        next(error);
    }
};

// Connect platform (simulate OAuth flow)
export const connectPlatform = async (req, res, next) => {
    try {
        const { platform } = req.params;
        const { shopId: platformShopId, accessToken, refreshToken } = req.body;

        if (!['shopee', 'lazada', 'facebook'].includes(platform)) {
            return res.status(400).json({ message: 'Platform không hợp lệ' });
        }

        let integration = await Integration.findOne({ shopId: req.shop._id, platform });

        if (!integration) {
            integration = new Integration({
                shopId: req.shop._id,
                platform
            });
        }

        // Set credentials based on platform
        const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        switch (platform) {
            case 'shopee':
                integration.credentials.shopeeShopId = platformShopId;
                integration.credentials.shopeeAccessToken = accessToken || 'demo_token';
                integration.credentials.shopeeRefreshToken = refreshToken || 'demo_refresh';
                integration.credentials.shopeeTokenExpiry = tokenExpiry;
                break;
            case 'lazada':
                integration.credentials.lazadaSellerId = platformShopId;
                integration.credentials.lazadaAccessToken = accessToken || 'demo_token';
                integration.credentials.lazadaRefreshToken = refreshToken || 'demo_refresh';
                integration.credentials.lazadaTokenExpiry = tokenExpiry;
                break;
            case 'facebook':
                integration.credentials.facebookPageId = platformShopId;
                integration.credentials.facebookAccessToken = accessToken || 'demo_token';
                integration.credentials.facebookTokenExpiry = tokenExpiry;
                break;
        }

        integration.status = 'connected';
        await integration.save();

        res.json({
            message: `Đã kết nối ${platform} thành công`,
            integration: integration.toJSON()
        });
    } catch (error) {
        next(error);
    }
};

// Disconnect platform
export const disconnectPlatform = async (req, res, next) => {
    try {
        const { platform } = req.params;

        const integration = await Integration.findOne({
            shopId: req.shop._id,
            platform
        });

        if (!integration) {
            return res.status(404).json({ message: 'Chưa kết nối platform này' });
        }

        integration.status = 'disconnected';
        integration.credentials = {};
        await integration.save();

        res.json({ message: `Đã ngắt kết nối ${platform}` });
    } catch (error) {
        next(error);
    }
};

// Update integration settings
export const updateSettings = async (req, res, next) => {
    try {
        const { platform } = req.params;
        const { autoSyncProducts, autoSyncOrders, syncInterval } = req.body;

        const integration = await Integration.findOne({
            shopId: req.shop._id,
            platform
        });

        if (!integration) {
            return res.status(404).json({ message: 'Chưa kết nối platform này' });
        }

        if (autoSyncProducts !== undefined) integration.settings.autoSyncProducts = autoSyncProducts;
        if (autoSyncOrders !== undefined) integration.settings.autoSyncOrders = autoSyncOrders;
        if (syncInterval !== undefined) integration.settings.syncInterval = syncInterval;

        await integration.save();
        res.json(integration);
    } catch (error) {
        next(error);
    }
};

// Sync products (demo - in real app would call platform API)
export const syncProducts = async (req, res, next) => {
    try {
        const { platform } = req.params;

        const integration = await Integration.findOne({
            shopId: req.shop._id,
            platform,
            status: 'connected'
        });

        if (!integration) {
            return res.status(400).json({ message: 'Chưa kết nối hoặc kết nối đã hết hạn' });
        }

        // Demo: Get products from our system and "sync" to platform
        const products = await Product.find({ shopId: req.shop._id, status: 'active' });

        // In real implementation, this would push to Shopee/Lazada/Facebook API
        integration.stats.totalProductsSynced = products.length;
        integration.stats.lastProductSyncAt = new Date();
        integration.settings.lastSyncAt = new Date();
        await integration.save();

        res.json({
            message: `Đã đồng bộ ${products.length} sản phẩm lên ${platform}`,
            syncedCount: products.length
        });
    } catch (error) {
        next(error);
    }
};

// Sync orders (demo - in real app would call platform API)
export const syncOrders = async (req, res, next) => {
    try {
        const { platform } = req.params;

        const integration = await Integration.findOne({
            shopId: req.shop._id,
            platform,
            status: 'connected'
        });

        if (!integration) {
            return res.status(400).json({ message: 'Chưa kết nối hoặc kết nối đã hết hạn' });
        }

        // Demo: simulate fetching orders from platform
        // In real implementation, this would pull from Shopee/Lazada API
        const demoOrders = [
            { orderCode: `${platform.toUpperCase()}-${Date.now()}`, total: 500000, status: 'pending' }
        ];

        // For demo, we'll just update the stats
        integration.stats.totalOrdersSynced += demoOrders.length;
        integration.stats.lastOrderSyncAt = new Date();
        integration.settings.lastSyncAt = new Date();
        await integration.save();

        res.json({
            message: `Đã đồng bộ ${demoOrders.length} đơn hàng từ ${platform}`,
            syncedCount: demoOrders.length,
            orders: demoOrders
        });
    } catch (error) {
        next(error);
    }
};
