import { Supplier } from '../models/index.js';

// Get all suppliers
export const getSuppliers = async (req, res, next) => {
    try {
        const { search, status, page = 1, limit = 20 } = req.query;

        const query = { shopId: req.shop._id };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) query.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [suppliers, total] = await Promise.all([
            Supplier.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Supplier.countDocuments(query)
        ]);

        res.json({
            suppliers,
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

// Get single supplier
export const getSupplier = async (req, res, next) => {
    try {
        const supplier = await Supplier.findOne({
            _id: req.params.id,
            shopId: req.shop._id
        });

        if (!supplier) {
            return res.status(404).json({ message: 'Không tìm thấy nhà cung cấp' });
        }

        res.json(supplier);
    } catch (error) {
        next(error);
    }
};

// Create supplier
export const createSupplier = async (req, res, next) => {
    try {
        const { name, code, phone, email, address, contactPerson, note } = req.body;

        const supplier = new Supplier({
            shopId: req.shop._id,
            name,
            code: code || `NCC${Date.now().toString().slice(-6)}`,
            phone,
            email,
            address,
            contactPerson,
            note
        });

        await supplier.save();
        res.status(201).json(supplier);
    } catch (error) {
        next(error);
    }
};

// Update supplier
export const updateSupplier = async (req, res, next) => {
    try {
        const supplier = await Supplier.findOneAndUpdate(
            { _id: req.params.id, shopId: req.shop._id },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!supplier) {
            return res.status(404).json({ message: 'Không tìm thấy nhà cung cấp' });
        }

        res.json(supplier);
    } catch (error) {
        next(error);
    }
};

// Delete supplier
export const deleteSupplier = async (req, res, next) => {
    try {
        const supplier = await Supplier.findOneAndDelete({
            _id: req.params.id,
            shopId: req.shop._id
        });

        if (!supplier) {
            return res.status(404).json({ message: 'Không tìm thấy nhà cung cấp' });
        }

        res.json({ message: 'Đã xóa nhà cung cấp' });
    } catch (error) {
        next(error);
    }
};
