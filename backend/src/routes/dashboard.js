import express from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { authenticate, checkLicense } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(checkLicense);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/revenue', dashboardController.getRevenueReport);
router.get('/top-products', dashboardController.getTopProducts);
router.get('/recent-orders', dashboardController.getRecentOrders);

export default router;
