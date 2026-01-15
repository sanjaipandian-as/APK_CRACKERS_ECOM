import express from "express";
import { getAllPublicSellers, getPublicSellerById } from "../controllers/publicSellerController.js";

const router = express.Router();

// Public route to get all active sellers/shops
router.get("/all", getAllPublicSellers);

// Get single seller public info
router.get("/:sellerId", getPublicSellerById);

export default router;
