'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
    const router = useRouter();
    const params = useParams();
    const token = params.token as string;

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Mật khẩu không khớp');
            return;
        }

        if (password.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setIsLoading(true);

        try {
            await authAPI.resetPassword(token, password);
            setIsSuccess(true);
            toast.success('Đã đặt lại mật khẩu thành công!');
        } catch (error: any) {
            toast.error(error.message || 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-950 p-4">
                <div className="w-full max-w-md">
                    <div className="bg-dark-900 border border-dark-800 rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Thành công!</h1>
                        <p className="text-dark-400 mb-6">
                            Mật khẩu của bạn đã được đặt lại. Bạn có thể đăng nhập với mật khẩu mới.
                        </p>
                        <Link href="/login" className="btn btn-primary w-full">
                            Đăng nhập ngay
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-950 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold gradient-text">QALY BAHA</h1>
                    <p className="text-dark-400 mt-2">Đặt lại mật khẩu</p>
                </div>

                <div className="bg-dark-900 border border-dark-800 rounded-2xl p-8">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8 text-primary-400" />
                        </div>
                        <h2 className="text-xl font-semibold">Tạo mật khẩu mới</h2>
                        <p className="text-dark-400 text-sm mt-2">
                            Nhập mật khẩu mới cho tài khoản của bạn
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <label className="label">Mật khẩu mới</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="input pr-10"
                                placeholder="Ít nhất 6 ký tự"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-9 text-dark-400 hover:text-white"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <div>
                            <label className="label">Xác nhận mật khẩu</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="input"
                                placeholder="Nhập lại mật khẩu"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="animate-spin">⏳</span>
                            ) : (
                                <Lock className="w-5 h-5" />
                            )}
                            Đặt lại mật khẩu
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/login" className="text-primary-400 hover:text-primary-300 text-sm">
                            <ArrowLeft className="w-4 h-4 inline mr-1" />
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
