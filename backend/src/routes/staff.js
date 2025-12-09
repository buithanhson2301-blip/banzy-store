import express from 'express';
import * as staffController from '../controllers/staffController.js';
import { authenticate, checkLicense, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication, valid license, and owner role
router.use(authenticate);
router.use(checkLicense);
router.use(authorize('owner'));

router.get('/', staffController.getStaff);
router.post('/', staffController.inviteStaff);
router.put('/:id', staffController.updateStaff);
router.delete('/:id', staffController.deleteStaff);
router.post('/:id/reset-password', staffController.resetStaffPassword);

export default router;
