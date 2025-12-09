import express from 'express';
import * as supplierController from '../controllers/supplierController.js';
import { authenticate, checkLicense, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(checkLicense);

// Staff and accountant can view, only owner can modify
router.get('/', supplierController.getSuppliers);
router.get('/:id', supplierController.getSupplier);
router.post('/', authorize('owner', 'accountant'), supplierController.createSupplier);
router.put('/:id', authorize('owner', 'accountant'), supplierController.updateSupplier);
router.delete('/:id', authorize('owner'), supplierController.deleteSupplier);

export default router;
