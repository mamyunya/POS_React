import { Router } from 'express';
import { getProducts, createProduct } from '../controllers/product.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();
console.log('Product routes initialized');
router.post('/products', authenticateToken, createProduct);

// GETリクエストで /products にアクセスが来たら getProducts 関数を実行
router.get('/products', getProducts);

// // POSTリクエストで /products にアクセスが来たら createProduct 関数を実行
// router.post('/products', createProduct);

export default router;