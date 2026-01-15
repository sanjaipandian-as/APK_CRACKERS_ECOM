import express from "express";
import { authenticate } from "../middleware/auth.js";
import { getSellerDashboard } from "../controllers/sellerAnalyticsController.js";

const router = express.Router();

router.get("/dashboard", authenticate, getSellerDashboard);

export default router;
