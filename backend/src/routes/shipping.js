import express from 'express';
import { authenticate, checkLicense } from '../middleware/auth.js';
import * as shippingController from '../controllers/shippingController.js';

const router = express.Router();

// All routes require authentication and license check
router.use(authenticate);
router.use(checkLicense);

// ==================== Settings ====================

// Get all shipping provider settings for current shop
router.get('/settings', shippingController.getShippingSettings);

// Get settings for a specific provider
router.get('/settings/:provider', shippingController.getProviderSettings);

// Save/Update settings for a provider
router.post('/settings/:provider', shippingController.saveShippingSettings);

// Verify token for a provider
router.post('/settings/:provider/verify', shippingController.verifyToken);

// ==================== Orders ====================

// Send order to shipping provider
router.post('/orders/:orderId/send', shippingController.sendOrderToShipping);

// Track order status
router.get('/orders/:orderId/track', shippingController.trackOrder);

// Cancel shipping
router.post('/orders/:orderId/cancel', shippingController.cancelShipping);

// ==================== Utilities ====================

// Calculate shipping fee
router.post('/calculate-fee', shippingController.calculateFee);

// Get location data
router.get('/locations/provinces', shippingController.getProvinces);
router.get('/locations/districts/:provinceId', shippingController.getDistricts);
router.get('/locations/wards/:districtId', shippingController.getWards);

export default router;
