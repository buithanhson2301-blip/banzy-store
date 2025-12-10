import express from 'express';
import * as webhookController from '../controllers/webhookController.js';

const router = express.Router();

// Webhook endpoints - NO authentication required (external services call these)

// Viettel Post webhook
router.post('/viettelpost', webhookController.handleViettelPostWebhook);
router.get('/viettelpost', webhookController.webhookHealthCheck);

// Future: Add more shipping providers webhooks here
// router.post('/ghn', webhookController.handleGHNWebhook);
// router.post('/ghtk', webhookController.handleGHTKWebhook);

export default router;
