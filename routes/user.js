import express from 'express';
import passport from 'passport';
import { getAdminUsers, myProfile, getAdminStats } from "../controller/user.js"
import { logout } from "../controller/user.js"
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js"

const router = express.Router();

router.get("/googlelogin", passport.authenticate("google", {
  scope: ["profile"]
}))


router.get(
  "/login",
  passport.authenticate("google", {
    successRedirect: process.env.FRONTEND_URL,
  })
);


router.get("/me", isAuthenticated, myProfile)
router.get("/logout", logout)

// Admin Routes
router.get("/admin/users", isAuthenticated, authorizeAdmin, getAdminUsers)
router.get("/admin/stats", isAuthenticated, authorizeAdmin, getAdminStats)

export default router;