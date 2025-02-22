import express from 'express';
import {
  forgotPassword,
  getLoggedinUser,
  loginUser,
  logoutUser,
  registerUser,
  resendCode,
  resetPassword,
  updateLoggedinUser,
  verifyEmail,
} from '../controllers/user.controller.js';
import asyncHandler from '../utils/asyncHandler.js';
import isLoggedin from '../middlewares/isLoggedin.js';
import upload from '../config/multerConfig.js';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import '../config/passport.js';

const router = express.Router();

router.route('/register').post(asyncHandler(registerUser));

router.route('/verify-email').post(asyncHandler(verifyEmail));

router.route('/resend-code').post(asyncHandler(resendCode));

router.route('/login').post(asyncHandler(loginUser));

router.route('/logout').get(logoutUser);

router.route('/profile').get(isLoggedin, asyncHandler(getLoggedinUser));

router
  .route('/update/profile')
  .put(
    isLoggedin,
    upload.single('profileImage'),
    asyncHandler(updateLoggedinUser)
  );

router.route('/forgot-password').post(asyncHandler(forgotPassword));

router.route('/reset-password/:token').post(asyncHandler(resetPassword));

router
  .route('/google')
  .get(passport.authenticate('google', { scope: ['profile', 'email'] }));

router.route('/auth/google/callback').get(
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:5173/login/student',
  }),
  function (req, res) {
    const token = jwt.sign(
      { id: req.user._id, name: req.user.name, email: req.user.email },
      process.env.JWT_KEY,
      {
        expiresIn: '7d',
      }
    );
    res.cookie('token', token);

    return res.redirect('http://localhost:5173');
  }
);

router.route('/logout').get(function (req, res) {
  req.logout(() => {
    res.redirect('http://localhost:5173');
  });
});

router.route('/me').get(isLoggedin, function (req, res) {
  try {
    if (req.user) {
      return res.status(200).json(req.user);
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    return res.status(500).json({
      message:
        error instanceof Error ? error.message : 'Error fetching loggedin user',
    });
  }
});

export default router;
