'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        shopName: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Validate
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập họ tên';
        if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
        if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
        else if (formData.password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        try {
            await register(formData);
            toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực.');
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.message || 'Đăng ký thất bại');
            setErrors({ general: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4 py-12">
            <div className="w-full max-w-md animate-slide-up">
                <div className="card p-8">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
                            <Package className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold">Tạo tài khoản</h1>
                        <p className="text-dark-400 mt-1">Dùng thử 14 ngày miễn phí</p>
                    </div>

                    {/* Error message */}
                    {errors.general && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
                            {errors.general}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="label">Họ và tên *</label>
                            <input
                                type="text"
                                className={`input ${errors.name ? 'input-error' : ''}`}
                                placeholder="Nguyễn Văn A"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="label">Email *</label>
                            <input
                                type="email"
                                className={`input ${errors.email ? 'input-error' : ''}`}
                                placeholder="email@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="label">Mật khẩu *</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className={`input pr-12 ${errors.password ? 'input-error' : ''}`}
                                    placeholder="Ít nhất 6 ký tự"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="label">Tên cửa hàng (tùy chọn)</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Shop của tôi"
                                value={formData.shopName}
                                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full py-3 mt-6"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Đang đăng ký...
                                </>
                            ) : (
                                'Đăng ký miễn phí'
                            )}
                        </button>
                    </form>

                    {/* Terms */}
                    <p className="text-center text-dark-500 text-sm mt-6">
                        Bằng việc đăng ký, bạn đồng ý với{' '}
                        <a href="#" className="text-primary-400">Điều khoản sử dụng</a>
                        {' '}và{' '}
                        <a href="#" className="text-primary-400">Chính sách bảo mật</a>
                    </p>

                    {/* Login link */}
                    <p className="text-center text-dark-400 mt-4">
                        Đã có tài khoản?{' '}
                        <Link href="/login" className="text-primary-400 hover:text-primary-300">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
