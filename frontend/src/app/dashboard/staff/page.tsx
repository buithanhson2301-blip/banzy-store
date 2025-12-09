'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Key, UserCircle } from 'lucide-react';
import { staffAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

const ROLE_LABELS: Record<string, string> = {
    owner: 'Chủ shop',
    staff: 'Nhân viên bán hàng',
    accountant: 'Kế toán'
};

const ROLE_COLORS: Record<string, string> = {
    owner: 'primary',
    staff: 'success',
    accountant: 'warning'
};

export default function StaffPage() {
    const { user } = useAuthStore();
    const [staff, setStaff] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState<any>(null);
    const [editingStaff, setEditingStaff] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'staff', password: '' });
    const [newPassword, setNewPassword] = useState('');

    const fetchStaff = async () => {
        try {
            const { data } = await staffAPI.getAll();
            setStaff(data);
        } catch (error: any) {
            if (error.message?.includes('quyền')) {
                toast.error('Chỉ chủ shop mới có thể quản lý nhân viên');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchStaff(); }, []);

    const openModal = (staffMember?: any) => {
        if (staffMember) {
            setEditingStaff(staffMember);
            setFormData({ name: staffMember.name, email: staffMember.email, role: staffMember.role, password: '' });
        } else {
            setEditingStaff(null);
            setFormData({ name: '', email: '', role: 'staff', password: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingStaff) {
                await staffAPI.update(editingStaff._id, formData);
                toast.success('Đã cập nhật nhân viên');
            } else {
                await staffAPI.create(formData);
                toast.success('Đã thêm nhân viên mới');
            }
            setShowModal(false);
            fetchStaff();
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (staffMember: any) => {
        if (!confirm(`Bạn có chắc muốn xóa "${staffMember.name}"?`)) return;
        try {
            await staffAPI.delete(staffMember._id);
            toast.success('Đã xóa nhân viên');
            fetchStaff();
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra');
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        try {
            await staffAPI.resetPassword(showPasswordModal._id, newPassword);
            toast.success('Đã đặt lại mật khẩu');
            setShowPasswordModal(null);
            setNewPassword('');
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra');
        }
    };

    // Check if user is owner
    if (user?.role !== 'owner') {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <UserCircle className="w-16 h-16 text-dark-600 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Không có quyền truy cập</h2>
                <p className="text-dark-400">Chỉ chủ shop mới có thể quản lý nhân viên</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý nhân viên</h1>
                    <p className="text-dark-400 text-sm mt-1">Thêm và phân quyền nhân viên cho cửa hàng</p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    <Plus className="w-5 h-5" /> Thêm nhân viên
                </button>
            </div>

            {/* Current user card */}
            <div className="card p-4 border-primary-500/50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-400 text-xl font-bold">
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold">{user?.name} <span className="text-primary-400">(Bạn)</span></p>
                        <p className="text-sm text-dark-400">{user?.email}</p>
                    </div>
                    <span className="badge badge-primary">{ROLE_LABELS.owner}</span>
                </div>
            </div>

            {/* Staff list */}
            <div className="card">
                <div className="p-4 border-b border-dark-800">
                    <h2 className="font-semibold">Danh sách nhân viên</h2>
                </div>
                {isLoading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
                    </div>
                ) : staff.length === 0 ? (
                    <div className="p-8 text-center text-dark-500">
                        <UserCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Chưa có nhân viên nào</p>
                        <button className="btn btn-primary mt-4" onClick={() => openModal()}>
                            <Plus className="w-4 h-4" /> Thêm nhân viên đầu tiên
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-dark-800">
                        {staff.map((member) => (
                            <div key={member._id} className="p-4 flex items-center gap-4 hover:bg-dark-800/50">
                                <div className="w-10 h-10 bg-dark-700 rounded-full flex items-center justify-center text-dark-300 font-medium">
                                    {member.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium">{member.name}</p>
                                    <p className="text-sm text-dark-400 truncate">{member.email}</p>
                                </div>
                                <span className={`badge badge-${ROLE_COLORS[member.role]}`}>
                                    {ROLE_LABELS[member.role]}
                                </span>
                                <div className="flex gap-1">
                                    <button className="btn btn-ghost p-2" onClick={() => setShowPasswordModal(member)} title="Đặt lại mật khẩu">
                                        <Key className="w-4 h-4" />
                                    </button>
                                    <button className="btn btn-ghost p-2" onClick={() => openModal(member)}>
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button className="btn btn-ghost p-2 text-red-400" onClick={() => handleDelete(member)}>
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Role explanation */}
            <div className="card p-4">
                <h3 className="font-semibold mb-3">Phân quyền</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-dark-800 rounded-lg">
                        <span className="badge badge-success mb-2">Nhân viên bán hàng</span>
                        <ul className="text-dark-400 space-y-1">
                            <li>• Tạo và xử lý đơn hàng</li>
                            <li>• Xem sản phẩm và khách hàng</li>
                            <li>• Không xem báo cáo tài chính</li>
                        </ul>
                    </div>
                    <div className="p-3 bg-dark-800 rounded-lg">
                        <span className="badge badge-warning mb-2">Kế toán</span>
                        <ul className="text-dark-400 space-y-1">
                            <li>• Xem báo cáo tài chính</li>
                            <li>• Quản lý xuất nhập kho</li>
                            <li>• Không tạo đơn hàng</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-900 border border-dark-800 rounded-xl w-full max-w-md">
                        <div className="p-4 border-b border-dark-800">
                            <h2 className="text-lg font-semibold">{editingStaff ? 'Sửa nhân viên' : 'Thêm nhân viên mới'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="label">Họ tên *</label>
                                <input className="input" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="label">Email *</label>
                                <input type="email" className="input" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="label">Vai trò *</label>
                                <select className="input" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="staff">Nhân viên bán hàng</option>
                                    <option value="accountant">Kế toán</option>
                                </select>
                            </div>
                            {!editingStaff && (
                                <div>
                                    <label className="label">Mật khẩu (để trống = "changeme123")</label>
                                    <input type="password" className="input" placeholder="Mật khẩu ban đầu" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                                </div>
                            )}
                            <div className="flex gap-3 pt-4">
                                <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn btn-primary flex-1">{editingStaff ? 'Cập nhật' : 'Thêm'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-900 border border-dark-800 rounded-xl w-full max-w-sm">
                        <div className="p-4 border-b border-dark-800">
                            <h2 className="text-lg font-semibold">Đặt lại mật khẩu</h2>
                        </div>
                        <div className="p-4 space-y-4">
                            <p className="text-dark-400">Đặt mật khẩu mới cho <strong>{showPasswordModal.name}</strong></p>
                            <input type="password" className="input" placeholder="Mật khẩu mới (tối thiểu 6 ký tự)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                            <div className="flex gap-3">
                                <button className="btn btn-secondary flex-1" onClick={() => { setShowPasswordModal(null); setNewPassword(''); }}>Hủy</button>
                                <button className="btn btn-primary flex-1" onClick={handleResetPassword}>Xác nhận</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
