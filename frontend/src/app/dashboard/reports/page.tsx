'use client';

import { useEffect, useState } from 'react';
import { Calendar, TrendingUp, Package, Download } from 'lucide-react';
import { dashboardAPI } from '@/lib/api';
import { formatCurrency, useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function ReportsPage() {
    const { shop } = useAuthStore();
    const [dateRange, setDateRange] = useState('week');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [revenueData, setRevenueData] = useState<any>({ data: [], totals: {} });
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const setDefaultDates = () => {
        const today = new Date();
        const end = today.toISOString().split('T')[0];
        let start = end;

        if (dateRange === 'week') {
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 6);
            start = weekAgo.toISOString().split('T')[0];
        } else if (dateRange === 'month') {
            const monthAgo = new Date(today);
            monthAgo.setDate(monthAgo.getDate() - 29);
            start = monthAgo.toISOString().split('T')[0];
        }

        setStartDate(start);
        setEndDate(end);
    };

    useEffect(() => { setDefaultDates(); }, [dateRange]);

    useEffect(() => {
        if (!startDate || !endDate) return;
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [revenueRes, productsRes] = await Promise.all([
                    dashboardAPI.getRevenue({ startDate, endDate }),
                    dashboardAPI.getTopProducts(10)
                ]);
                setRevenueData(revenueRes.data);
                setTopProducts(productsRes.data);
            } catch (error) {
                console.error('Failed to fetch reports:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [startDate, endDate]);

    const maxRevenue = Math.max(...(revenueData.data?.map((d: any) => d.revenue) || [1]), 1);

    const exportToExcel = () => {
        if (!revenueData.data || revenueData.data.length === 0) {
            toast.error('Không có dữ liệu để xuất');
            return;
        }

        // Create CSV content (Excel compatible)
        let csv = '\uFEFF'; // BOM for UTF-8
        csv += `BÁO CÁO DOANH THU - ${shop?.name || 'QALY BAHA'}\n`;
        csv += `Từ ngày: ${startDate} - Đến ngày: ${endDate}\n\n`;

        // Summary
        csv += `TỔNG KẾT\n`;
        csv += `Tổng doanh thu,${revenueData.totals?.totalRevenue || 0}\n`;
        csv += `Số đơn hoàn thành,${revenueData.totals?.totalOrders || 0}\n`;
        csv += `Giá trị TB/đơn,${revenueData.totals?.avgOrderValue || 0}\n\n`;

        // Daily data
        csv += `CHI TIẾT THEO NGÀY\n`;
        csv += `Ngày,Số đơn,Doanh thu\n`;
        [...(revenueData.data || [])].reverse().forEach((day: any) => {
            csv += `${day._id},${day.orders},${day.revenue}\n`;
        });

        // Top products
        if (topProducts.length > 0) {
            csv += `\nSẢN PHẨM BÁN CHẠY\n`;
            csv += `STT,Sản phẩm,Số lượng bán,Doanh thu\n`;
            topProducts.forEach((p: any, i: number) => {
                csv += `${i + 1},"${p.productName}",${p.totalQuantity},${p.totalRevenue}\n`;
            });
        }

        // Download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `baocao_${startDate}_${endDate}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('Đã xuất báo cáo Excel');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">Báo cáo doanh thu</h1>
                <button className="btn btn-primary" onClick={exportToExcel} disabled={isLoading}>
                    <Download className="w-4 h-4" /> Xuất Excel
                </button>
            </div>

            {/* Date Filter */}
            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex gap-2">
                        {['today', 'week', 'month'].map((range) => (
                            <button key={range} className={`btn ${dateRange === range ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setDateRange(range)}>
                                {range === 'today' ? 'Hôm nay' : range === 'week' ? '7 ngày' : '30 ngày'}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-dark-500" />
                        <input type="date" className="input w-auto" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        <span className="text-dark-500">-</span>
                        <input type="date" className="input w-auto" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
                <div className="stats-card">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <p className="text-dark-400 text-sm">Tổng doanh thu</p>
                            <p className="text-2xl font-bold">{formatCurrency(revenueData.totals?.totalRevenue || 0)}</p>
                        </div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                            <Package className="w-6 h-6 text-primary-400" />
                        </div>
                        <div>
                            <p className="text-dark-400 text-sm">Đơn hoàn thành</p>
                            <p className="text-2xl font-bold">{revenueData.totals?.totalOrders || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-dark-400 text-sm">Giá trị TB/đơn</p>
                            <p className="text-2xl font-bold">{formatCurrency(revenueData.totals?.avgOrderValue || 0)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="card">
                    <div className="p-4 border-b border-dark-800">
                        <h2 className="font-semibold">Biểu đồ doanh thu</h2>
                    </div>
                    <div className="p-4">
                        {isLoading ? (
                            <div className="h-64 flex items-center justify-center">
                                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
                            </div>
                        ) : revenueData.data?.length === 0 ? (
                            <div className="h-64 flex items-center justify-center text-dark-500">Chưa có dữ liệu</div>
                        ) : (
                            <div className="flex items-end justify-between h-64 gap-1 pt-6">
                                {revenueData.data?.map((day: any, idx: number) => {
                                    const height = (day.revenue / maxRevenue) * 180;
                                    return (
                                        <div key={idx} className="flex-1 flex flex-col items-center min-w-0">
                                            <div className="relative w-full max-w-[40px] mx-auto">
                                                {day.revenue > 0 && (
                                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-dark-400 whitespace-nowrap">
                                                        {(day.revenue / 1000000).toFixed(1)}M
                                                    </div>
                                                )}
                                                <div className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t" style={{ height: `${Math.max(height, 4)}px` }} title={`${day._id}: ${formatCurrency(day.revenue)}`} />
                                            </div>
                                            <div className="text-xs text-dark-500 mt-2 truncate w-full text-center">{day._id?.split('-').slice(1).join('/')}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Products */}
                <div className="card">
                    <div className="p-4 border-b border-dark-800">
                        <h2 className="font-semibold">Sản phẩm bán chạy</h2>
                    </div>
                    <div className="p-4 space-y-4">
                        {isLoading ? (
                            <div className="h-64 flex items-center justify-center">
                                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
                            </div>
                        ) : topProducts.length === 0 ? (
                            <div className="h-64 flex items-center justify-center text-dark-500">Chưa có dữ liệu</div>
                        ) : (
                            topProducts.map((product: any, idx: number) => {
                                const maxQty = topProducts[0]?.totalQuantity || 1;
                                const percentage = (product.totalQuantity / maxQty) * 100;
                                return (
                                    <div key={product._id}>
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`badge ${idx < 3 ? 'badge-primary' : 'badge-gray'}`}>{idx + 1}</span>
                                                <span className="text-sm truncate">{product.productName}</span>
                                            </div>
                                            <span className="text-sm text-dark-400">{product.totalQuantity} đã bán</span>
                                        </div>
                                        <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                                        </div>
                                        <p className="text-xs text-dark-500 mt-1">Doanh thu: {formatCurrency(product.totalRevenue)}</p>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Daily Table */}
            <div className="card">
                <div className="p-4 border-b border-dark-800">
                    <h2 className="font-semibold">Chi tiết theo ngày</h2>
                </div>
                <div className="table-container border-0 rounded-none">
                    {isLoading ? (
                        <div className="p-8 text-center"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" /></div>
                    ) : (
                        <table className="table">
                            <thead><tr><th>Ngày</th><th className="text-center">Đơn hoàn thành</th><th className="text-right">Doanh thu</th></tr></thead>
                            <tbody>
                                {[...(revenueData.data || [])].reverse().map((day: any) => (
                                    <tr key={day._id}>
                                        <td className="font-medium">{day._id}</td>
                                        <td className="text-center"><span className={`badge ${day.orders > 0 ? 'badge-primary' : 'badge-gray'}`}>{day.orders}</span></td>
                                        <td className="text-right font-medium text-green-400">{formatCurrency(day.revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
