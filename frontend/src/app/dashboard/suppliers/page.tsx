'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { suppliersAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/store';
import toast from 'react-hot-toast';

interface Supplier {
    _id: string;
    name: string;
    code: string;
    phone: string;
    email: string;
    address: string;
    contactPerson: string;
    note: string;
    totalOrders: number;
    totalAmount: number;
}

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [formData, setFormData] = useState({
        name: '', code: '', phone: '', email: '', address: '', contactPerson: '', note: ''
    });

    const fetchSuppliers = async () => {
        try {
            const { data } = await suppliersAPI.getAll({ search, limit: 100 });
            setSuppliers(data.suppliers);
        } catch (error) {
            console.error('Failed to fetch suppliers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchSuppliers(); }, []);
    useEffect(() => {
        const timer = setTimeout(() => fetchSuppliers(), 300);
        return () => clearTimeout(timer);
    }, [search]);

    const openModal = (supplier?: Supplier) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setFormData({
                name: supplier.name,
                code: supplier.code || '',
                phone: supplier.phone,
                email: supplier.email || '',
                address: supplier.address || '',
                contactPerson: supplier.contactPerson || '',
                note: supplier.note || ''
            });
        } else {
            setEditingSupplier(null);
            setFormData({ name: '', code: '', phone: '', email: '', address: '', contactPerson: '', note: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingSupplier) {
                await suppliersAPI.update(editingSupplier._id, formData);
                toast.success('Đã cập nhật nhà cung cấp');
            } else {
                await suppliersAPI.create(formData);
                toast.success('Đã thêm nhà cung cấp mới');
            }
            setShowModal(false);
            fetchSuppliers();
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (supplier: Supplier) => {
        if (!confirm(`Bạn có chắc muốn xóa "${supplier.name}"?`)) return;
        try {
            await suppliersAPI.delete(supplier._id);
            toast.success('Đã xóa nhà cung cấp');
            fetchSuppliers();
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Nhà cung cấp</h1>
                    <p className="text-dark-400 text-sm mt-1">Quản lý danh sách nhà cung cấp hàng hóa</p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    <Plus className="w-5 h-5" /> Thêm nhà cung cấp
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input type="text" className="input pl-10" placeholder="Tìm kiếm nhà cung cấp..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            {/* Suppliers Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
                </div>
            ) : suppliers.length === 0 ? (
                <div className="card p-8 text-center">
                    <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-dark-500" />
                    </div>
                    <p className="text-dark-400 mb-4">{search ? 'Không tìm thấy nhà cung cấp' : 'Chưa có nhà cung cấp nào'}</p>
                    <button className="btn btn-primary" onClick={() => openModal()}>
                        <Plus className="w-4 h-4" /> Thêm nhà cung cấp đầu tiên
                    </button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {suppliers.map((supplier) => (
                        <div key={supplier._id} className="card p-4 hover:border-primary-500/50 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold">{supplier.name}</h3>
                                    <p className="text-xs text-dark-500">{supplier.code}</p>
                                </div>
                                <div className="flex gap-1">
                                    <button className="btn btn-ghost p-1.5" onClick={() => openModal(supplier)}>
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button className="btn btn-ghost p-1.5 text-red-400" onClick={() => handleDelete(supplier)}>
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-dark-400">
                                    <Phone className="w-4 h-4" />
                                    <span>{supplier.phone}</span>
                                </div>
                                {supplier.email && (
                                    <div className="flex items-center gap-2 text-dark-400">
                                        <Mail className="w-4 h-4" />
                                        <span className="truncate">{supplier.email}</span>
                                    </div>
                                )}
                                {supplier.address && (
                                    <div className="flex items-start gap-2 text-dark-400">
                                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <span className="line-clamp-2">{supplier.address}</span>
                                    </div>
                                )}
                            </div>
                            {supplier.contactPerson && (
                                <div className="mt-3 pt-3 border-t border-dark-800 text-sm text-dark-400">
                                    Liên hệ: <span className="text-dark-200">{supplier.contactPerson}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-900 border border-dark-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b border-dark-800">
                            <h2 className="text-lg font-semibold">{editingSupplier ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="label">Tên nhà cung cấp *</label>
                                    <input className="input" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="label">Mã NCC</label>
                                    <input className="input" placeholder="Tự động tạo" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Điện thoại *</label>
                                    <input className="input" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label">Email</label>
                                    <input type="email" className="input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="label">Người liên hệ</label>
                                <input className="input" placeholder="Tên người liên hệ" value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} />
                            </div>
                            <div>
                                <label className="label">Địa chỉ</label>
                                <textarea className="input" rows={2} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                            </div>
                            <div>
                                <label className="label">Ghi chú</label>
                                <textarea className="input" rows={2} value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn btn-primary flex-1">{editingSupplier ? 'Cập nhật' : 'Thêm mới'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
