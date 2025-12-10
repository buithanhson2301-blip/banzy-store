'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Printer, FileText, Truck, RefreshCw, ExternalLink, Package } from 'lucide-react';
import { ordersAPI, shippingAPI } from '@/lib/api';
import { formatCurrency, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, SHIPPING_PROVIDER_LABELS, useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { shop } = useAuthStore();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await ordersAPI.getById(id as string);
        setOrder(data);
      } catch (error) {
        toast.error('Không thể tải đơn hàng');
        router.push('/dashboard/orders');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id, router]);

  const printInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hóa đơn ${order.orderCode}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; font-size: 14px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .header h1 { font-size: 24px; margin-bottom: 5px; }
          .header .shop-name { font-size: 18px; font-weight: bold; color: #333; }
          .info { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .info-box { flex: 1; }
          .info-box h3 { font-size: 12px; text-transform: uppercase; color: #666; margin-bottom: 8px; }
          .info-box p { margin: 4px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: #f5f5f5; font-weight: 600; }
          .text-right { text-align: right; }
          .total { font-size: 18px; font-weight: bold; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
          @media print {
            body { padding: 0; }
            @page { margin: 1cm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="shop-name">${shop?.name || 'QALY BAHA'}</div>
          <h1>HÓA ĐƠN BÁN HÀNG</h1>
          <p>Mã đơn: <strong>${order.orderCode}</strong></p>
          <p>Ngày: ${formatDate(order.createdAt, true)}</p>
        </div>
        
        <div class="info">
          <div class="info-box">
            <h3>Thông tin khách hàng</h3>
            <p><strong>${order.customerName || 'Khách vãng lai'}</strong></p>
            <p>ĐT: ${order.customerPhone || '-'}</p>
            <p>Địa chỉ: ${order.shippingAddress || '-'}</p>
          </div>
          <div class="info-box" style="text-align: right;">
            <h3>Trạng thái</h3>
            <p><strong>${ORDER_STATUS_LABELS[order.status]}</strong></p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="width: 40px;">STT</th>
              <th>Sản phẩm</th>
              <th class="text-right" style="width: 100px;">Đơn giá</th>
              <th class="text-right" style="width: 60px;">SL</th>
              <th class="text-right" style="width: 120px;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item: any, idx: number) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${item.productName}</td>
                <td class="text-right">${formatCurrency(item.price)}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">${formatCurrency(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" class="text-right"><strong>Tổng cộng:</strong></td>
              <td class="text-right total">${formatCurrency(order.total)}</td>
            </tr>
          </tfoot>
        </table>
        
        ${order.note ? `<p><strong>Ghi chú:</strong> ${order.note}</p>` : ''}
        
        <div class="footer">
          <p>Cảm ơn quý khách đã mua hàng!</p>
          <p>Powered by QALY BAHA</p>
        </div>
        
        <script>window.print();</script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const printDelivery = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Phiếu giao hàng ${order.orderCode}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; font-size: 14px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { font-size: 24px; margin-bottom: 5px; border: 2px solid #333; padding: 10px; display: inline-block; }
          .important { background: #f8f8f8; padding: 15px; border: 1px dashed #ccc; margin-bottom: 20px; }
          .important h2 { font-size: 16px; margin-bottom: 10px; }
          .recipient { font-size: 18px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f5f5f5; }
          .text-right { text-align: right; }
          .cod { font-size: 20px; font-weight: bold; color: #d00; text-align: center; margin-top: 20px; padding: 20px; border: 2px solid #d00; }
          .signatures { display: flex; justify-content: space-between; margin-top: 50px; text-align: center; }
          .signatures div { width: 30%; }
          .signatures p:first-child { font-weight: bold; margin-bottom: 60px; }
          @media print {
            body { padding: 0; }
            @page { margin: 1cm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PHIẾU GIAO HÀNG</h1>
          <p style="margin-top: 10px;">Mã đơn: <strong>${order.orderCode}</strong> | Ngày: ${formatDate(order.createdAt)}</p>
        </div>
        
        <div class="important">
          <h2>NGƯỜI NHẬN</h2>
          <p class="recipient">${order.customerName || 'Khách vãng lai'}</p>
          <p>ĐT: <strong>${order.customerPhone || '-'}</strong></p>
          <p>Địa chỉ: <strong>${order.shippingAddress}</strong></p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Sản phẩm</th>
              <th class="text-right">SL</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item: any, idx: number) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${item.productName}</td>
                <td class="text-right">${item.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="cod">
          THU HỘ (COD): ${formatCurrency(order.total)}
        </div>
        
        <div class="signatures">
          <div>
            <p>Người gửi</p>
            <p>${shop?.name || ''}</p>
          </div>
          <div>
            <p>Người vận chuyển</p>
            <p>________________</p>
          </div>
          <div>
            <p>Người nhận</p>
            <p>________________</p>
          </div>
        </div>
        
        <script>window.print();</script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button className="btn btn-ghost p-2" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Đơn hàng {order.orderCode}</h1>
            <span className={`badge badge-${ORDER_STATUS_COLORS[order.status]}`}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={printInvoice}>
            <FileText className="w-4 h-4" /> In hóa đơn
          </button>
          <button className="btn btn-secondary" onClick={printDelivery}>
            <Truck className="w-4 h-4" /> In phiếu giao
          </button>
        </div>
      </div>

      {/* Order Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className="font-semibold mb-3">Thông tin khách hàng</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-dark-400">Tên:</span> <span className="font-medium">{order.customerName || 'Khách vãng lai'}</span></p>
            <p><span className="text-dark-400">Điện thoại:</span> {order.customerPhone || '-'}</p>
            <p><span className="text-dark-400">Địa chỉ giao:</span> {order.shippingAddress}</p>
          </div>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold mb-3">Thông tin đơn hàng</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-dark-400">Mã đơn:</span> <span className="font-mono">{order.orderCode}</span></p>
            <p><span className="text-dark-400">Ngày tạo:</span> {formatDate(order.createdAt, true)}</p>
            {order.note && <p><span className="text-dark-400">Ghi chú:</span> {order.note}</p>}
          </div>
        </div>
      </div>

      {/* Shipping Info Section */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-red-500" />
            Thông tin vận chuyển
          </h3>
          {order.trackingCode && (
            <a
              href={`https://viettelpost.vn/tra-cuu?id=${order.trackingCode}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-400 hover:underline flex items-center gap-1"
            >
              Tra cứu trên VTP <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {order.trackingCode ? (
          // Đã gửi cho ĐVVC
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-dark-400">Đơn vị VC</p>
                <p className="font-medium">{SHIPPING_PROVIDER_LABELS[order.shippingProvider] || order.shippingProvider}</p>
              </div>
              <div>
                <p className="text-dark-400">Mã vận đơn</p>
                <p className="font-mono font-medium text-primary-400">{order.trackingCode}</p>
              </div>
              <div>
                <p className="text-dark-400">Trạng thái VC</p>
                <p className="font-medium">{order.shippingStatus || 'Đang xử lý'}</p>
              </div>
              <div>
                <p className="text-dark-400">Cập nhật lúc</p>
                <p className="font-medium">{order.shippingUpdatedAt ? formatDate(order.shippingUpdatedAt, true) : '-'}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                className="btn btn-secondary"
                onClick={async () => {
                  try {
                    toast.loading('Đang cập nhật...', { id: 'tracking' });
                    const { data: trackResult } = await shippingAPI.trackOrder(order._id);
                    if (trackResult.success) {
                      toast.success(`Trạng thái: ${trackResult.shippingStatus}`, { id: 'tracking' });
                      const { data } = await ordersAPI.getById(id as string);
                      setOrder(data);
                    } else {
                      toast.error(trackResult.message || 'Không thể cập nhật', { id: 'tracking' });
                    }
                  } catch (e: any) {
                    toast.error(e.message, { id: 'tracking' });
                  }
                }}
              >
                <RefreshCw className="w-4 h-4" />
                Cập nhật trạng thái
              </button>
            </div>
          </div>
        ) : (
          // Chưa gửi ĐVVC
          <div className="space-y-3">
            <p className="text-dark-400 text-sm">
              Đơn hàng chưa được gửi cho đơn vị vận chuyển.
            </p>
            {['pending', 'processing', 'ready_to_ship'].includes(order.status) && (
              <button
                className="btn btn-primary"
                onClick={async () => {
                  if (!confirm('Gửi đơn hàng này cho Viettel Post?')) return;
                  try {
                    toast.loading('Đang tạo đơn vận chuyển...', { id: 'shipping' });
                    const { data: result } = await shippingAPI.sendToShipping(order._id, 'viettel_post');
                    if (result.success) {
                      toast.success(`Thành công! Mã vận đơn: ${result.trackingCode}`, { id: 'shipping' });
                      const { data } = await ordersAPI.getById(id as string);
                      setOrder(data);
                    } else {
                      toast.error(result.message || 'Có lỗi xảy ra', { id: 'shipping' });
                    }
                  } catch (e: any) {
                    toast.error(e.message || 'Không thể gửi đơn. Vui lòng kiểm tra cấu hình Viettel Post.', { id: 'shipping' });
                  }
                }}
              >
                <Truck className="w-4 h-4" />
                Gửi cho Viettel Post
              </button>
            )}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="card">
        <div className="p-4 border-b border-dark-800">
          <h3 className="font-semibold">Chi tiết sản phẩm</h3>
        </div>
        <div className="table-container border-0 rounded-none">
          <table className="table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th className="text-right">Đơn giá</th>
                <th className="text-center">SL</th>
                <th className="text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="font-medium">{item.productName}</td>
                  <td className="text-right">{formatCurrency(item.price)}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-right font-medium">{formatCurrency(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-dark-800">
                <td colSpan={3} className="text-right font-semibold">Tổng cộng:</td>
                <td className="text-right font-bold text-lg text-green-400">{formatCurrency(order.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Status Actions */}
      {!['completed', 'cancelled'].includes(order.status) && (
        <div className="card p-4">
          <h3 className="font-semibold mb-4">Cập nhật trạng thái</h3>
          <div className="flex flex-wrap gap-3">
            {order.status === 'pending' && (
              <button
                className="btn btn-primary"
                onClick={async () => {
                  try {
                    await ordersAPI.updateStatus(order._id, 'processing');
                    toast.success('Đã xác nhận đơn hàng');
                    const { data } = await ordersAPI.getById(id as string);
                    setOrder(data);
                  } catch (e: any) { toast.error(e.message); }
                }}
              >
                ✓ Xác nhận đơn hàng
              </button>
            )}
            {order.status === 'processing' && (
              <button
                className="btn btn-primary"
                onClick={async () => {
                  try {
                    await ordersAPI.updateStatus(order._id, 'shipping');
                    toast.success('Đã chuyển sang đang giao');
                    const { data } = await ordersAPI.getById(id as string);
                    setOrder(data);
                  } catch (e: any) { toast.error(e.message); }
                }}
              >
                🚚 Bắt đầu giao hàng
              </button>
            )}
            {order.status === 'shipping' && (
              <button
                className="btn btn-primary"
                onClick={async () => {
                  try {
                    await ordersAPI.updateStatus(order._id, 'completed');
                    toast.success('Đơn hàng hoàn thành!');
                    const { data } = await ordersAPI.getById(id as string);
                    setOrder(data);
                  } catch (e: any) { toast.error(e.message); }
                }}
              >
                ✅ Hoàn thành đơn hàng
              </button>
            )}
            <button
              className="btn btn-danger"
              onClick={async () => {
                if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
                try {
                  await ordersAPI.cancel(order._id, 'Hủy bởi admin');
                  toast.success('Đã hủy đơn hàng');
                  const { data } = await ordersAPI.getById(id as string);
                  setOrder(data);
                } catch (e: any) { toast.error(e.message); }
              }}
            >
              ✕ Hủy đơn hàng
            </button>
          </div>
        </div>
      )}

      {/* Status History */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <div className="card p-4">
          <h3 className="font-semibold mb-4">Lịch sử trạng thái</h3>
          <div className="space-y-3">
            {order.statusHistory.map((history: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4 text-sm">
                <div className="w-2 h-2 bg-primary-500 rounded-full" />
                <div className="flex-1">
                  <span className="font-medium">{ORDER_STATUS_LABELS[history.status]}</span>
                  <span className="text-dark-500 ml-2">{formatDate(history.changedAt, true)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
