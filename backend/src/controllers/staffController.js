import { User, Shop } from '../models/index.js';
import bcrypt from 'bcryptjs';

// Get all staff for shop
export const getStaff = async (req, res, next) => {
    try {
        const staff = await User.find({
            shopId: req.shop._id,
            _id: { $ne: req.user._id } // Exclude current user
        }).select('-password');

        res.json(staff);
    } catch (error) {
        next(error);
    }
};

// Invite new staff
export const inviteStaff = async (req, res, next) => {
    try {
        const { email, name, role, password } = req.body;

        // Check plan limits
        const limits = req.shop.getPlanLimits();
        const currentUserCount = await User.countDocuments({ shopId: req.shop._id });

        if (limits.maxUsers && currentUserCount >= limits.maxUsers) {
            return res.status(403).json({
                message: `Gói ${limits.name} giới hạn ${limits.maxUsers} người dùng. Vui lòng nâng cấp.`,
                code: 'PLAN_LIMIT_REACHED'
            });
        }

        // Check if email exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email đã được sử dụng' });
        }

        // Validate role
        if (!['staff', 'accountant'].includes(role)) {
            return res.status(400).json({ message: 'Role không hợp lệ' });
        }

        // Create user
        const user = new User({
            email,
            password: password || 'changeme123', // Default password
            name,
            shopId: req.shop._id,
            role,
            emailVerified: true // Skip verification for invited users
        });

        await user.save();

        res.status(201).json({
            message: 'Đã thêm nhân viên thành công',
            user: user.toJSON()
        });
    } catch (error) {
        next(error);
    }
};

// Update staff
export const updateStaff = async (req, res, next) => {
    try {
        const { name, role, email } = req.body;
        const { id } = req.params;

        const user = await User.findOne({ _id: id, shopId: req.shop._id });

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
        }

        // Can't change owner role
        if (user.role === 'owner') {
            return res.status(400).json({ message: 'Không thể thay đổi vai trò của chủ shop' });
        }

        if (name) user.name = name;
        if (role && ['staff', 'accountant'].includes(role)) user.role = role;
        if (email && email !== user.email) {
            const existing = await User.findOne({ email, _id: { $ne: id } });
            if (existing) {
                return res.status(400).json({ message: 'Email đã được sử dụng' });
            }
            user.email = email;
        }

        await user.save();
        res.json(user.toJSON());
    } catch (error) {
        next(error);
    }
};

// Delete staff
export const deleteStaff = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await User.findOne({ _id: id, shopId: req.shop._id });

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
        }

        if (user.role === 'owner') {
            return res.status(400).json({ message: 'Không thể xóa chủ shop' });
        }

        await User.findByIdAndDelete(id);
        res.json({ message: 'Đã xóa nhân viên' });
    } catch (error) {
        next(error);
    }
};

// Reset staff password
export const resetStaffPassword = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        const user = await User.findOne({ _id: id, shopId: req.shop._id });

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
        }

        user.password = newPassword || 'changeme123';
        await user.save();

        res.json({ message: 'Đã đặt lại mật khẩu' });
    } catch (error) {
        next(error);
    }
};
