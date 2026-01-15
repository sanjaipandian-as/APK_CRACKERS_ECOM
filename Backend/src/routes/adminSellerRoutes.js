import express from "express";
import { isAdmin } from "../middleware/isAdmin.js";
import {
  blockSeller,
  unblockSeller,
  getAllSellers
} from "../controllers/adminSellerController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, isAdmin, getAllSellers);
router.put("/block/:sellerId", authenticate, isAdmin, blockSeller);
router.put("/unblock/:sellerId", authenticate, isAdmin, unblockSeller);


export default router;
