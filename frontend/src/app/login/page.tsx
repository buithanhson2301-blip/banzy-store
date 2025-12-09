'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);

        try {
            await login(formData.email, formData.password);
            toast.success('Đăng nhập thành công!');
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.message || 'Đăng nhập thất bại');
            setErrors({ general: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4">
            <div className="w-full max-w-md animate-slide-up">
                <div className="card p-8">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
                            <Package className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold">Đăng nhập</h1>
                        <p className="text-dark-400 mt-1">Chào mừng bạn quay trở lại</p>
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
                            <label className="label">Email</label>
                            <input
                                type="email"
                                className="input"
                                placeholder="email@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="label">Mật khẩu</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="input pr-12"
                                    placeholder="Nhập mật khẩu"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Link href="/forgot-password" className="text-sm text-primary-400 hover:text-primary-300">
                                Quên mật khẩu?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full py-3"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Đang đăng nhập...
                                </>
                            ) : (
                                'Đăng nhập'
                            )}
                        </button>
                    </form>

                    {/* Register link */}
                    <p className="text-center text-dark-400 mt-6">
                        Chưa có tài khoản?{' '}
                        <Link href="/register" className="text-primary-400 hover:text-primary-300">
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
