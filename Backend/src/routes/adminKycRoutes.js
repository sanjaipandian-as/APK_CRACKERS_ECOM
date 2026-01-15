import express from "express";
import { authenticate } from "../middleware/auth.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { reviewKYC, getPendingKYCs } from "../controllers/adminKycController.js";

const router = express.Router();

// /api/admin/kyc/review/:kycId
router.put("/review/:kycId", authenticate, isAdmin, reviewKYC);

// /api/admin/kyc/pending
router.get("/pending", authenticate, isAdmin, getPendingKYCs);

export default router;
