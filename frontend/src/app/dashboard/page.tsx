'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Package,
    ShoppingCart,
    Users,
    TrendingUp,
    AlertTriangle,
    ArrowRight
} from 'lucide-react';
import { dashboardAPI } from '@/lib/api';
import { formatCurrency, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/store';

interface DashboardStats {
    products: { total: number; active: number; lowStock: number };
    customers: { total: number };
    orders: { total: number; today: number; byStatus: Record<string, number> };
    revenue: { total: number; today: number; completedOrders: number };
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, ordersRes, productsRes] = await Promise.all([
                    dashboardAPI.getStats(),
                    dashboardAPI.getRecentOrders(5),
                    dashboardAPI.getTopProducts(5),
                ]);
                setStats(statsRes.data);
                setRecentOrders(ordersRes.data);
                setTopProducts(productsRes.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold">Tổng quan</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stats-card">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <p className="text-dark-400 text-sm">Doanh thu</p>
                            <p className="text-2xl font-bold">{formatCurrency(stats?.revenue.total || 0)}</p>
                        </div>
                    </div>
                    <p className="text-sm text-dark-500 mt-2">
                        Hôm nay: {formatCurrency(stats?.revenue.today || 0)}
                    </p>
                </div>

                <div className="stats-card">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-primary-400" />
                        </div>
                        <div>
                            <p className="text-dark-400 text-sm">Đơn hàng</p>
                            <p className="text-2xl font-bold">{stats?.orders.total || 0}</p>
                        </div>
                    </div>
                    <p className="text-sm text-dark-500 mt-2">
                        Hôm nay: {stats?.orders.today || 0} đơn
                    </p>
                </div>

                <div className="stats-card">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                            <Package className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-dark-400 text-sm">Sản phẩm</p>
                            <p className="text-2xl font-bold">{stats?.products.active || 0}</p>
                        </div>
                    </div>
                    <p className="text-sm text-dark-500 mt-2">
                        Tổng: {stats?.products.total || 0} sản phẩm
                    </p>
                </div>

                <div className="stats-card">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-dark-400 text-sm">Khách hàng</p>
                            <p className="text-2xl font-bold">{stats?.customers.total || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {(stats?.products.lowStock || 0) > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-4">
                    <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="font-medium text-yellow-400">Cảnh báo tồn kho</p>
                        <p className="text-sm text-dark-400">
                            Có {stats?.products.lowStock} sản phẩm sắp hết hàng
                        </p>
                    </div>
                    <Link href="/dashboard/inventory" className="btn btn-secondary text-sm">
                        Xem chi tiết
                    </Link>
                </div>
            )}

            {/* Content Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="card">
                    <div className="flex items-center justify-between p-4 border-b border-dark-800">
                        <h2 className="font-semibold">Đơn hàng gần đây</h2>
                        <Link href="/dashboard/orders" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
                            Xem tất cả <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="divide-y divide-dark-800">
                        {recentOrders.length > 0 ? recentOrders.map((order: any) => (
                            <div key={order._id} className="p-4 flex items-center justify-between hover:bg-dark-800/50">
                                <div>
                                    <p className="font-medium">{order.orderCode}</p>
                                    <p className="text-sm text-dark-400">{order.customerName || 'Khách vãng lai'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">{formatCurrency(order.total)}</p>
                                    <span className={`badge badge-${ORDER_STATUS_COLORS[order.status]}`}>
                                        {ORDER_STATUS_LABELS[order.status]}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div className="p-8 text-center text-dark-500">
                                Chưa có đơn hàng nào
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Products */}
                <div className="card">
                    <div className="flex items-center justify-between p-4 border-b border-dark-800">
                        <h2 className="font-semibold">Sản phẩm bán chạy</h2>
                        <Link href="/dashboard/reports" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
                            Xem báo cáo <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="divide-y divide-dark-800">
                        {topProducts.length > 0 ? topProducts.map((product: any, index: number) => (
                            <div key={product._id} className="p-4 flex items-center gap-4 hover:bg-dark-800/50">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${index < 3 ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-800 text-dark-400'}`}>
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{product.productName}</p>
                                    <p className="text-sm text-dark-400">Đã bán: {product.totalQuantity}</p>
                                </div>
                                <p className="font-medium text-green-400">{formatCurrency(product.totalRevenue)}</p>
                            </div>
                        )) : (
                            <div className="p-8 text-center text-dark-500">
                                Chưa có dữ liệu bán hàng
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
