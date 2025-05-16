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
} from "../controllers/noteController.js";

const router = express.Router();

router.post("/", createNote);
router.get("/user/:userId", getNotes);
router.get("/home/:userId", getHomeNotes);
router.get("/:id", getNote);
router.get("/categories/:userId/:categoryId", getNotesByCategory);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);
router.get("/stats/categories/:userId", getCategoryNotesStats);
router.get("/stats/recent/:userId", getRecentNotesStats);

export default router;
