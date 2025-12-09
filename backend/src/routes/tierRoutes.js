import express from 'express';
import { getTierSettings, updateTierSettings } from '../controllers/tierController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getTierSettings);
router.put('/', updateTierSettings);

export default router;
