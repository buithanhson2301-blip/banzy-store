import express from 'express';
import * as customerController from '../controllers/customerController.js';
import { authenticate, checkLicense } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(checkLicense);

router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomer);
router.get('/:id/orders', customerController.getCustomerOrders);
router.post('/', customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

export default router;
