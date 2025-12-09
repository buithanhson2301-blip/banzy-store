'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await authAPI.forgotPassword(email);
            setIsSuccess(true);
            toast.success('Đã gửi email đặt lại mật khẩu!');
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra');
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
                        <h1 className="text-2xl font-bold mb-2">Kiểm tra email!</h1>
                        <p className="text-dark-400 mb-6">
                            Nếu email <span className="text-white">{email}</span> tồn tại trong hệ thống,
                            bạn sẽ nhận được link đặt lại mật khẩu.
                        </p>
                        <p className="text-sm text-dark-500 mb-6">
                            Link sẽ hết hạn sau 1 giờ.
                        </p>
                        <Link href="/login" className="btn btn-primary w-full">
                            <ArrowLeft className="w-5 h-5" />
                            Quay lại đăng nhập
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
                    <p className="text-dark-400 mt-2">Quên mật khẩu</p>
                </div>

                <div className="bg-dark-900 border border-dark-800 rounded-2xl p-8">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-8 h-8 text-primary-400" />
                        </div>
                        <h2 className="text-xl font-semibold">Đặt lại mật khẩu</h2>
                        <p className="text-dark-400 text-sm mt-2">
                            Nhập email đăng ký để nhận link đặt lại mật khẩu
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="label">Email</label>
                            <input
                                type="email"
                                className="input"
                                placeholder="email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
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
                                <Mail className="w-5 h-5" />
                            )}
                            Gửi link đặt lại mật khẩu
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
