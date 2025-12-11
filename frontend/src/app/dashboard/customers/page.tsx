'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, Settings } from 'lucide-react';
import { customersAPI, tierSettingsAPI, shippingAPI } from '@/lib/api';
import { formatCurrency, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, formatDate } from '@/lib/store';
import toast from 'react-hot-toast';

interface Customer {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    provinceId?: number;
    districtId?: number;
    wardId?: number;
    provinceName?: string;
    districtName?: string;
    wardName?: string;
    totalOrders: number;
    totalSpent: number;
    tier: number;
}

interface TierConfig {
    level: number;
    name: string;
    minSpent: number;
    minOrders: number;
    color: string;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showOrdersModal, setShowOrdersModal] = useState(false);
    const [showTierModal, setShowTierModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [customerOrders, setCustomerOrders] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', address: '',
        provinceId: 0, districtId: 0, wardId: 0,
        provinceName: '', districtName: '', wardName: ''
    });
    const [tierConfigs, setTierConfigs] = useState<TierConfig[]>([
        { level: 0, name: 'Thường', minSpent: 0, minOrders: 0, color: '#9CA3AF' },
        { level: 1, name: 'Bạc', minSpent: 2000000, minOrders: 5, color: '#94A3B8' },
        { level: 2, name: 'Vàng', minSpent: 10000000, minOrders: 20, color: '#EAB308' },
        { level: 3, name: 'Kim cương', minSpent: 50000000, minOrders: 50, color: '#06B6D4' }
    ]);

    // Location dropdowns state
    const [provinces, setProvinces] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);

    const fetchTierSettings = async () => {
        try {
            const { data } = await tierSettingsAPI.get();
            if (data.tiers) setTierConfigs(data.tiers);
        } catch (error) {
            console.error('Failed to fetch tier settings:', error);
        }
    };

    const fetchCustomers = async () => {
        try {
            const { data } = await customersAPI.getAll({ search, limit: 100 });
            setCustomers(data.customers);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchCustomers(); fetchTierSettings(); }, []);
    useEffect(() => {
        const timer = setTimeout(() => fetchCustomers(), 300);
        return () => clearTimeout(timer);
    }, [search]);
    // Load provinces on mount
    useEffect(() => {
        const loadProvinces = async () => {
            try {
                const { data } = await shippingAPI.getProvinces();
                setProvinces(data.provinces || []);
            } catch (e) {
                console.error('Failed to load provinces:', e);
            }
        };
        loadProvinces();
    }, []);

    // Load districts when province changes
    const loadDistricts = async (provinceId: number) => {
        if (!provinceId) {
            setDistricts([]);
            return;
        }
        setIsLoadingLocations(true);
        try {
            const { data } = await shippingAPI.getDistricts(provinceId);
            setDistricts(data.districts || []);
        } catch (e) {
            console.error('Failed to load districts:', e);
        } finally {
            setIsLoadingLocations(false);
        }
    };

    // Load wards when district changes
    const loadWards = async (districtId: number) => {
        if (!districtId) {
            setWards([]);
            return;
        }
        setIsLoadingLocations(true);
        try {
            const { data } = await shippingAPI.getWards(districtId);
            setWards(data.wards || []);
        } catch (e) {
            console.error('Failed to load wards:', e);
        } finally {
            setIsLoadingLocations(false);
        }
    };

    const openModal = async (customer?: Customer) => {
        if (customer) {
            setEditingCustomer(customer);
            setFormData({
                name: customer.name,
                email: customer.email || '',
                phone: customer.phone,
                address: customer.address || '',
                provinceId: customer.provinceId || 0,
                districtId: customer.districtId || 0,
                wardId: customer.wardId || 0,
                provinceName: customer.provinceName || '',
                districtName: customer.districtName || '',
                wardName: customer.wardName || ''
            });
            // Load districts and wards for existing customer
            if (customer.provinceId) {
                await loadDistricts(customer.provinceId);
            }
            if (customer.districtId) {
                await loadWards(customer.districtId);
            }
        } else {
            setEditingCustomer(null);
            setFormData({
                name: '', email: '', phone: '', address: '',
                provinceId: 0, districtId: 0, wardId: 0,
                provinceName: '', districtName: '', wardName: ''
            });
            setDistricts([]);
            setWards([]);
        }
        setShowModal(true);
    };

    const viewOrders = async (customer: Customer) => {
        try {
            const { data } = await customersAPI.getOrders(customer._id);
            setCustomerOrders(data);
            setEditingCustomer(customer);
            setShowOrdersModal(true);
        } catch (error) {
            toast.error('Không thể tải lịch sử đơn hàng');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCustomer) {
                const { data } = await customersAPI.update(editingCustomer._id, formData);
                // Show sync notification if orders were updated
                if (data.syncedOrdersCount > 0) {
                    toast.success(`Đã cập nhật khách hàng và đồng bộ ${data.syncedOrdersCount} đơn hàng`, { duration: 5000 });
                } else {
                    toast.success('Đã cập nhật khách hàng');
                }
            } else {
                await customersAPI.create(formData);
                toast.success('Đã thêm khách hàng mới');
            }
            setShowModal(false);
            fetchCustomers();
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (customer: Customer) => {
        if (!confirm(`Bạn có chắc muốn xóa "${customer.name}"?`)) return;
        try {
            await customersAPI.delete(customer._id);
            toast.success('Đã xóa khách hàng');
            fetchCustomers();
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra');
        }
    };

    const handleSaveTiers = async () => {
        try {
            await tierSettingsAPI.update(tierConfigs);
            toast.success('Đã lưu cài đặt phân hạng');
            setShowTierModal(false);
            fetchCustomers(); // Refresh to show updated tiers
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra');
        }
    };

    const getTierInfo = (tier: number) => {
        const config = tierConfigs.find(t => t.level === tier) || tierConfigs[0];
        return config;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">Khách hàng</h1>
                <div className="flex gap-2">
                    <button className="btn btn-secondary" onClick={() => setShowTierModal(true)}>
                        <Settings className="w-5 h-5" /> Phân hạng
                    </button>
                    <button className="btn btn-primary" onClick={() => openModal()}>
                        <Plus className="w-5 h-5" /> Thêm khách hàng
                    </button>
                </div>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input type="text" className="input pl-10" placeholder="Tìm kiếm khách hàng..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className="table-container">
                {isLoading ? (
                    <div className="p-8 text-center"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" /></div>
                ) : customers.length === 0 ? (
                    <div className="p-8 text-center text-dark-500">{search ? 'Không tìm thấy khách hàng' : 'Chưa có khách hàng nào'}</div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Khách hàng</th>
                                <th>Điện thoại</th>
                                <th>Hạng</th>
                                <th>Đơn hàng</th>
                                <th>Chi tiêu</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer) => {
                                const tierInfo = getTierInfo(customer.tier || 0);
                                return (
                                    <tr key={customer._id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-400 font-medium">
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{customer.name}</p>
                                                    <p className="text-sm text-dark-500 truncate max-w-[200px]">{[customer.address, customer.wardName, customer.districtName, customer.provinceName].filter(Boolean).join(', ') || '-'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{customer.phone}</td>
                                        <td>
                                            <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: tierInfo.color + '30', color: tierInfo.color }}>
                                                {tierInfo.name}
                                            </span>
                                        </td>
                                        <td><span className="badge badge-primary">{customer.totalOrders} đơn</span></td>
                                        <td className="font-medium text-green-400">{formatCurrency(customer.totalSpent)}</td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button className="btn btn-ghost p-2" onClick={() => viewOrders(customer)} title="Xem đơn hàng"><Eye className="w-4 h-4" /></button>
                                                <button className="btn btn-ghost p-2" onClick={() => openModal(customer)}><Edit2 className="w-4 h-4" /></button>
                                                <button className="btn btn-ghost p-2 text-red-400" onClick={() => handleDelete(customer)}><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-900 border border-dark-800 rounded-xl w-full max-w-lg">
                        <div className="p-4 border-b border-dark-800">
                            <h2 className="text-lg font-semibold">{editingCustomer ? 'Sửa khách hàng' : 'Thêm khách hàng mới'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="label">Họ tên *</label>
                                <input className="input" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
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

                            {/* Location Dropdowns */}
                            <div className="space-y-3">
                                <label className="label">Địa chỉ</label>

                                {/* Province Dropdown */}
                                <select
                                    className="input"
                                    value={formData.provinceId || ''}
                                    onChange={(e) => {
                                        const selectedId = parseInt(e.target.value) || 0;
                                        const selected = provinces.find((p: any) => p.id === selectedId);
                                        setFormData({
                                            ...formData,
                                            provinceId: selectedId,
                                            provinceName: selected?.name || '',
                                            districtId: 0,
                                            districtName: '',
                                            wardId: 0,
                                            wardName: ''
                                        });
                                        setWards([]);
                                        loadDistricts(selectedId);
                                    }}
                                >
                                    <option value="">-- Chọn Tỉnh/Thành phố --</option>
                                    {provinces.map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>

                                {/* District Dropdown */}
                                <select
                                    className="input"
                                    value={formData.districtId || ''}
                                    onChange={(e) => {
                                        const selectedId = parseInt(e.target.value) || 0;
                                        const selected = districts.find((d: any) => d.id === selectedId);
                                        setFormData({
                                            ...formData,
                                            districtId: selectedId,
                                            districtName: selected?.name || '',
                                            wardId: 0,
                                            wardName: ''
                                        });
                                        loadWards(selectedId);
                                    }}
                                    disabled={!formData.provinceId || isLoadingLocations}
                                >
                                    <option value="">-- Chọn Quận/Huyện --</option>
                                    {districts.map((d: any) => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>

                                {/* Ward Dropdown */}
                                <select
                                    className="input"
                                    value={formData.wardId || ''}
                                    onChange={(e) => {
                                        const selectedId = parseInt(e.target.value) || 0;
                                        const selected = wards.find((w: any) => w.id === selectedId);
                                        setFormData({
                                            ...formData,
                                            wardId: selectedId,
                                            wardName: selected?.name || ''
                                        });
                                    }}
                                    disabled={!formData.districtId || isLoadingLocations}
                                >
                                    <option value="">-- Chọn Phường/Xã --</option>
                                    {wards.map((w: any) => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                </select>

                                {/* Street Address */}
                                <input
                                    className="input"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Số nhà, tên đường..."
                                />

                                {isLoadingLocations && (
                                    <p className="text-xs text-dark-400">Đang tải địa chỉ...</p>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn btn-primary flex-1">{editingCustomer ? 'Cập nhật' : 'Thêm mới'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Customer Detail Modal */}
            {showOrdersModal && editingCustomer && (() => {
                const tierInfo = getTierInfo(editingCustomer.tier || 0);
                return (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-dark-900 border border-dark-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-dark-800 flex items-center justify-between">
                                <h2 className="text-lg font-semibold">👤 Chi tiết khách hàng</h2>
                                <button className="btn btn-ghost p-2" onClick={() => setShowOrdersModal(false)}>✕</button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                                {/* Customer Info Section */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Left: Basic Info */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-400 text-2xl font-bold">
                                                {editingCustomer.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold">{editingCustomer.name}</h3>
                                                <span className="px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1" style={{ backgroundColor: tierInfo.color + '30', color: tierInfo.color }}>
                                                    ⭐ {tierInfo.name}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="bg-dark-800 rounded-lg p-4 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-dark-400 w-24">📞 SĐT:</span>
                                                <span className="font-medium">{editingCustomer.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-dark-400 w-24">📧 Email:</span>
                                                <span className="font-medium">{editingCustomer.email || '-'}</span>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <span className="text-dark-400 w-24">📍 Địa chỉ:</span>
                                                <span className="font-medium">{[editingCustomer.address, editingCustomer.wardName, editingCustomer.districtName, editingCustomer.provinceName].filter(Boolean).join(', ') || '-'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Stats */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-dark-800 rounded-lg p-4 text-center">
                                            <p className="text-dark-400 text-sm">Tổng đơn hàng</p>
                                            <p className="text-3xl font-bold text-primary-400">{editingCustomer.totalOrders}</p>
                                        </div>
                                        <div className="bg-dark-800 rounded-lg p-4 text-center">
                                            <p className="text-dark-400 text-sm">Tổng chi tiêu</p>
                                            <p className="text-2xl font-bold text-green-400">{formatCurrency(editingCustomer.totalSpent)}</p>
                                        </div>
                                        <div className="bg-dark-800 rounded-lg p-4 text-center col-span-2">
                                            <p className="text-dark-400 text-sm">Hạng thành viên</p>
                                            <div className="flex items-center justify-center gap-2 mt-2">
                                                <span className="text-2xl">🏆</span>
                                                <span className="text-xl font-bold" style={{ color: tierInfo.color }}>{tierInfo.name}</span>
                                            </div>
                                            <p className="text-xs text-dark-500 mt-1">
                                                {tierInfo.level < 3 ? `Còn ${formatCurrency(tierConfigs[tierInfo.level + 1]?.minSpent - editingCustomer.totalSpent)} hoặc ${tierConfigs[tierInfo.level + 1]?.minOrders - editingCustomer.totalOrders} đơn để lên hạng` : 'Hạng cao nhất!'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Orders History Section */}
                                <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">📦 Lịch sử đơn hàng ({customerOrders.length})</h4>
                                    {customerOrders.length === 0 ? (
                                        <div className="p-6 text-center text-dark-500 bg-dark-800 rounded-lg">Chưa có đơn hàng nào</div>
                                    ) : (
                                        <div className="bg-dark-800 rounded-lg overflow-hidden">
                                            <table className="table">
                                                <thead><tr><th>Mã đơn</th><th>Ngày</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead>
                                                <tbody>
                                                    {customerOrders.map((order: any) => (
                                                        <tr key={order._id}>
                                                            <td className="font-medium">{order.orderCode}</td>
                                                            <td>{formatDate(order.createdAt)}</td>
                                                            <td className="font-medium">{formatCurrency(order.total)}</td>
                                                            <td><span className={`badge badge-${ORDER_STATUS_COLORS[order.status]}`}>{ORDER_STATUS_LABELS[order.status]}</span></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 border-t border-dark-800 flex gap-3">
                                <button className="btn btn-secondary flex-1" onClick={() => setShowOrdersModal(false)}>Đóng</button>
                                <button className="btn btn-primary flex-1" onClick={() => { setShowOrdersModal(false); openModal(editingCustomer); }}>✏️ Chỉnh sửa</button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Tier Settings Modal */}
            {showTierModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-900 border border-dark-800 rounded-xl w-full max-w-2xl">
                        <div className="p-4 border-b border-dark-800">
                            <h2 className="text-lg font-semibold">⚙️ Cài đặt phân hạng khách hàng</h2>
                            <p className="text-sm text-dark-400 mt-1">Khách hàng sẽ lên hạng khi đạt 1 trong 2 điều kiện (chi tiêu HOẶC số đơn)</p>
                        </div>
                        <div className="p-4 space-y-4">
                            {tierConfigs.map((tier, idx) => (
                                <div key={tier.level} className="grid grid-cols-4 gap-3 items-end p-3 bg-dark-800 rounded-lg" style={{ borderLeft: `4px solid ${tier.color}` }}>
                                    <div>
                                        <label className="label text-xs">Tên hạng</label>
                                        <input
                                            className="input"
                                            value={tier.name}
                                            onChange={(e) => {
                                                const newTiers = [...tierConfigs];
                                                newTiers[idx].name = e.target.value;
                                                setTierConfigs(newTiers);
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="label text-xs">Chi tiêu tối thiểu</label>
                                        <input
                                            type="text"
                                            className="input"
                                            disabled={tier.level === 0}
                                            value={tier.minSpent ? tier.minSpent.toLocaleString('vi-VN') : '0'}
                                            onChange={(e) => {
                                                const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
                                                const newTiers = [...tierConfigs];
                                                newTiers[idx].minSpent = parseInt(raw) || 0;
                                                setTierConfigs(newTiers);
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="label text-xs">Số đơn tối thiểu</label>
                                        <input
                                            type="number"
                                            className="input"
                                            disabled={tier.level === 0}
                                            value={tier.minOrders}
                                            onChange={(e) => {
                                                const newTiers = [...tierConfigs];
                                                newTiers[idx].minOrders = parseInt(e.target.value) || 0;
                                                setTierConfigs(newTiers);
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="label text-xs">Màu</label>
                                        <input
                                            type="color"
                                            className="input h-10 p-1"
                                            value={tier.color}
                                            onChange={(e) => {
                                                const newTiers = [...tierConfigs];
                                                newTiers[idx].color = e.target.value;
                                                setTierConfigs(newTiers);
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-dark-800 flex gap-3">
                            <button className="btn btn-secondary flex-1" onClick={() => { fetchTierSettings(); setShowTierModal(false); }}>Hủy</button>
                            <button className="btn btn-primary flex-1" onClick={handleSaveTiers}>💾 Lưu cài đặt</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
