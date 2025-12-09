'use client';

import Link from 'next/link';
import {
    BarChart3,
    Package,
    ShoppingCart,
    CheckCircle,
    ArrowRight,
    Zap,
    Shield,
    Users,
    TrendingUp
} from 'lucide-react';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-dark-950">
            {/* Header */}
            <header className="border-b border-dark-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold">QALY BAHA</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="text-dark-400 hover:text-white transition">
                                Đăng nhập
                            </Link>
                            <Link href="/register" className="btn btn-primary">
                                Dùng thử miễn phí
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="animate-slide-up">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            Quản lý bán hàng online
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
                                đơn giản & hiệu quả
                            </span>
                        </h1>
                        <p className="text-xl text-dark-400 max-w-3xl mx-auto mb-8">
                            QALY BAHA giúp bạn quản lý sản phẩm, đơn hàng, khách hàng và theo dõi doanh thu
                            một cách dễ dàng. Phù hợp cho các shop nhỏ lẻ bán hàng online.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/register" className="btn btn-primary text-lg px-8 py-3">
                                Dùng thử 14 ngày miễn phí
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <a href="#features" className="btn btn-secondary text-lg px-8 py-3">
                                Tìm hiểu thêm
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 bg-dark-900/50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Tính năng nổi bật</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Package,
                                title: 'Quản lý sản phẩm',
                                description: 'Thêm, sửa, xóa sản phẩm dễ dàng. Theo dõi tồn kho realtime.'
                            },
                            {
                                icon: ShoppingCart,
                                title: 'Quản lý đơn hàng',
                                description: 'Tạo đơn nhanh, theo dõi trạng thái từ chờ xử lý đến hoàn thành.'
                            },
                            {
                                icon: Users,
                                title: 'Quản lý khách hàng',
                                description: 'Lưu thông tin khách hàng, xem lịch sử mua hàng chi tiết.'
                            },
                            {
                                icon: BarChart3,
                                title: 'Báo cáo doanh thu',
                                description: 'Thống kê doanh thu theo ngày, tuần, tháng với biểu đồ trực quan.'
                            },
                        ].map((feature, index) => (
                            <div key={index} className="card p-6 hover:border-primary-500/50 transition-colors">
                                <feature.icon className="w-12 h-12 text-primary-400 mb-4" />
                                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                <p className="text-dark-400">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Tại sao chọn QALY BAHA?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Zap,
                                title: 'Nhanh chóng',
                                description: 'Giao diện đơn giản, thao tác nhanh, không cần đào tạo.'
                            },
                            {
                                icon: Shield,
                                title: 'An toàn',
                                description: 'Dữ liệu được mã hóa và backup tự động hàng ngày.'
                            },
                            {
                                icon: TrendingUp,
                                title: 'Phát triển',
                                description: 'Liên tục cập nhật tính năng mới theo nhu cầu người dùng.'
                            },
                        ].map((item, index) => (
                            <div key={index} className="text-center">
                                <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <item.icon className="w-8 h-8 text-primary-400" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                                <p className="text-dark-400">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 px-4 bg-dark-900/50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Bảng giá</h2>
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Free Plan */}
                        <div className="card p-8">
                            <h3 className="text-xl font-bold mb-2">Miễn phí</h3>
                            <p className="text-dark-400 mb-4">Dành cho shop mới bắt đầu</p>
                            <div className="text-4xl font-bold mb-6">0đ<span className="text-lg text-dark-400">/tháng</span></div>
                            <ul className="space-y-3 mb-8">
                                {[
                                    'Tối đa 50 sản phẩm',
                                    '1 người dùng',
                                    'Quản lý đơn hàng',
                                    'Quản lý khách hàng',
                                    'Báo cáo cơ bản',
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link href="/register" className="btn btn-secondary w-full justify-center">
                                Bắt đầu miễn phí
                            </Link>
                        </div>

                        {/* Premium Plan */}
                        <div className="card p-8 border-primary-500 relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                                Phổ biến
                            </div>
                            <h3 className="text-xl font-bold mb-2">Nâng cao</h3>
                            <p className="text-dark-400 mb-4">Dành cho shop đang phát triển</p>
                            <div className="text-4xl font-bold mb-6">
                                Liên hệ
                            </div>
                            <ul className="space-y-3 mb-8">
                                {[
                                    'Không giới hạn sản phẩm',
                                    '2 người dùng',
                                    'Phân quyền nhân viên',
                                    'Xuất báo cáo Excel',
                                    'Hỗ trợ ưu tiên',
                                    'Thêm user: 50,000đ/người/tháng',
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link href="/register" className="btn btn-primary w-full justify-center">
                                Dùng thử 14 ngày
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu?</h2>
                    <p className="text-dark-400 mb-8">
                        Đăng ký ngay hôm nay và trải nghiệm 14 ngày dùng thử hoàn toàn miễn phí.
                    </p>
                    <Link href="/register" className="btn btn-primary text-lg px-8 py-3">
                        Đăng ký miễn phí
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-dark-800 py-8 px-4">
                <div className="max-w-7xl mx-auto text-center text-dark-500">
                    <p>© 2024 QALY BAHA. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
