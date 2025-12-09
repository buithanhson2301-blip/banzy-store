'use client';

import { useEffect, useState } from 'react';
import { Link2, Link2Off, RefreshCw, Settings, ShoppingBag, Facebook, Package, ShoppingCart, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { integrationsAPI } from '@/lib/api';
import { useAuthStore, formatDate } from '@/lib/store';
import toast from 'react-hot-toast';

interface Integration {
    _id?: string;
    platform: string;
    status: 'connected' | 'disconnected' | 'error';
    settings?: {
        autoSyncProducts: boolean;
        autoSyncOrders: boolean;
        lastSyncAt?: string;
    };
    stats?: {
        totalProductsSynced: number;
        totalOrdersSynced: number;
    };
    credentials?: any;
}

const PLATFORMS = [
    {
        id: 'shopee',
        name: 'Shopee',
        icon: ShoppingBag,
        color: 'orange',
        description: 'Đồng bộ sản phẩm và đơn hàng từ Shopee'
    },
    {
        id: 'lazada',
        name: 'Lazada',
        icon: ShoppingCart,
        color: 'blue',
        description: 'Đồng bộ sản phẩm và đơn hàng từ Lazada'
    },
    {
        id: 'facebook',
        name: 'Facebook Shop',
        icon: Facebook,
        color: 'indigo',
        description: 'Đồng bộ sản phẩm lên Facebook Shop'
    }
];

export default function IntegrationsPage() {
    const { user } = useAuthStore();
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [syncing, setSyncing] = useState<string | null>(null);
    const [showConnectModal, setShowConnectModal] = useState<string | null>(null);
    const [connectData, setConnectData] = useState({ shopId: '', accessToken: '' });

    const fetchIntegrations = async () => {
        try {
            const { data } = await integrationsAPI.getAll();
            setIntegrations(data);
        } catch (error) {
            console.error('Failed to fetch integrations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchIntegrations(); }, []);

    const getIntegration = (platform: string) => {
        return integrations.find(i => i.platform === platform);
    };

    const handleConnect = async (platform: string) => {
        try {
            await integrationsAPI.connect(platform, connectData);
            toast.success(`Đã kết nối ${platform.charAt(0).toUpperCase() + platform.slice(1)}`);
            setShowConnectModal(null);
            setConnectData({ shopId: '', accessToken: '' });
            fetchIntegrations();
        } catch (error: any) {
            toast.error(error.message || 'Kết nối thất bại');
        }
    };

    const handleDisconnect = async (platform: string) => {
        if (!confirm('Bạn có chắc muốn ngắt kết nối?')) return;
        try {
            await integrationsAPI.disconnect(platform);
            toast.success('Đã ngắt kết nối');
            fetchIntegrations();
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra');
        }
    };

    const handleSync = async (platform: string, type: 'products' | 'orders') => {
        setSyncing(`${platform}-${type}`);
        try {
            if (type === 'products') {
                const { data } = await integrationsAPI.syncProducts(platform);
                toast.success(data.message);
            } else {
                const { data } = await integrationsAPI.syncOrders(platform);
                toast.success(data.message);
            }
            fetchIntegrations();
        } catch (error: any) {
            toast.error(error.message || 'Đồng bộ thất bại');
        } finally {
            setSyncing(null);
        }
    };

    if (user?.role !== 'owner') {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <Link2Off className="w-16 h-16 text-dark-600 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Không có quyền truy cập</h2>
                <p className="text-dark-400">Chỉ chủ shop mới có thể quản lý kết nối</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold">Kết nối sàn TMĐT</h1>
                <p className="text-dark-400 text-sm mt-1">Kết nối và đồng bộ dữ liệu với các sàn thương mại điện tử</p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PLATFORMS.map((platform) => {
                        const integration = getIntegration(platform.id);
                        const isConnected = integration?.status === 'connected';
                        const Icon = platform.icon;

                        return (
                            <div key={platform.id} className={`card overflow-hidden ${isConnected ? 'border-green-500/50' : ''}`}>
                                {/* Header */}
                                <div className={`p-4 bg-gradient-to-r from-${platform.color}-500/20 to-${platform.color}-600/10 border-b border-dark-800`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 bg-${platform.color}-500/20 rounded-xl flex items-center justify-center`}>
                                                <Icon className={`w-6 h-6 text-${platform.color}-400`} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{platform.name}</h3>
                                                <span className={`text-xs ${isConnected ? 'text-green-400' : 'text-dark-500'}`}>
                                                    {isConnected ? '● Đã kết nối' : '○ Chưa kết nối'}
                                                </span>
                                            </div>
                                        </div>
                                        {isConnected ? (
                                            <CheckCircle className="w-6 h-6 text-green-400" />
                                        ) : (
                                            <XCircle className="w-6 h-6 text-dark-600" />
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <p className="text-sm text-dark-400 mb-4">{platform.description}</p>

                                    {isConnected && integration?.stats && (
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="bg-dark-800 rounded-lg p-3 text-center">
                                                <Package className="w-5 h-5 mx-auto text-primary-400 mb-1" />
                                                <p className="text-lg font-bold">{integration.stats.totalProductsSynced}</p>
                                                <p className="text-xs text-dark-500">SP đã đồng bộ</p>
                                            </div>
                                            <div className="bg-dark-800 rounded-lg p-3 text-center">
                                                <ShoppingCart className="w-5 h-5 mx-auto text-green-400 mb-1" />
                                                <p className="text-lg font-bold">{integration.stats.totalOrdersSynced}</p>
                                                <p className="text-xs text-dark-500">ĐH đã đồng bộ</p>
                                            </div>
                                        </div>
                                    )}

                                    {isConnected && integration?.settings?.lastSyncAt && (
                                        <p className="text-xs text-dark-500 mb-4">
                                            Đồng bộ lần cuối: {formatDate(integration.settings.lastSyncAt, true)}
                                        </p>
                                    )}

                                    {/* Actions */}
                                    {isConnected ? (
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <button
                                                    className="btn btn-secondary flex-1 text-sm"
                                                    onClick={() => handleSync(platform.id, 'products')}
                                                    disabled={syncing !== null}
                                                >
                                                    {syncing === `${platform.id}-products` ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                                    Đồng bộ SP
                                                </button>
                                                {platform.id !== 'facebook' && (
                                                    <button
                                                        className="btn btn-secondary flex-1 text-sm"
                                                        onClick={() => handleSync(platform.id, 'orders')}
                                                        disabled={syncing !== null}
                                                    >
                                                        {syncing === `${platform.id}-orders` ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                                        Đồng bộ ĐH
                                                    </button>
                                                )}
                                            </div>
                                            <button
                                                className="btn btn-danger w-full text-sm"
                                                onClick={() => handleDisconnect(platform.id)}
                                            >
                                                <Link2Off className="w-4 h-4" /> Ngắt kết nối
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            className="btn btn-primary w-full"
                                            onClick={() => setShowConnectModal(platform.id)}
                                        >
                                            <Link2 className="w-4 h-4" /> Kết nối ngay
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Info */}
            <div className="card p-4">
                <h3 className="font-semibold mb-3">Hướng dẫn kết nối</h3>
                <div className="text-sm text-dark-400 space-y-2">
                    <p>1. Đăng ký tài khoản bán hàng trên sàn TMĐT (Shopee, Lazada, Facebook)</p>
                    <p>2. Đăng ký làm đối tác API của sàn để lấy thông tin kết nối</p>
                    <p>3. Nhập Shop ID và Access Token vào form kết nối</p>
                    <p>4. Sau khi kết nối thành công, sử dụng nút "Đồng bộ" để đồng bộ dữ liệu</p>
                </div>
            </div>

            {/* Connect Modal */}
            {showConnectModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-900 border border-dark-800 rounded-xl w-full max-w-md">
                        <div className="p-4 border-b border-dark-800">
                            <h2 className="text-lg font-semibold">
                                Kết nối {PLATFORMS.find(p => p.id === showConnectModal)?.name}
                            </h2>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="label">Shop ID / Page ID *</label>
                                <input
                                    className="input"
                                    placeholder="Nhập ID shop/page từ sàn"
                                    value={connectData.shopId}
                                    onChange={(e) => setConnectData({ ...connectData, shopId: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="label">Access Token (tùy chọn)</label>
                                <input
                                    className="input"
                                    placeholder="Để trống để dùng token demo"
                                    value={connectData.accessToken}
                                    onChange={(e) => setConnectData({ ...connectData, accessToken: e.target.value })}
                                />
                                <p className="text-xs text-dark-500 mt-1">Để trống nếu chỉ muốn test demo</p>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button className="btn btn-secondary flex-1" onClick={() => setShowConnectModal(null)}>Hủy</button>
                                <button className="btn btn-primary flex-1" onClick={() => handleConnect(showConnectModal)}>Kết nối</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
