'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { productsAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/store';
import toast from 'react-hot-toast';

interface Product {
    _id: string;
    name: string;
    code: string;
    category: string;
    price: number;
    quantity: number;
    minStock: number;
    status: string;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: '', code: '', category: '', price: '', quantity: '', minStock: '5', description: ''
    });

    const fetchProducts = async () => {
        try {
            const { data } = await productsAPI.getAll({ search, limit: 100 });
            setProducts(data.products);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const openModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                code: product.code || '',
                category: product.category || '',
                price: product.price.toString(),
                quantity: product.quantity.toString(),
                minStock: product.minStock.toString(),
                description: ''
            });
        } else {
            setEditingProduct(null);
            setFormData({ name: '', code: '', category: '', price: '', quantity: '', minStock: '5', description: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                price: parseFloat(formData.price),
                quantity: parseInt(formData.quantity),
                minStock: parseInt(formData.minStock)
            };

            if (editingProduct) {
                await productsAPI.update(editingProduct._id, data);
                toast.success('Đã cập nhật sản phẩm');
            } else {
                await productsAPI.create(data);
                toast.success('Đã thêm sản phẩm mới');
            }
            setShowModal(false);
            fetchProducts();
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (product: Product) => {
        if (!confirm(`Bạn có chắc muốn xóa "${product.name}"?`)) return;
        try {
            await productsAPI.delete(product._id);
            toast.success('Đã xóa sản phẩm');
            fetchProducts();
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">Sản phẩm</h1>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    <Plus className="w-5 h-5" /> Thêm sản phẩm
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                    type="text"
                    className="input pl-10"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="table-container">
                {isLoading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="p-8 text-center text-dark-500">
                        {search ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Mã SP</th>
                                <th>Tên sản phẩm</th>
                                <th>Danh mục</th>
                                <th>Giá bán</th>
                                <th>Tồn kho</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product._id}>
                                    <td className="font-medium">{product.code || '-'}</td>
                                    <td>{product.name}</td>
                                    <td><span className="badge badge-gray">{product.category || 'Khác'}</span></td>
                                    <td>{formatCurrency(product.price)}</td>
                                    <td>
                                        <span className={`badge ${product.quantity <= product.minStock ? 'badge-danger' : 'badge-success'}`}>
                                            {product.quantity <= product.minStock && <AlertTriangle className="w-3 h-3 mr-1" />}
                                            {product.quantity}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button className="btn btn-ghost p-2" onClick={() => openModal(product)}>
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button className="btn btn-ghost p-2 text-red-400" onClick={() => handleDelete(product)}>
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-900 border border-dark-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b border-dark-800">
                            <h2 className="text-lg font-semibold">
                                {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="label">Tên sản phẩm *</label>
                                <input className="input" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Mã sản phẩm</label>
                                    <input className="input" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label">Danh mục</label>
                                    <input className="input" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Giá bán *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        required
                                        placeholder="150.000"
                                        value={formData.price ? Number(formData.price.replace(/\./g, '')).toLocaleString('vi-VN') : ''}
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
                                            setFormData({ ...formData, price: raw });
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="label">Số lượng *</label>
                                    <input type="number" className="input" required min="0" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="label">Ngưỡng cảnh báo</label>
                                <input type="number" className="input" min="0" value={formData.minStock} onChange={(e) => setFormData({ ...formData, minStock: e.target.value })} />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn btn-primary flex-1">{editingProduct ? 'Cập nhật' : 'Thêm mới'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
