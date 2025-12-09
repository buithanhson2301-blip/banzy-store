import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
    title: 'QALY BAHA - Quản lý bán hàng online',
    description: 'Hệ thống quản lý bán hàng online dành cho các shop nhỏ lẻ',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="vi">
            <body>
                {children}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#1f2937',
                            color: '#f9fafb',
                            border: '1px solid #374151',
                        },
                        success: {
                            iconTheme: {
                                primary: '#10b981',
                                secondary: '#f9fafb',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#f9fafb',
                            },
                        },
                    }}
                />
            </body>
        </html>
    );
}
