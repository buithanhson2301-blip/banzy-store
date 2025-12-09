'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    Package,
    LayoutDashboard,
    ShoppingCart,
    Users,
    BarChart3,
    Menu,
    X,
    LogOut,
    ChevronDown,
    Warehouse,
    UserCog,
    Truck,
    Link2,
    Settings
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { href: '/dashboard/products', label: 'Sản phẩm', icon: Package },
    { href: '/dashboard/orders', label: 'Đơn hàng', icon: ShoppingCart },
    { href: '/dashboard/customers', label: 'Khách hàng', icon: Users },
    { href: '/dashboard/suppliers', label: 'Nhà cung cấp', icon: Truck },
    { href: '/dashboard/inventory', label: 'Tồn kho', icon: Warehouse },
    { href: '/dashboard/reports', label: 'Báo cáo', icon: BarChart3 },
    { href: '/dashboard/integrations', label: 'Kết nối sàn', icon: Link2 },
    { href: '/dashboard/staff', label: 'Nhân viên', icon: UserCog },
    { href: '/dashboard/settings', label: 'Cài đặt', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, shop, isLoading, isAuthenticated, fetchUser, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-950">
                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-dark-950 flex">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-dark-900 border-r border-dark-800
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-dark-800">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-lg">QALY BAHA</span>
                    </Link>
                    <button className="lg:hidden text-dark-400" onClick={() => setSidebarOpen(false)}>
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Shop name */}
                <div className="px-4 py-3 border-b border-dark-800">
                    <p className="text-xs text-dark-500 uppercase tracking-wider">Cửa hàng</p>
                    <p className="font-medium truncate">{shop?.name || 'My Shop'}</p>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* License info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-800">
                    <div className="text-xs text-dark-500 mb-1">
                        Gói: <span className="text-primary-400 capitalize">{shop?.license?.plan || 'free'}</span>
                    </div>
                    {shop?.license?.status === 'trial' && (
                        <div className="text-xs text-yellow-400">
                            Dùng thử: còn {Math.ceil((new Date(shop.license.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} ngày
                        </div>
                    )}
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top navbar */}
                <header className="h-16 bg-dark-900 border-b border-dark-800 flex items-center justify-between px-4">
                    <button className="lg:hidden text-dark-400" onClick={() => setSidebarOpen(true)}>
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex-1" />

                    {/* User menu */}
                    <div className="relative">
                        <button
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-800 transition"
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <span className="hidden sm:block">{user?.name || 'User'}</span>
                            <ChevronDown className="w-4 h-4 text-dark-400" />
                        </button>

                        {userMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                                <div className="absolute right-0 top-full mt-2 w-48 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-20 py-1">
                                    <div className="px-3 py-2 border-b border-dark-700">
                                        <p className="font-medium truncate">{user?.name}</p>
                                        <p className="text-xs text-dark-400 truncate">{user?.email}</p>
                                    </div>
                                    <button
                                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-400 hover:bg-dark-700"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Đăng xuất
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 md:p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
