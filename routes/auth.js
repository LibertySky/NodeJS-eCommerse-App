const express = require('express');
const { check, body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post(
	'/login',
	[
		body('email')
			.isEmail()
			.normalizeEmail()
			.trim()
			.withMessage('Please, enter valid email'),
		body('password', 'Password must be between 6 and 12 characters')
			.isLength({
				min: 6,
				max: 12,
			})
			.trim(),
	],
	authController.postLogin
);

router.post(
	'/signup',
	[
		check('email')
			.isEmail()
			.normalizeEmail()
			.trim()
			.withMessage('Please, enter valid email')
			.custom((value, { req }) => {
				return User.findOne({ email: value }).then((userDoc) => {
					if (userDoc) {
						return Promise.reject('Email already in use');
					}
				});
			}),
		body('password', 'Password must be between 6 and 12 characters')
			.isLength({
				min: 6,
				max: 12,
			})
			.trim(),
		body('confirmPassword')
			.trim()
			.custom((value, { req }) => {
				if (value !== req.body.password) {
					throw new Error('Confirmed Password does not match Password');
				}
				return true;
			}),
	],
	authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
