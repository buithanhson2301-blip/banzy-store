import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { authenticate, checkLicense } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(checkLicense);

router.get('/', orderController.getOrders);
router.get('/stats', orderController.getOrderStats);
router.get('/:id', orderController.getOrder);
router.post('/', orderController.createOrder);
router.patch('/:id/status', orderController.updateOrderStatus);
router.post('/:id/cancel', orderController.cancelOrder);

export default router;
