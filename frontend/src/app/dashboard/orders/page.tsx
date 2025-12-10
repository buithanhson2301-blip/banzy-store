'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Eye, Check, X, Printer, Truck } from 'lucide-react';
import { ordersAPI, productsAPI, customersAPI, shippingAPI } from '@/lib/api';
import { formatCurrency, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/store';
import toast from 'react-hot-toast';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    // Create order state
    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [orderItems, setOrderItems] = useState<any[]>([]);

    // Location dropdowns state
    const [provinces, setProvinces] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);

    const [formData, setFormData] = useState({
        customerId: '',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        customerSource: 'instagram',
        paymentMethod: 'cod',
        shippingFee: 0,
        shippingAddress: '',
        receiverProvinceId: 0,
        receiverDistrictId: 0,
        receiverWardId: 0,
        receiverProvinceName: '',
        receiverDistrictName: '',
        receiverWardName: '',
        note: ''
    });
    // Track original customer data to detect changes
    const [originalCustomer, setOriginalCustomer] = useState<{ name: string, phone: string, email: string, address: string } | null>(null);

    const fetchOrders = async () => {
        try {
            const { data } = await ordersAPI.getAll({ status: statusFilter || undefined, limit: 100 });
            setOrders(data.orders);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, [statusFilter]);

    const openCreateModal = async () => {
        try {
            const [customersRes, productsRes, provincesRes] = await Promise.all([
                customersAPI.getAll({ limit: 100 }),
                productsAPI.getAll({ limit: 100 }),
                shippingAPI.getProvinces()
            ]);
            setCustomers(customersRes.data.customers);
            setProducts(productsRes.data.products.filter((p: any) => p.quantity > 0));
            setProvinces(provincesRes.data.provinces || []);
            setDistricts([]);
            setWards([]);
            setOrderItems([]);
            setFormData({
                customerId: '',
                customerName: '',
                customerPhone: '',
                customerEmail: '',
                customerSource: 'instagram',
                paymentMethod: 'cod',
                shippingFee: 0,
                shippingAddress: '',
                receiverProvinceId: 0,
                receiverDistrictId: 0,
                receiverWardId: 0,
                receiverProvinceName: '',
                receiverDistrictName: '',
                receiverWardName: '',
                note: ''
            });
            setOriginalCustomer(null);
            setShowModal(true);
        } catch (error) {
            toast.error('Không thể tải dữ liệu');
        }
    };

    // Load districts when province changes
    const handleProvinceChange = async (provinceId: number, provinceName: string) => {
        setFormData({
            ...formData,
            receiverProvinceId: provinceId,
            receiverProvinceName: provinceName,
            receiverDistrictId: 0,
            receiverDistrictName: '',
            receiverWardId: 0,
            receiverWardName: ''
        });
        setWards([]);
        if (provinceId) {
            setIsLoadingLocations(true);
            try {
                const res = await shippingAPI.getDistricts(provinceId);
                setDistricts(res.data.districts || []);
            } catch (e) {
                console.error('Failed to load districts:', e);
            } finally {
                setIsLoadingLocations(false);
            }
        } else {
            setDistricts([]);
        }
    };

    // Load wards when district changes
    const handleDistrictChange = async (districtId: number, districtName: string) => {
        setFormData({
            ...formData,
            receiverDistrictId: districtId,
            receiverDistrictName: districtName,
            receiverWardId: 0,
            receiverWardName: ''
        });
        if (districtId) {
            setIsLoadingLocations(true);
            try {
                const res = await shippingAPI.getWards(districtId);
                setWards(res.data.wards || []);
            } catch (e) {
                console.error('Failed to load wards:', e);
            } finally {
                setIsLoadingLocations(false);
            }
        } else {
            setWards([]);
        }
    };

    const addItem = (productId: string) => {
        if (!productId) return;
        const product = products.find(p => p._id === productId);
        if (!product) return;

        const existing = orderItems.find(i => i.productId === productId);
        if (existing) {
            if (existing.quantity < product.quantity) {
                setOrderItems(orderItems.map(i => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i));
            } else {
                toast.error('Không đủ hàng trong kho');
            }
        } else {
            setOrderItems([...orderItems, { productId, productName: product.name, price: product.price, quantity: 1, maxStock: product.quantity }]);
        }
    };

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (orderItems.length === 0) {
            toast.error('Vui lòng thêm ít nhất 1 sản phẩm');
            return;
        }
        if (!formData.customerName || !formData.customerPhone) {
            toast.error('Vui lòng nhập tên và SĐT khách hàng');
            return;
        }

        // Check if customer info was changed
        let shouldUpdateCustomer = false;
        if (formData.customerId && originalCustomer) {
            const hasChanges =
                formData.customerName !== originalCustomer.name ||
                formData.customerPhone !== originalCustomer.phone ||
                formData.customerEmail !== originalCustomer.email ||
                formData.shippingAddress !== originalCustomer.address;

            if (hasChanges) {
                shouldUpdateCustomer = confirm('Bạn đã sửa thông tin khách hàng. Có muốn cập nhật vào hồ sơ khách hàng không?');
            }
        }

        try {
            // Update customer if confirmed
            if (shouldUpdateCustomer && formData.customerId) {
                await customersAPI.update(formData.customerId, {
                    name: formData.customerName,
                    phone: formData.customerPhone,
                    email: formData.customerEmail,
                    address: formData.shippingAddress
                });
            }

            await ordersAPI.create({
                customerId: formData.customerId || '',
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                customerEmail: formData.customerEmail,
                customerSource: formData.customerSource,
                paymentMethod: formData.paymentMethod,
                shippingFee: formData.shippingFee,
                shippingAddress: formData.shippingAddress,
                receiverProvinceId: formData.receiverProvinceId,
                receiverDistrictId: formData.receiverDistrictId,
                receiverWardId: formData.receiverWardId,
                receiverProvinceName: formData.receiverProvinceName,
                receiverDistrictName: formData.receiverDistrictName,
                receiverWardName: formData.receiverWardName,
                note: formData.note,
                items: orderItems.map(i => ({ productId: i.productId, quantity: i.quantity }))
            });
            toast.success(shouldUpdateCustomer ? 'Đã tạo đơn hàng & cập nhật thông tin KH' : 'Đã tạo đơn hàng');
            setShowModal(false);
            setOriginalCustomer(null);
            fetchOrders();
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra');
        }
    };

    const updateStatus = async (orderId: string, status: string) => {
        try {
            await ordersAPI.updateStatus(orderId, status);
            toast.success('Đã cập nhật trạng thái');
            fetchOrders();
            if (selectedOrder?._id === orderId) {
                const { data } = await ordersAPI.getById(orderId);
                setSelectedOrder(data);
            }
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra');
        }
    };

    const cancelOrder = async (orderId: string) => {
        if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
        try {
            await ordersAPI.cancel(orderId, 'Hủy bởi admin');
            toast.success('Đã hủy đơn hàng');
            fetchOrders();
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra');
        }
    };

    const viewDetail = async (order: any) => {
        try {
            const { data } = await ordersAPI.getById(order._id);
            setSelectedOrder(data);
            setShowDetailModal(true);
        } catch (error) {
            toast.error('Không thể tải chi tiết đơn hàng');
        }
    };

    const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">Đơn hàng</h1>
                <button className="btn btn-primary" onClick={openCreateModal}>
                    <Plus className="w-5 h-5" /> Tạo đơn hàng
                </button>
            </div>

            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
                <button className={`btn ${statusFilter === '' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStatusFilter('')}>Tất cả</button>
                {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                    <button key={value} className={`btn ${statusFilter === value ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStatusFilter(value)}>{label}</button>
                ))}
            </div>

            {/* Table */}
            <div className="table-container">
                {isLoading ? (
                    <div className="p-8 text-center"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" /></div>
                ) : orders.length === 0 ? (
                    <div className="p-8 text-center text-dark-500">Không có đơn hàng</div>
                ) : (
                    <table className="table">
                        <thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Sản phẩm</th><th>Tổng tiền</th><th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    <td className="font-medium">{order.orderCode}</td>
                                    <td><div><p className="font-medium">{order.customerName || 'Khách vãng lai'}</p><p className="text-sm text-dark-500">{order.customerPhone}</p></div></td>
                                    <td><span className="badge badge-gray">{order.items.length} SP</span></td>
                                    <td className="font-medium text-green-400">{formatCurrency(order.total)}</td>
                                    <td><span className={`badge badge-${ORDER_STATUS_COLORS[order.status]}`}>{ORDER_STATUS_LABELS[order.status]}</span></td>
                                    <td className="text-dark-400">{formatDate(order.createdAt)}</td>
                                    <td>
                                        <div className="flex gap-1">
                                            <Link href={`/dashboard/orders/${order._id}`} className="btn btn-ghost p-2" title="Xem chi tiết & in"><Eye className="w-4 h-4" /></Link>
                                            {/* Chỉ hiện nút hủy - các trạng thái khác chuyển qua trang chi tiết */}
                                            {['pending', 'processing'].includes(order.status) && (
                                                <button className="btn btn-ghost p-2 text-red-400" title="Hủy đơn hàng" onClick={() => cancelOrder(order._id)}>
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create Order Modal - 2 Column Layout */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-900 border border-dark-800 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b border-dark-800 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Tạo đơn hàng mới</h2>
                            <button type="button" className="btn btn-ghost p-2" onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCreateOrder} className="p-4">
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* LEFT COLUMN - Customer Info */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-primary-400 border-b border-dark-700 pb-2">👤 Thông tin khách hàng</h3>
                                    {/* Smart customer lookup with autocomplete */}
                                    <div className="space-y-3 p-3 bg-dark-800 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-dark-400">Nhập SĐT hoặc Tên để tìm KH</span>
                                            {formData.customerId && (
                                                <button type="button" className="px-2 py-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded-md border border-red-500/40 transition-colors font-medium" onClick={() => setFormData({ ...formData, customerId: '', customerName: '', customerPhone: '', customerEmail: '', shippingAddress: '' })}>
                                                    ✕ Xóa & nhập mới
                                                </button>
                                            )}
                                        </div>

                                        {/* Phone field with suggestions */}
                                        <div className="relative">
                                            <label className="label">Số điện thoại *</label>
                                            <input
                                                className="input"
                                                required
                                                placeholder="Nhập SĐT để tìm hoặc tạo mới"
                                                value={formData.customerPhone}
                                                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                            />
                                            {/* Phone suggestions dropdown */}
                                            {formData.customerPhone && !formData.customerId && formData.customerPhone.length >= 3 && (
                                                (() => {
                                                    const phoneSuggestions = customers.filter(c => c.phone.includes(formData.customerPhone)).slice(0, 5);
                                                    return phoneSuggestions.length > 0 ? (
                                                        <div className="absolute z-10 w-full mt-1 bg-dark-900 border border-dark-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                                            {phoneSuggestions.map(c => (
                                                                <button
                                                                    key={c._id}
                                                                    type="button"
                                                                    className="w-full px-3 py-2 text-left hover:bg-dark-700 flex items-center gap-2 text-sm"
                                                                    onClick={() => {
                                                                        setFormData({
                                                                            ...formData,
                                                                            customerId: c._id,
                                                                            customerName: c.name,
                                                                            customerPhone: c.phone,
                                                                            customerEmail: c.email || '',
                                                                            shippingAddress: c.address || formData.shippingAddress
                                                                        });
                                                                        setOriginalCustomer({
                                                                            name: c.name,
                                                                            phone: c.phone,
                                                                            email: c.email || '',
                                                                            address: c.address || ''
                                                                        });
                                                                    }}
                                                                >
                                                                    <span className="text-primary-400">{c.phone}</span>
                                                                    <span className="text-dark-400">-</span>
                                                                    <span>{c.name}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : null;
                                                })()
                                            )}
                                            {formData.customerId && (
                                                <p className="text-xs text-green-400 mt-1">✓ Khách hàng cũ: {formData.customerName}</p>
                                            )}
                                        </div>

                                        {/* Name field with suggestions */}
                                        <div className="relative">
                                            <label className="label">Tên khách hàng *</label>
                                            <input
                                                className="input"
                                                required
                                                placeholder="Nguyễn Văn A"
                                                value={formData.customerName}
                                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                            />
                                            {/* Name suggestions dropdown */}
                                            {formData.customerName && !formData.customerId && formData.customerName.length >= 2 && (
                                                (() => {
                                                    const nameSuggestions = customers.filter(c =>
                                                        c.name.toLowerCase().includes(formData.customerName.toLowerCase())
                                                    ).slice(0, 5);
                                                    return nameSuggestions.length > 0 ? (
                                                        <div className="absolute z-10 w-full mt-1 bg-dark-900 border border-dark-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                                            {nameSuggestions.map(c => (
                                                                <button
                                                                    key={c._id}
                                                                    type="button"
                                                                    className="w-full px-3 py-2 text-left hover:bg-dark-700 flex items-center gap-2 text-sm"
                                                                    onClick={() => {
                                                                        setFormData({
                                                                            ...formData,
                                                                            customerId: c._id,
                                                                            customerName: c.name,
                                                                            customerPhone: c.phone,
                                                                            customerEmail: c.email || '',
                                                                            shippingAddress: c.address || formData.shippingAddress
                                                                        });
                                                                        setOriginalCustomer({
                                                                            name: c.name,
                                                                            phone: c.phone,
                                                                            email: c.email || '',
                                                                            address: c.address || ''
                                                                        });
                                                                    }}
                                                                >
                                                                    <span className="text-primary-400">{c.name}</span>
                                                                    <span className="text-dark-400">-</span>
                                                                    <span>{c.phone}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : null;
                                                })()
                                            )}
                                        </div>

                                        {/* Shipping Location Dropdowns */}
                                        <div className="space-y-3">
                                            <label className="label">Địa chỉ giao hàng *</label>

                                            {/* Province Dropdown */}
                                            <select
                                                className="input"
                                                value={formData.receiverProvinceId || ''}
                                                onChange={(e) => {
                                                    const selected = provinces.find((p: any) => p.id === parseInt(e.target.value));
                                                    handleProvinceChange(parseInt(e.target.value) || 0, selected?.name || '');
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
                                                value={formData.receiverDistrictId || ''}
                                                onChange={(e) => {
                                                    const selected = districts.find((d: any) => d.id === parseInt(e.target.value));
                                                    handleDistrictChange(parseInt(e.target.value) || 0, selected?.name || '');
                                                }}
                                                disabled={!formData.receiverProvinceId || isLoadingLocations}
                                            >
                                                <option value="">-- Chọn Quận/Huyện --</option>
                                                {districts.map((d: any) => (
                                                    <option key={d.id} value={d.id}>{d.name}</option>
                                                ))}
                                            </select>

                                            {/* Ward Dropdown */}
                                            <select
                                                className="input"
                                                value={formData.receiverWardId || ''}
                                                onChange={(e) => {
                                                    const selected = wards.find((w: any) => w.id === parseInt(e.target.value));
                                                    setFormData({ ...formData, receiverWardId: parseInt(e.target.value) || 0, receiverWardName: selected?.name || '' });
                                                }}
                                                disabled={!formData.receiverDistrictId || isLoadingLocations}
                                            >
                                                <option value="">-- Chọn Phường/Xã --</option>
                                                {wards.map((w: any) => (
                                                    <option key={w.id} value={w.id}>{w.name}</option>
                                                ))}
                                            </select>

                                            {/* Street Address */}
                                            <input
                                                className="input"
                                                required
                                                value={formData.shippingAddress}
                                                onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                                                placeholder="Số nhà, tên đường..."
                                            />

                                            {isLoadingLocations && (
                                                <p className="text-xs text-dark-400">Đang tải địa chỉ...</p>
                                            )}
                                        </div>

                                        {/* Email field */}
                                        <div>
                                            <label className="label">Email (tùy chọn)</label>
                                            <input
                                                type="email"
                                                className="input"
                                                placeholder="email@example.com"
                                                value={formData.customerEmail}
                                                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                            />
                                        </div>

                                        {/* New customer indicator */}
                                        {!formData.customerId && formData.customerPhone && formData.customerName && (
                                            <p className="text-xs text-yellow-400">⚡ Khách hàng mới - sẽ tự động lưu khi tạo đơn</p>
                                        )}
                                    </div>

                                    {/* Customer source & Payment */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="label">Nguồn khách</label>
                                            <select className="input" value={formData.customerSource} onChange={(e) => setFormData({ ...formData, customerSource: e.target.value })}>
                                                <option value="instagram">📷 Instagram</option>
                                                <option value="facebook">📘 Facebook</option>
                                                <option value="other">📱 Khác</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label">Thanh toán</label>
                                            <select className="input" value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}>
                                                <option value="cod">💵 COD</option>
                                                <option value="transfer">🏦 Chuyển khoản</option>
                                                <option value="cash">� Tiền mặt</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT COLUMN - Products */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-primary-400 border-b border-dark-700 pb-2">🛒 Sản phẩm & Thanh toán</h3>

                                    {/* Product selection */}
                                    <div>
                                        <label className="label">Thêm sản phẩm</label>
                                        <select className="input" onChange={(e) => { addItem(e.target.value); e.target.value = ''; }}>
                                            <option value="">-- Chọn sản phẩm --</option>
                                            {products.map(p => <option key={p._id} value={p._id}>{p.name} - {formatCurrency(p.price)} (SL: {p.quantity})</option>)}
                                        </select>
                                    </div>

                                    {orderItems.length > 0 && (
                                        <div className="table-container">
                                            <table className="table">
                                                <thead><tr><th>Sản phẩm</th><th>Số lượng</th><th>Thành tiền</th><th></th></tr></thead>
                                                <tbody>
                                                    {orderItems.map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td>{item.productName}</td>
                                                            <td><input type="number" className="input w-20" min="1" max={item.maxStock} value={item.quantity} onChange={(e) => setOrderItems(orderItems.map((i, j) => j === idx ? { ...i, quantity: parseInt(e.target.value) || 1 } : i))} /></td>
                                                            <td>{formatCurrency(item.price * item.quantity)}</td>
                                                            <td><button type="button" className="btn btn-ghost p-1 text-red-400" onClick={() => setOrderItems(orderItems.filter((_, j) => j !== idx))}><X className="w-4 h-4" /></button></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* Pricing summary with shipping fee */}
                                    <div className="bg-dark-800 rounded-lg p-4 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-dark-400">Tạm tính ({orderItems.length} SP):</span>
                                            <span>{formatCurrency(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-dark-400">Phí ship:</span>
                                            <input
                                                type="text"
                                                className="input w-32 text-right"
                                                placeholder="0"
                                                value={formData.shippingFee ? Number(String(formData.shippingFee).replace(/\./g, '')).toLocaleString('vi-VN') : ''}
                                                onChange={(e) => {
                                                    const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
                                                    setFormData({ ...formData, shippingFee: parseInt(raw) || 0 });
                                                }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-lg font-bold border-t border-dark-700 pt-3">
                                            <span>Tổng cộng:</span>
                                            <span className="text-green-400">{formatCurrency(subtotal + (formData.shippingFee || 0))}</span>
                                        </div>
                                    </div>

                                    {/* Note only */}
                                    <div>
                                        <label className="label">Ghi chú</label>
                                        <textarea className="input" rows={2} value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} placeholder="Ghi chú cho đơn hàng..." />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-dark-800 mt-4">
                                <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn btn-primary flex-1">🛒 Tạo đơn hàng</button>
                            </div>
                        </form>
                    </div>
                </div>
            )
            }

            {/* Detail Modal */}
            {
                showDetailModal && selectedOrder && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-dark-900 border border-dark-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-4 border-b border-dark-800 flex justify-between items-center">
                                <h2 className="text-lg font-semibold">Chi tiết đơn hàng {selectedOrder.orderCode}</h2>
                                <span className={`badge badge-${ORDER_STATUS_COLORS[selectedOrder.status]}`}>{ORDER_STATUS_LABELS[selectedOrder.status]}</span>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4 p-4 bg-dark-800 rounded-lg">
                                    <div><p className="text-dark-500 text-sm">Khách hàng</p><p className="font-medium">{selectedOrder.customerName || '-'}</p></div>
                                    <div><p className="text-dark-500 text-sm">Điện thoại</p><p className="font-medium">{selectedOrder.customerPhone || '-'}</p></div>
                                    <div className="col-span-2"><p className="text-dark-500 text-sm">Địa chỉ</p><p className="font-medium">{selectedOrder.shippingAddress}</p></div>
                                </div>
                                <div className="table-container">
                                    <table className="table">
                                        <thead><tr><th>Sản phẩm</th><th className="text-right">Đơn giá</th><th className="text-center">SL</th><th className="text-right">Thành tiền</th></tr></thead>
                                        <tbody>
                                            {selectedOrder.items.map((item: any, idx: number) => (
                                                <tr key={idx}><td>{item.productName}</td><td className="text-right">{formatCurrency(item.price)}</td><td className="text-center">{item.quantity}</td><td className="text-right font-medium">{formatCurrency(item.price * item.quantity)}</td></tr>
                                            ))}
                                            <tr className="bg-dark-800"><td colSpan={3} className="text-right font-semibold">Tổng cộng:</td><td className="text-right font-bold text-green-400">{formatCurrency(selectedOrder.total)}</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                                {/* Chỉ hiện nút hủy trong modal - các thao tác khác chuyển qua trang chi tiết */}
                                {['pending', 'processing'].includes(selectedOrder.status) && (
                                    <div className="flex gap-2 flex-wrap">
                                        <Link href={`/dashboard/orders/${selectedOrder._id}`} className="btn btn-primary">Xem chi tiết & Gửi ĐVVC</Link>
                                        <button className="btn btn-danger" onClick={() => { cancelOrder(selectedOrder._id); setShowDetailModal(false); }}>Hủy đơn</button>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 border-t border-dark-800">
                                <button className="btn btn-secondary w-full" onClick={() => setShowDetailModal(false)}>Đóng</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
