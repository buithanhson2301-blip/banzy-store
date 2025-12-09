import { Product } from '../models/index.js';

// Get all products for shop
export const getProducts = async (req, res, next) => {
    try {
        const { search, category, status, page = 1, limit = 20 } = req.query;

        const query = { shopId: req.shop._id };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) query.category = category;
        if (status) query.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [products, total] = await Promise.all([
            Product.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Product.countDocuments(query)
        ]);

        res.json({
            products,
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

// Get single product
export const getProduct = async (req, res, next) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            shopId: req.shop._id
        });

        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        res.json(product);
    } catch (error) {
        next(error);
    }
};

// Create product
export const createProduct = async (req, res, next) => {
    try {
        const { name, code, description, category, price, costPrice, quantity, minStock, unit } = req.body;

        const product = new Product({
            shopId: req.shop._id,
            name,
            code: code || `SP${Date.now().toString().slice(-6)}`,
            description,
            category,
            price,
            costPrice,
            quantity,
            minStock,
            unit
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
};

// Update product
export const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, shopId: req.shop._id },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        res.json(product);
    } catch (error) {
        next(error);
    }
};

// Delete product (soft delete)
export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, shopId: req.shop._id },
            { $set: { status: 'inactive' } },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        res.json({ message: 'Đã xóa sản phẩm', product });
    } catch (error) {
        next(error);
    }
};

// Get categories
export const getCategories = async (req, res, next) => {
    try {
        const categories = await Product.distinct('category', {
            shopId: req.shop._id,
            status: 'active'
        });
        res.json(categories);
    } catch (error) {
        next(error);
    }
};

// Get low stock products
export const getLowStock = async (req, res, next) => {
    try {
        const products = await Product.find({
            shopId: req.shop._id,
            status: 'active',
            $expr: { $lte: ['$quantity', '$minStock'] }
        }).sort({ quantity: 1 });

        res.json(products);
    } catch (error) {
        next(error);
    }
};

// Update stock
export const updateStock = async (req, res, next) => {
    try {
        const { adjustment, reason } = req.body;

        const product = await Product.findOne({
            _id: req.params.id,
            shopId: req.shop._id
        });

        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        const newQuantity = product.quantity + parseInt(adjustment);
        if (newQuantity < 0) {
            return res.status(400).json({ message: 'Số lượng không thể âm' });
        }

        product.quantity = newQuantity;
        await product.save();

        res.json(product);
    } catch (error) {
        next(error);
    }
};
