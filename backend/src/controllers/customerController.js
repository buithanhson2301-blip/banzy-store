import { Customer, Order } from '../models/index.js';

// Get all customers
export const getCustomers = async (req, res, next) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;

        const query = { shopId: req.shop._id };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [customers, total] = await Promise.all([
            Customer.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Customer.countDocuments(query)
        ]);

        res.json({
            customers,
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

// Get single customer
export const getCustomer = async (req, res, next) => {
    try {
        const customer = await Customer.findOne({
            _id: req.params.id,
            shopId: req.shop._id
        });

        if (!customer) {
            return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
        }

        res.json(customer);
    } catch (error) {
        next(error);
    }
};

// Create customer
export const createCustomer = async (req, res, next) => {
    try {
        const { name, email, phone, address, note } = req.body;

        // Check duplicate email
        if (email) {
            const existing = await Customer.findOne({ shopId: req.shop._id, email });
            if (existing) {
                return res.status(400).json({ message: 'Email đã tồn tại' });
            }
        }

        const customer = new Customer({
            shopId: req.shop._id,
            name,
            email,
            phone,
            address,
            note
        });

        await customer.save();
        res.status(201).json(customer);
    } catch (error) {
        next(error);
    }
};

// Update customer
export const updateCustomer = async (req, res, next) => {
    try {
        const { email, name, phone, address, provinceId, districtId, wardId, provinceName, districtName, wardName } = req.body;

        // Check duplicate email
        if (email) {
            const existing = await Customer.findOne({
                shopId: req.shop._id,
                email,
                _id: { $ne: req.params.id }
            });
            if (existing) {
                return res.status(400).json({ message: 'Email đã tồn tại' });
            }
        }

        const customer = await Customer.findOneAndUpdate(
            { _id: req.params.id, shopId: req.shop._id },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!customer) {
            return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
        }

        // Sync customer info to pending/processing/ready_to_ship orders (without tracking code)
        const syncableStatuses = ['pending', 'processing', 'ready_to_ship'];
        const updateFields = {};

        if (name !== undefined) updateFields.customerName = name;
        if (phone !== undefined) updateFields.customerPhone = phone;
        if (email !== undefined) updateFields.customerEmail = email;
        if (address !== undefined) updateFields.shippingAddress = address;
        if (provinceId !== undefined) updateFields.receiverProvinceId = provinceId;
        if (districtId !== undefined) updateFields.receiverDistrictId = districtId;
        if (wardId !== undefined) updateFields.receiverWardId = wardId;
        if (provinceName !== undefined) updateFields.receiverProvinceName = provinceName;
        if (districtName !== undefined) updateFields.receiverDistrictName = districtName;
        if (wardName !== undefined) updateFields.receiverWardName = wardName;

        // Only sync if there are fields to update
        let syncedOrdersCount = 0;
        if (Object.keys(updateFields).length > 0) {
            const syncResult = await Order.updateMany(
                {
                    shopId: req.shop._id,
                    customerId: req.params.id,
                    status: { $in: syncableStatuses },
                    trackingCode: { $exists: false } // Only sync orders not yet sent to shipping
                },
                { $set: updateFields }
            );
            syncedOrdersCount = syncResult.modifiedCount;
        }

        res.json({
            customer,
            syncedOrdersCount,
            message: syncedOrdersCount > 0
                ? `Đã cập nhật khách hàng và đồng bộ ${syncedOrdersCount} đơn hàng`
                : 'Đã cập nhật khách hàng'
        });
    } catch (error) {
        next(error);
    }
};

// Delete customer
export const deleteCustomer = async (req, res, next) => {
    try {
        // Check if customer has orders
        const orderCount = await Order.countDocuments({
            shopId: req.shop._id,
            customerId: req.params.id
        });

        if (orderCount > 0) {
            return res.status(400).json({
                message: 'Không thể xóa khách hàng đã có đơn hàng'
            });
        }

        const customer = await Customer.findOneAndDelete({
            _id: req.params.id,
            shopId: req.shop._id
        });

        if (!customer) {
            return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
        }

        res.json({ message: 'Đã xóa khách hàng' });
    } catch (error) {
        next(error);
    }
};

// Get customer order history
export const getCustomerOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({
            shopId: req.shop._id,
            customerId: req.params.id
        }).sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        next(error);
    }
};
