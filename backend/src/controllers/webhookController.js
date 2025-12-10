import { Order } from '../models/index.js';
import ShippingProvider from '../models/ShippingProvider.js';
import { VTP_STATUS_MAP } from '../services/viettelPostService.js';
import crypto from 'crypto';

/**
 * Handle Viettel Post webhook for status updates
 * Endpoint: POST /webhooks/viettelpost
 */
export const handleViettelPostWebhook = async (req, res) => {
    try {
        console.log('ViettelPost Webhook received:', JSON.stringify(req.body));

        const {
            ORDER_NUMBER,
            ORDER_STATUS,
            STATUS_NAME,
            NOTE,
            TIME
        } = req.body;

        if (!ORDER_NUMBER) {
            return res.status(400).json({ message: 'Missing ORDER_NUMBER' });
        }

        // Find order by tracking code
        const order = await Order.findOne({ trackingCode: ORDER_NUMBER });

        if (!order) {
            console.log(`Webhook: Order not found for tracking code ${ORDER_NUMBER}`);
            // Return 200 to prevent VTP from retrying
            return res.json({
                success: false,
                message: 'Order not found',
                orderNumber: ORDER_NUMBER
            });
        }

        // Optional: Verify webhook signature if configured
        const settings = await ShippingProvider.findOne({
            shopId: order.shopId,
            provider: 'viettel_post'
        });

        if (settings?.webhookSecret) {
            const signature = req.headers['x-vtp-signature'];
            if (signature) {
                const expectedSig = crypto
                    .createHmac('sha256', settings.webhookSecret)
                    .update(JSON.stringify(req.body))
                    .digest('hex');

                if (signature !== expectedSig) {
                    console.log('Webhook signature mismatch');
                    return res.status(401).json({ message: 'Invalid signature' });
                }
            }
        }

        // Map VTP status to our system status
        const statusInfo = VTP_STATUS_MAP[ORDER_STATUS] || VTP_STATUS_MAP['-1'];

        // Update order
        const previousStatus = order.shippingStatusCode;
        order.shippingStatus = STATUS_NAME || statusInfo.label;
        order.shippingStatusCode = ORDER_STATUS;
        order.shippingUpdatedAt = TIME ? new Date(TIME) : new Date();

        // Update main order status if different
        if (statusInfo.status && statusInfo.status !== order.status) {
            // Don't downgrade from completed
            if (order.status !== 'completed' || statusInfo.status === 'completed') {
                order.status = statusInfo.status;
                order.statusHistory.push({
                    status: statusInfo.status,
                    note: `[Viettel Post] ${STATUS_NAME || statusInfo.label}${NOTE ? ': ' + NOTE : ''}`,
                    changedBy: null, // System update
                    changedAt: order.shippingUpdatedAt
                });
            }
        }

        // Handle special cases
        if (ORDER_STATUS === 200 || ORDER_STATUS === 201) {
            // Giao thành công
            order.actualDelivery = order.shippingUpdatedAt;
        }

        await order.save();

        console.log(`Webhook: Updated order ${order.orderCode} status from ${previousStatus} to ${ORDER_STATUS}`);

        // Return success
        res.json({
            success: true,
            message: 'Status updated',
            orderCode: order.orderCode,
            trackingCode: ORDER_NUMBER,
            newStatus: statusInfo.status
        });

    } catch (error) {
        console.error('ViettelPost webhook error:', error);
        // Return 200 to prevent retries, but log the error
        res.json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Webhook health check
 * Endpoint: GET /webhooks/viettelpost
 */
export const webhookHealthCheck = async (req, res) => {
    res.json({
        status: 'ok',
        service: 'viettelpost-webhook',
        timestamp: new Date().toISOString()
    });
};
