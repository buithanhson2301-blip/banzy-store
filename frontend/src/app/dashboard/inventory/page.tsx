'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Search, Plus, Minus } from 'lucide-react';
import { productsAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/store';
import toast from 'react-hot-toast';

export default function InventoryPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [lowStock, setLowStock] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [adjustModal, setAdjustModal] = useState<any>(null);
    const [adjustment, setAdjustment] = useState('');

    const fetchData = async () => {
        try {
            const [productsRes, lowStockRes] = await Promise.all([
                productsAPI.getAll({ search, limit: 100 }),
                productsAPI.getLowStock()
            ]);
            setProducts(productsRes.data.products);
            setLowStock(lowStockRes.data);
        } catch (error) {
            console.error('Failed to fetch inventory data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);
    useEffect(() => {
        const timer = setTimeout(() => fetchData(), 300);
        return () => clearTimeout(timer);
    }, [search]);

    const handleAdjust = async () => {
        if (!adjustment || adjustment === '0') return;
        try {
            await productsAPI.updateStock(adjustModal._id, parseInt(adjustment));
            toast.success('Đã cập nhật tồn kho');
            setAdjustModal(null);
            setAdjustment('');
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold">Quản lý tồn kho</h1>

            {/* Low stock alert */}
            {lowStock.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        <h3 className="font-semibold text-yellow-400">Sản phẩm sắp hết hàng ({lowStock.length})</h3>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {lowStock.slice(0, 6).map((product: any) => (
                            <div key={product._id} className="flex items-center justify-between bg-dark-800 rounded-lg p-3">
                                <span className="font-medium truncate">{product.name}</span>
                                <span className="badge badge-danger ml-2">Còn {product.quantity}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input type="text" className="input pl-10" placeholder="Tìm kiếm sản phẩm..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            {/* Table */}
            <div className="table-container">
                {isLoading ? (
                    <div className="p-8 text-center"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" /></div>
                ) : products.length === 0 ? (
                    <div className="p-8 text-center text-dark-500">{search ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm'}</div>
                ) : (
                    <table className="table">
                        <thead><tr><th>Mã SP</th><th>Tên sản phẩm</th><th>Giá bán</th><th>Tồn kho</th><th>Ngưỡng</th><th>Trạng thái</th><th>Điều chỉnh</th></tr></thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product._id}>
                                    <td className="font-medium">{product.code || '-'}</td>
                                    <td>{product.name}</td>
                                    <td>{formatCurrency(product.price)}</td>
                                    <td className="font-bold text-lg">{product.quantity}</td>
                                    <td className="text-dark-500">{product.minStock}</td>
                                    <td>
                                        {product.quantity <= product.minStock ? (
                                            <span className="badge badge-danger"><AlertTriangle className="w-3 h-3 mr-1" />Sắp hết</span>
                                        ) : (
                                            <span className="badge badge-success">Đủ hàng</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="flex gap-1">
                                            <button className="btn btn-secondary p-2" onClick={() => { setAdjustModal(product); setAdjustment('-1'); }}>
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <button className="btn btn-secondary p-2" onClick={() => { setAdjustModal(product); setAdjustment('1'); }}>
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Adjust Modal */}
            {adjustModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-900 border border-dark-800 rounded-xl w-full max-w-sm">
                        <div className="p-4 border-b border-dark-800">
                            <h2 className="text-lg font-semibold">Điều chỉnh tồn kho</h2>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="text-center">
                                <p className="text-dark-400">Sản phẩm</p>
                                <p className="font-semibold text-lg">{adjustModal.name}</p>
                                <p className="text-dark-400 mt-2">Tồn kho hiện tại: <span className="font-bold text-white">{adjustModal.quantity}</span></p>
                            </div>
                            <div>
                                <label className="label">Số lượng điều chỉnh</label>
                                <input type="number" className="input text-center text-lg" value={adjustment} onChange={(e) => setAdjustment(e.target.value)} placeholder="+10 hoặc -5" />
                                <p className="text-sm text-dark-500 mt-1 text-center">Nhập số dương để tăng, số âm để giảm</p>
                            </div>
                            {adjustment && (
                                <p className="text-center">
                                    Tồn kho mới: <span className={`font-bold ${adjustModal.quantity + parseInt(adjustment) < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                        {adjustModal.quantity + parseInt(adjustment || '0')}
                                    </span>
                                </p>
                            )}
                        </div>
                        <div className="p-4 border-t border-dark-800 flex gap-3">
                            <button className="btn btn-secondary flex-1" onClick={() => { setAdjustModal(null); setAdjustment(''); }}>Hủy</button>
                            <button className="btn btn-primary flex-1" onClick={handleAdjust} disabled={!adjustment || adjustment === '0' || adjustModal.quantity + parseInt(adjustment || '0') < 0}>Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
