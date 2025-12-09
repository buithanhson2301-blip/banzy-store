import express from 'express';
import * as integrationController from '../controllers/integrationController.js';
import { authenticate, checkLicense, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(checkLicense);

// Get all integrations
router.get('/', integrationController.getIntegrations);

// Get single integration
router.get('/:platform', integrationController.getIntegration);

// Connect platform (owner only)
router.post('/:platform/connect', authorize('owner'), integrationController.connectPlatform);

// Disconnect platform (owner only)
router.post('/:platform/disconnect', authorize('owner'), integrationController.disconnectPlatform);

// Update settings (owner only)
router.patch('/:platform/settings', authorize('owner'), integrationController.updateSettings);

// Sync products
router.post('/:platform/sync-products', authorize('owner', 'accountant'), integrationController.syncProducts);

// Sync orders
router.post('/:platform/sync-orders', authorize('owner', 'accountant'), integrationController.syncOrders);

export default router;
