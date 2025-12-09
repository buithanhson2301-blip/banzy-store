import { Order, Product, Customer } from '../models/index.js';
import { updateCustomerTier } from './tierController.js';

// Status transition rules
const STATUS_TRANSITIONS = {
    pending: ['processing', 'cancelled'],
    processing: ['shipping', 'cancelled'],
    shipping: ['completed', 'cancelled'],
    completed: [],
    cancelled: []
};

// Get all orders
export const getOrders = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20, startDate, endDate } = req.query;

        const query = { shopId: req.shop._id };

        if (status) query.status = status;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [orders, total] = await Promise.all([
            Order.find(query)
                .populate('customerId', 'name phone email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Order.countDocuments(query)
        ]);

        res.json({
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get single order
export const getOrder = async (req, res, next) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            shopId: req.shop._id
        }).populate('customerId');

        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        res.json(order);
    } catch (error) {
        next(error);
    }
};

// Create order
export const createOrder = async (req, res, next) => {
    try {
        const {
            customerId, customerName, customerPhone, customerEmail, customerSource, paymentMethod,
            shippingAddress, items, discount = 0, shippingFee = 0, note,
            saveCustomer = true // New flag to auto-save customer
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Đơn hàng phải có ít nhất 1 sản phẩm' });
        }

        // Validate and prepare items
        const orderItems = [];
        let subtotal = 0;

        for (const item of items) {
            const product = await Product.findOne({
                _id: item.productId,
                shopId: req.shop._id,
                status: 'active'
            });

            if (!product) {
                return res.status(400).json({
                    message: `Sản phẩm không tồn tại`
                });
            }

            if (product.quantity < item.quantity) {
                return res.status(400).json({
                    message: `${product.name} không đủ số lượng (còn ${product.quantity})`
                });
            }

            orderItems.push({
                productId: product._id,
                productName: product.name,
                price: product.price,
                quantity: item.quantity
            });

            subtotal += product.price * item.quantity;

            // Reduce stock
            product.quantity -= item.quantity;
            await product.save();
        }

        // Get or create customer
        let customer = null;
        let finalCustomerId = customerId || null;

        if (customerId) {
            // Existing customer
            customer = await Customer.findById(customerId);
        } else if (customerName && customerPhone && saveCustomer) {
            // Check if customer with same phone exists
            customer = await Customer.findOne({
                shopId: req.shop._id,
                phone: customerPhone
            });

            if (!customer) {
                // Create new customer
                customer = new Customer({
                    shopId: req.shop._id,
                    name: customerName,
                    phone: customerPhone,
                    email: customerEmail || '',
                    address: shippingAddress || ''
                });
                await customer.save();
            }
            finalCustomerId = customer._id;
        }

        const order = new Order({
            shopId: req.shop._id,
            customerId: finalCustomerId,
            customerName: customerName || customer?.name || '',
            customerPhone: customerPhone || customer?.phone || '',
            customerEmail: customerEmail || customer?.email || '',
            customerSource: customerSource || 'instagram',
            paymentMethod: paymentMethod || 'cod',
            shippingAddress,
            items: orderItems,
            subtotal,
            discount,
            shippingFee,
            total: subtotal - discount + shippingFee,
            note,
            createdBy: req.user._id,
            statusHistory: [{
                status: 'pending',
                note: 'Đơn hàng được tạo',
                changedBy: req.user._id
            }]
        });

        await order.save();

        // Update customer stats
        if (customer) {
            customer.totalOrders += 1;
            await customer.save();
        }

        res.status(201).json(order);
    } catch (error) {
        next(error);
    }
};

// Update order status
export const updateOrderStatus = async (req, res, next) => {
    try {
        const { status, note } = req.body;

        const order = await Order.findOne({
            _id: req.params.id,
            shopId: req.shop._id
        });

        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        // Check valid transition
        const allowedTransitions = STATUS_TRANSITIONS[order.status] || [];
        if (!allowedTransitions.includes(status)) {
            return res.status(400).json({
                message: `Không thể chuyển từ "${order.status}" sang "${status}"`
            });
        }

        order.status = status;
        order.statusHistory.push({
            status,
            note: note || '',
            changedBy: req.user._id
        });

        // If completed, update customer total spent and tier
        if (status === 'completed' && order.customerId) {
            await Customer.findByIdAndUpdate(order.customerId, {
                $inc: { totalSpent: order.total }
            });
            // Update customer tier based on new spending
            await updateCustomerTier(order.customerId, req.shop._id);
        }

        await order.save();
        res.json(order);
    } catch (error) {
        next(error);
    }
};

// Cancel order
export const cancelOrder = async (req, res, next) => {
    try {
        const { reason } = req.body;

        const order = await Order.findOne({
            _id: req.params.id,
            shopId: req.shop._id
        });

        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        if (order.status === 'completed' || order.status === 'cancelled') {
            return res.status(400).json({ message: 'Không thể hủy đơn hàng này' });
        }

        // Restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { quantity: item.quantity }
            });
        }

        order.status = 'cancelled';
        order.statusHistory.push({
            status: 'cancelled',
            note: reason || 'Đơn hàng bị hủy',
            changedBy: req.user._id
        });

        await order.save();
        res.json(order);
    } catch (error) {
        next(error);
    }
};

// Get order stats
export const getOrderStats = async (req, res, next) => {
    try {
        const stats = await Order.aggregate([
            { $match: { shopId: req.shop._id } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    total: { $sum: '$total' }
                }
            }
        ]);

        res.json(stats);
    } catch (error) {
        next(error);
    }
};
