import express from 'express';
import * as productController from '../controllers/productController.js';
import { authenticate, checkLicense, checkPlanLimit } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and valid license
router.use(authenticate);
router.use(checkLicense);

router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/low-stock', productController.getLowStock);
router.get('/:id', productController.getProduct);
router.post('/', checkPlanLimit('products'), productController.createProduct);
router.put('/:id', productController.updateProduct);
router.patch('/:id/stock', productController.updateStock);
router.delete('/:id', productController.deleteProduct);

export default router;
