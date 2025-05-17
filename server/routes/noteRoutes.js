import express from "express";
import {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
  getNotesByCategory,
  getHomeNotes,
  getCategoryNotesStats,
  getRecentNotesStats,
  exportNotes,
  importNotes,
} from "../controllers/noteController.js";
import multer from "multer";

const router = express.Router();
const upload = multer();

router.post("/", createNote);
router.get("/user/:userId", getNotes);
router.get("/home/:userId", getHomeNotes);
router.get("/:id", getNote);
router.get("/categories/:userId/:categoryId", getNotesByCategory);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);
router.get("/stats/categories/:userId", getCategoryNotesStats);
router.get("/stats/recent/:userId", getRecentNotesStats);

// 导出导入路由
router.get("/export/:userId", exportNotes);
router.post("/import/:userId", upload.single("file"), importNotes);

export default router;
