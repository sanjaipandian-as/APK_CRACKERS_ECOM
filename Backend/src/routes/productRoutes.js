
import express from 'express';
import { 
    addProduct, 
    getSellerProducts, 
    bulkImportProducts, 
    updateProduct, // Import this
    deleteProduct  // Import this
} from '../controllers/productController.js';
import { authenticate } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post('/add', authenticate, upload.array('images', 5), addProduct);
router.get('/my-products', authenticate, getSellerProducts);
router.post('/bulk-import', authenticate, bulkImportProducts);

// --- ADD THESE ROUTES ---
router.put('/:productId', authenticate, upload.array('images', 5), updateProduct);
router.delete('/:productId', authenticate , deleteProduct);

export default router;