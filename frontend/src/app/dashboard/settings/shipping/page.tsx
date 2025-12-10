'use client';

import { useState, useEffect } from 'react';
import { Truck, Save, CheckCircle, XCircle, AlertCircle, RefreshCw, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { shippingAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Province {
    id: number;
    name: string;
    code?: string;
}

interface District {
    id: number;
    name: string;
    provinceId: number;
}

interface Ward {
    id: number;
    name: string;
    districtId: number;
}

interface SenderInfo {
    fullName: string;
    phone: string;
    address: string;
    provinceId: number | null;
    districtId: number | null;
    wardId: number | null;
    provinceName: string;
    districtName: string;
    wardName: string;
}

export default function ShippingSettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [showToken, setShowToken] = useState(false);

    // Settings state
    const [isConfigured, setIsConfigured] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed'>('pending');
    const [apiToken, setApiToken] = useState('');
    const [hasExistingToken, setHasExistingToken] = useState(false);

    // Sender info
    const [senderInfo, setSenderInfo] = useState<SenderInfo>({
        fullName: '',
        phone: '',
        address: '',
        provinceId: null,
        districtId: null,
        wardId: null,
        provinceName: '',
        districtName: '',
        wardName: ''
    });

    // Location data
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);

    // Load existing settings
    useEffect(() => {
        loadSettings();
        loadProvinces();
    }, []);

    const loadSettings = async () => {
        try {
            const { data } = await shippingAPI.getProviderSettings('viettel_post');
            if (data.isConfigured) {
                setIsConfigured(true);
                setIsActive(data.isActive);
                setHasExistingToken(data.hasToken);
                setVerificationStatus(data.verificationStatus || 'pending');
                if (data.senderInfo) {
                    setSenderInfo(data.senderInfo);
                    // Load districts and wards if province is set
                    if (data.senderInfo.provinceId) {
                        loadDistricts(data.senderInfo.provinceId);
                    }
                    if (data.senderInfo.districtId) {
                        loadWards(data.senderInfo.districtId);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadProvinces = async () => {
        try {
            const { data } = await shippingAPI.getProvinces();
            if (data.success) {
                setProvinces(data.provinces);
            }
        } catch (error) {
            console.error('Failed to load provinces:', error);
        }
    };

    const loadDistricts = async (provinceId: number) => {
        setIsLoadingLocations(true);
        try {
            const { data } = await shippingAPI.getDistricts(provinceId);
            if (data.success) {
                setDistricts(data.districts);
            }
        } catch (error) {
            console.error('Failed to load districts:', error);
        } finally {
            setIsLoadingLocations(false);
        }
    };

    const loadWards = async (districtId: number) => {
        setIsLoadingLocations(true);
        try {
            const { data } = await shippingAPI.getWards(districtId);
            if (data.success) {
                setWards(data.wards);
            }
        } catch (error) {
            console.error('Failed to load wards:', error);
        } finally {
            setIsLoadingLocations(false);
        }
    };

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provinceId = parseInt(e.target.value);
        const province = provinces.find(p => p.id === provinceId);
        setSenderInfo({
            ...senderInfo,
            provinceId,
            provinceName: province?.name || '',
            districtId: null,
            districtName: '',
            wardId: null,
            wardName: ''
        });
        setDistricts([]);
        setWards([]);
        if (provinceId) {
            loadDistricts(provinceId);
        }
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const districtId = parseInt(e.target.value);
        const district = districts.find(d => d.id === districtId);
        setSenderInfo({
            ...senderInfo,
            districtId,
            districtName: district?.name || '',
            wardId: null,
            wardName: ''
        });
        setWards([]);
        if (districtId) {
            loadWards(districtId);
        }
    };

    const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const wardId = parseInt(e.target.value);
        const ward = wards.find(w => w.id === wardId);
        setSenderInfo({
            ...senderInfo,
            wardId,
            wardName: ward?.name || ''
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!senderInfo.fullName || !senderInfo.phone || !senderInfo.address) {
            toast.error('Vui lòng điền đầy đủ thông tin người gửi');
            return;
        }

        if (!hasExistingToken && !apiToken) {
            toast.error('Vui lòng nhập API Token');
            return;
        }

        setIsSaving(true);
        try {
            const payload: any = {
                senderInfo,
                isActive
            };

            // Only send token if it's new or changed
            if (apiToken) {
                payload.apiToken = apiToken;
            }

            await shippingAPI.saveSettings('viettel_post', payload);
            toast.success('Đã lưu cấu hình thành công!');
            setIsConfigured(true);
            setHasExistingToken(true);
            setApiToken(''); // Clear token input after save
            setVerificationStatus('pending');
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra');
        } finally {
            setIsSaving(false);
        }
    };

    const handleVerify = async () => {
        setIsVerifying(true);
        try {
            const { data } = await shippingAPI.verifyToken('viettel_post');
            if (data.success) {
                toast.success(data.message);
                setVerificationStatus('verified');
            } else {
                toast.error(data.message || 'Xác thực thất bại');
                setVerificationStatus('failed');
            }
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra');
            setVerificationStatus('failed');
        } finally {
            setIsVerifying(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-primary-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-3xl">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href="/dashboard/settings" className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <Truck className="w-8 h-8 text-red-500" />
                <div>
                    <h1 className="text-2xl font-bold">Cài đặt Viettel Post</h1>
                    <p className="text-dark-400">Kết nối với Viettel Post để tự động tạo và theo dõi đơn vận chuyển</p>
                </div>
            </div>

            {/* Status Banner */}
            <div className={`p-4 rounded-xl flex items-center gap-3 ${verificationStatus === 'verified'
                    ? 'bg-green-500/10 border border-green-500/30'
                    : verificationStatus === 'failed'
                        ? 'bg-red-500/10 border border-red-500/30'
                        : 'bg-yellow-500/10 border border-yellow-500/30'
                }`}>
                {verificationStatus === 'verified' ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                ) : verificationStatus === 'failed' ? (
                    <XCircle className="w-6 h-6 text-red-500" />
                ) : (
                    <AlertCircle className="w-6 h-6 text-yellow-500" />
                )}
                <div className="flex-1">
                    <p className="font-medium">
                        {verificationStatus === 'verified'
                            ? 'Đã kết nối thành công!'
                            : verificationStatus === 'failed'
                                ? 'Kết nối thất bại'
                                : isConfigured
                                    ? 'Chưa xác thực kết nối'
                                    : 'Chưa cấu hình'}
                    </p>
                    <p className="text-sm text-dark-400">
                        {verificationStatus === 'verified'
                            ? 'Hệ thống đã sẵn sàng tạo đơn vận chuyển tự động'
                            : 'Vui lòng cấu hình và xác thực kết nối'}
                    </p>
                </div>
                {isConfigured && hasExistingToken && (
                    <button
                        onClick={handleVerify}
                        disabled={isVerifying}
                        className="btn btn-secondary"
                    >
                        {isVerifying ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                            <RefreshCw className="w-5 h-5" />
                        )}
                        Kiểm tra kết nối
                    </button>
                )}
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* API Token Section */}
                <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        🔑 API Token
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="label">
                                API Token {hasExistingToken ? '(đã lưu - nhập mới để thay đổi)' : '*'}
                            </label>
                            <div className="relative">
                                <input
                                    type={showToken ? 'text' : 'password'}
                                    className="input pr-10 font-mono text-sm"
                                    value={apiToken}
                                    onChange={(e) => setApiToken(e.target.value)}
                                    placeholder={hasExistingToken ? '••••••••••••••••••••' : 'Dán token từ partner.viettelpost.vn'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowToken(!showToken)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
                                >
                                    {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="text-sm text-dark-400 mt-1">
                                Lấy token tại: <a href="https://partner.viettelpost.vn" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">partner.viettelpost.vn</a> → Get token → Login
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500"
                            />
                            <label htmlFor="isActive" className="text-sm">
                                Kích hoạt tích hợp Viettel Post
                            </label>
                        </div>
                    </div>
                </div>

                {/* Sender Info Section */}
                <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        📍 Thông tin người gửi (Kho hàng)
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Tên người gửi *</label>
                            <input
                                className="input"
                                value={senderInfo.fullName}
                                onChange={(e) => setSenderInfo({ ...senderInfo, fullName: e.target.value })}
                                placeholder="VD: Nguyễn Văn A"
                                required
                            />
                        </div>
                        <div>
                            <label className="label">Số điện thoại *</label>
                            <input
                                className="input"
                                value={senderInfo.phone}
                                onChange={(e) => setSenderInfo({ ...senderInfo, phone: e.target.value })}
                                placeholder="VD: 0909123456"
                                required
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="label">Địa chỉ kho hàng *</label>
                        <input
                            className="input"
                            value={senderInfo.address}
                            onChange={(e) => setSenderInfo({ ...senderInfo, address: e.target.value })}
                            placeholder="VD: 123 Nguyễn Huệ"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                            <label className="label">Tỉnh/Thành phố</label>
                            <select
                                className="input"
                                value={senderInfo.provinceId || ''}
                                onChange={handleProvinceChange}
                            >
                                <option value="">Chọn tỉnh/thành</option>
                                {provinces.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label">Quận/Huyện</label>
                            <select
                                className="input"
                                value={senderInfo.districtId || ''}
                                onChange={handleDistrictChange}
                                disabled={!senderInfo.provinceId || isLoadingLocations}
                            >
                                <option value="">Chọn quận/huyện</option>
                                {districts.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label">Phường/Xã</label>
                            <select
                                className="input"
                                value={senderInfo.wardId || ''}
                                onChange={handleWardChange}
                                disabled={!senderInfo.districtId || isLoadingLocations}
                            >
                                <option value="">Chọn phường/xã</option>
                                {wards.map(w => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-3">
                    <Link href="/dashboard/settings" className="btn btn-secondary">
                        Hủy
                    </Link>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        Lưu cấu hình
                    </button>
                </div>
            </form>

            {/* Instructions */}
            <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">📖 Hướng dẫn lấy API Token</h2>
                <ol className="list-decimal list-inside space-y-2 text-dark-300">
                    <li>Truy cập <a href="https://partner.viettelpost.vn" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">partner.viettelpost.vn</a></li>
                    <li>Đăng nhập bằng tài khoản Viettel Post</li>
                    <li>Tìm mục <strong>"Get token"</strong> → Click <strong>"Login"</strong></li>
                    <li>Nhập Username và Password, bấm <strong>"POST"</strong></li>
                    <li>Copy giá trị <strong>"token"</strong> trong kết quả trả về</li>
                    <li>Dán vào ô API Token ở trên và lưu</li>
                </ol>
            </div>
        </div>
    );
}
