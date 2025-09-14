import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { getSales, createSale, updateSaleStatus,  exportSalesToCsv } from '../controllers/sale.controller.js';

const router = Router();

console.log('Sale routes initialized');
router.get('/', authenticateToken, getSales);
router.get('/export', authenticateToken, exportSalesToCsv);
// router.post('/sales', createSale);
router.post('/', authenticateToken, createSale);
router.patch('/:id', authenticateToken, updateSaleStatus);

export default router;