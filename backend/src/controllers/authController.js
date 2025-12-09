import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/index.js';
import { User, Shop } from '../models/index.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.js';

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn
    });
};

// Register new user + shop
export const register = async (req, res, next) => {
    try {
        const { email, password, name, shopName } = req.body;

        // Check if email exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email đã được sử dụng' });
        }

        // Create shop first
        const shop = new Shop({
            name: shopName || `Shop của ${name}`,
            ownerId: null // Will update after user creation
        });
        await shop.save();

        // Create user
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        const user = new User({
            email,
            password,
            name,
            shopId: shop._id,
            role: 'owner',
            emailVerificationToken,
            emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        });
        await user.save();

        // Update shop owner
        shop.ownerId = user._id;
        await shop.save();

        // Send verification email
        try {
            await sendVerificationEmail(email, name, emailVerificationToken);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
            token,
            user: user.toJSON(),
            shop: shop.toJSON()
        });
    } catch (error) {
        next(error);
    }
};

// Login
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email }).populate('shopId');
        if (!user) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            token,
            user: user.toJSON(),
            shop: user.shopId
        });
    } catch (error) {
        next(error);
    }
};

// Get current user
export const getMe = async (req, res) => {
    res.json({
        user: req.user,
        shop: req.shop
    });
};

// Verify email
export const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Link xác thực không hợp lệ hoặc đã hết hạn' });
        }

        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        res.json({ message: 'Email đã được xác thực thành công!' });
    } catch (error) {
        next(error);
    }
};

// Forgot password
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if email exists
            return res.json({ message: 'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = resetToken;
        user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();

        // Send reset email via Brevo
        try {
            await sendPasswordResetEmail(email, user.name, resetToken);
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
        }

        res.json({ message: 'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu' });
    } catch (error) {
        next(error);
    }
};

// Reset password
export const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn' });
        }

        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.json({ message: 'Mật khẩu đã được đặt lại thành công!' });
    } catch (error) {
        next(error);
    }
};

// Update shop settings
export const updateShop = async (req, res, next) => {
    try {
        const { name, description, phone, address } = req.body;
        const shop = req.shop;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ message: 'Tên shop không được để trống' });
        }

        shop.name = name.trim();
        if (description !== undefined) shop.description = description;
        if (phone !== undefined) shop.phone = phone;
        if (address !== undefined) shop.address = address;

        await shop.save();

        res.json({ message: 'Đã cập nhật thông tin shop', shop });
    } catch (error) {
        next(error);
    }
};

// Change password (for logged in users)
export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Vui lòng nhập đủ mật khẩu cũ và mới' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
        }

        const user = await User.findById(req.user._id);

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Đã đổi mật khẩu thành công!' });
    } catch (error) {
        next(error);
    }
};
