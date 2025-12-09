import { Order, Product, Customer } from '../models/index.js';

// Get dashboard stats
export const getDashboardStats = async (req, res, next) => {
    try {
        const shopId = req.shop._id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalProducts,
            activeProducts,
            lowStockProducts,
            totalCustomers,
            totalOrders,
            todayOrders,
            ordersByStatus,
            revenueStats
        ] = await Promise.all([
            Product.countDocuments({ shopId }),
            Product.countDocuments({ shopId, status: 'active' }),
            Product.countDocuments({
                shopId,
                status: 'active',
                $expr: { $lte: ['$quantity', '$minStock'] }
            }),
            Customer.countDocuments({ shopId }),
            Order.countDocuments({ shopId }),
            Order.countDocuments({ shopId, createdAt: { $gte: today } }),
            Order.aggregate([
                { $match: { shopId } },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            Order.aggregate([
                { $match: { shopId, status: 'completed' } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$total' },
                        orderCount: { $sum: 1 }
                    }
                }
            ])
        ]);

        // Today's revenue
        const todayRevenue = await Order.aggregate([
            {
                $match: {
                    shopId,
                    status: 'completed',
                    createdAt: { $gte: today }
                }
            },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);

        res.json({
            products: {
                total: totalProducts,
                active: activeProducts,
                lowStock: lowStockProducts
            },
            customers: {
                total: totalCustomers
            },
            orders: {
                total: totalOrders,
                today: todayOrders,
                byStatus: ordersByStatus.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {})
            },
            revenue: {
                total: revenueStats[0]?.totalRevenue || 0,
                today: todayRevenue[0]?.total || 0,
                completedOrders: revenueStats[0]?.orderCount || 0
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get revenue by date range
export const getRevenueReport = async (req, res, next) => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;
        const shopId = req.shop._id;

        const matchStage = {
            shopId,
            status: 'completed'
        };

        if (startDate || endDate) {
            matchStage.createdAt = {};
            if (startDate) matchStage.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const endDateTime = new Date(endDate);
                endDateTime.setHours(23, 59, 59, 999);
                matchStage.createdAt.$lte = endDateTime;
            }
        }

        let groupFormat;
        switch (groupBy) {
            case 'month':
                groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
                break;
            case 'week':
                groupFormat = { $dateToString: { format: '%Y-W%V', date: '$createdAt' } };
                break;
            default:
                groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        }

        const report = await Order.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: groupFormat,
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 },
                    avgOrderValue: { $avg: '$total' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const totals = await Order.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$total' },
                    totalOrders: { $sum: 1 },
                    avgOrderValue: { $avg: '$total' }
                }
            }
        ]);

        res.json({
            data: report,
            totals: totals[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 }
        });
    } catch (error) {
        next(error);
    }
};

// Get top products
export const getTopProducts = async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;
        const shopId = req.shop._id;

        const topProducts = await Order.aggregate([
            { $match: { shopId, status: 'completed' } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.productId',
                    productName: { $first: '$items.productName' },
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: parseInt(limit) }
        ]);

        res.json(topProducts);
    } catch (error) {
        next(error);
    }
};

// Get recent orders
export const getRecentOrders = async (req, res, next) => {
    try {
        const { limit = 5 } = req.query;

        const orders = await Order.find({ shopId: req.shop._id })
            .populate('customerId', 'name phone')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json(orders);
    } catch (error) {
        next(error);
    }
};
