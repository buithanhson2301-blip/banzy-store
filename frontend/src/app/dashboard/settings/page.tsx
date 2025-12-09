'use client';

import { useState } from 'react';
import { Settings, Store, Lock, Save, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const { shop, setShop } = useAuthStore();

    // Shop settings
    const [shopData, setShopData] = useState({
        name: shop?.name || '',
        description: shop?.description || '',
        phone: shop?.phone || '',
        address: shop?.address || ''
    });
    const [isSavingShop, setIsSavingShop] = useState(false);

    // Password settings
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const handleShopSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingShop(true);
        try {
            const { data } = await authAPI.updateShop(shopData);
            setShop(data.shop);
            toast.success(data.message);
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra');
        } finally {
            setIsSavingShop(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Mật khẩu mới không khớp');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        setIsSavingPassword(true);
        try {
            const { data } = await authAPI.changePassword(
                passwordData.currentPassword,
                passwordData.newPassword
            );
            toast.success(data.message);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra');
        } finally {
            setIsSavingPassword(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-3xl">
            <div className="flex items-center gap-3">
                <Settings className="w-8 h-8 text-primary-400" />
                <h1 className="text-2xl font-bold">Cài đặt tài khoản</h1>
            </div>

            {/* Shop Settings */}
            <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Store className="w-6 h-6 text-primary-400" />
                    <h2 className="text-lg font-semibold">Thông tin Shop</h2>
                </div>

                <form onSubmit={handleShopSubmit} className="space-y-4">
                    <div>
                        <label className="label">Tên Shop *</label>
                        <input
                            className="input"
                            required
                            value={shopData.name}
                            onChange={(e) => setShopData({ ...shopData, name: e.target.value })}
                            placeholder="Tên shop của bạn"
                        />
                    </div>

                    <div>
                        <label className="label">Mô tả</label>
                        <textarea
                            className="input"
                            rows={3}
                            value={shopData.description}
                            onChange={(e) => setShopData({ ...shopData, description: e.target.value })}
                            placeholder="Mô tả ngắn về shop..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Số điện thoại</label>
                            <input
                                className="input"
                                value={shopData.phone}
                                onChange={(e) => setShopData({ ...shopData, phone: e.target.value })}
                                placeholder="0909..."
                            />
                        </div>
                        <div>
                            <label className="label">Địa chỉ</label>
                            <input
                                className="input"
                                value={shopData.address}
                                onChange={(e) => setShopData({ ...shopData, address: e.target.value })}
                                placeholder="Địa chỉ shop"
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={isSavingShop}>
                        {isSavingShop ? (
                            <span className="animate-spin">⏳</span>
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        Lưu thay đổi
                    </button>
                </form>
            </div>

            {/* Password Settings */}
            <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Lock className="w-6 h-6 text-yellow-400" />
                    <h2 className="text-lg font-semibold">Đổi mật khẩu</h2>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="relative">
                        <label className="label">Mật khẩu hiện tại *</label>
                        <input
                            type={showPasswords.current ? 'text' : 'password'}
                            className="input pr-10"
                            required
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-9 text-dark-400 hover:text-white"
                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        >
                            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <label className="label">Mật khẩu mới *</label>
                            <input
                                type={showPasswords.new ? 'text' : 'password'}
                                className="input pr-10"
                                required
                                minLength={6}
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-9 text-dark-400 hover:text-white"
                                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            >
                                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        <div className="relative">
                            <label className="label">Xác nhận mật khẩu *</label>
                            <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                className="input pr-10"
                                required
                                minLength={6}
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-9 text-dark-400 hover:text-white"
                                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                            >
                                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <p className="text-sm text-dark-400">
                        Mật khẩu phải có ít nhất 6 ký tự
                    </p>

                    <button type="submit" className="btn btn-primary" disabled={isSavingPassword}>
                        {isSavingPassword ? (
                            <span className="animate-spin">⏳</span>
                        ) : (
                            <Lock className="w-5 h-5" />
                        )}
                        Đổi mật khẩu
                    </button>
                </form>
            </div>

            {/* License Info */}
            <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">📋 Thông tin License</h2>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <p className="text-dark-400">Gói hiện tại</p>
                        <p className="text-xl font-bold text-primary-400">
                            {shop?.license?.plan === 'premium' ? '🌟 Premium' : '🆓 Dùng thử'}
                        </p>
                    </div>
                    <div className="flex-1">
                        <p className="text-dark-400">Hết hạn</p>
                        <p className="text-xl font-bold">
                            {shop?.license?.trialEndsAt
                                ? new Date(shop.license.trialEndsAt).toLocaleDateString('vi-VN')
                                : 'Chưa xác định'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
