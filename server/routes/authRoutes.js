const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const { isAuth } = require("../middlewares/checkAuth");

router.post("/signup", AuthController.signup);

router.post("/emailverification", AuthController.verifyemail);

router.post("/signin", AuthController.signin);

router.get("/profile", isAuth, AuthController.getProfile);

router.patch("/profile", isAuth, AuthController.updateProfile);

router.get("/googleLogin", AuthController.googleOauthHandler);

router.get("/refresh", AuthController.refresh);

router.post("/facebookLogin", AuthController.FacebookLogin);

router.post("/forgotpassword", AuthController.forgetPassword);

router.post("/resetpassword", AuthController.resetpassword);

router.post("/logout", AuthController.logout);
module.exports = router;
