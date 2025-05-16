import express from "express";
import {
  registerUser,
  loginUser,
  getUser,
  updateUserSettings,
  updateUserProfile,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/:id", getUser);
router.put("/:id/settings", updateUserSettings);
router.put("/:id/profile", updateUserProfile);

export default router;
