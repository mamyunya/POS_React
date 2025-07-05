import { Router } from 'express';
import { getSales, createSale, updateSaleStatus } from '../controllers/sale.controller.js';

const router = Router();

router.get('/sales', getSales);
router.post('/sales', createSale);
router.patch('/sales/:id', updateSaleStatus);

export default router;