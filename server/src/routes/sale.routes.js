import { Router } from 'express';
import { getSales, createSale, updateSaleStatus } from '../controllers/sale.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

console.log('Sale routes initialized');
router.get('/sales', getSales);
// router.post('/sales', createSale);
router.patch('/sales/:id', updateSaleStatus);
router.post('/sales', authenticateToken, createSale);

export default router;