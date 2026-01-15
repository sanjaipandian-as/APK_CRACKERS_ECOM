import express from "express";
import upload from "../middleware/upload.js";
import { isAdmin } from "../middleware/isAdmin.js";

import {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory
} from "../controllers/categoryController.js";

const router = express.Router();

router.post(
  "/add",
  isAdmin,
  upload.single("icon"),   // category icon upload
  addCategory
);

router.get("/", getCategories);

router.put(
  "/update/:categoryId",
  isAdmin,
  upload.single("icon"),
  updateCategory
);

router.delete(
  "/delete/:categoryId",
  isAdmin,
  deleteCategory
);

export default router;
