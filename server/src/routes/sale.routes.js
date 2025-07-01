import { Router } from 'express';
import { getSales, createSale } from '../controllers/sale.controller.js';

const router = Router();

router.get('/sales', getSales);
router.post('/sales', createSale);

export default router;