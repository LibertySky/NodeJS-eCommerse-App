require('dotenv').config();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const User = require('../models/user');

// send emails
const sgMail = require('@sendgrid/mail');
const { use } = require('../routes/auth');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.getLogin = (req, res, next) => {
	let message = req.flash('error');
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	res.render('auth/login', {
		pageTitle: 'Login',
		path: '/login',
		errorMessage: message,
		oldInput: { email: '', password: '' },
		validationErrors: [],
	});
};

exports.getSignup = (req, res, next) => {
	let message = req.flash('error');
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	res.render('auth/signup', {
		path: '/signup',
		pageTitle: 'Signup',
		errorMessage: message,
		oldInput: {
			email: '',
			password: '',
			confirmPassword: '',
		},
		validationErrors: [],
	});
};

exports.postLogin = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render('auth/login', {
			pageTitle: 'Login',
			path: '/login',
			errorMessage: errors.array()[0].msg,
			oldInput: { email: email, password: password },
			validationErrors: errors.array(),
		});
	}

	User.findOne({ email: email })
		.then((user) => {
			if (!user) {
				return res.status(422).render('auth/login', {
					pageTitle: 'Login',
					path: '/login',
					errorMessage: 'Invalid email',
					oldInput: { email: email, password: password },
					validationErrors: [{ param: 'email', param: 'password' }],
				});
			}

			bcrypt
				.compare(password, user.password)
				.then((doMatch) => {
					if (doMatch) {
						req.session.isLoggedIn = true;
						req.session.user = user;
						return req.session.save(() => {
							res.redirect('/admin/products');
						});
					}
					return res.status(422).render('auth/login', {
						pageTitle: 'Login',
						path: '/login',
						errorMessage: 'Invalid password',
						oldInput: { email: email, password: password },
						validationErrors: [{ param: 'email', param: 'password' }],
					});
				})
				.catch((err) => {
					console.log(err);
					res.redirect('/login');
				});
		})
		.catch((err) => console.log(err));
};

exports.postSignup = (req, res, next) => {
	const userEmail = req.body.email;
	const password = req.body.password;

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		// console.log(errors.array());
		return res.status(400).render('auth/signup', {
			path: '/signup',
			pageTitle: 'Signup',
			errorMessage: errors.array()[0].msg,
			oldInput: {
				email: userEmail,
				password: password,
				confirmPassword: req.body.confirmPassword,
			},
			validationErrors: errors.array(),
		});
	}
	bcrypt
		.hash(password, 12)
		.then((hashedPassword) => {
			const user = new User({
				email: userEmail,
				password: hashedPassword,
				cart: { items: [] },
			});
			return user.save();
		})
		.then(() => {
			res.redirect('/login');
			const msg = {
				to: userEmail,
				from: 'hello@libertyskygraphics.com',
				cc: 'libertyskygraphics@gmail.com',
				subject: 'Your account successfully created',
				html:
					'<p><strong>Your account at eCommerce Training App with Node.JS successfully created.</strong></p><p>Thank you for registration!</p>',
			};
			return sgMail.send(msg).then(
				() => {},
				(error) => {
					console.error(error);

					if (error.response) {
						console.error(error.response.body);
					}
				}
			);
		});
};

exports.postLogout = (req, res, next) => {
	req.session.destroy(() => {
		res.redirect('/');
	});
};

exports.getReset = (req, res, next) => {
	let message = req.flash('error');
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	res.render('auth/reset-password', {
		pageTitle: 'Password Reset',
		path: '/reset',
		errorMessage: message,
	});
};

exports.postReset = (req, res, next) => {
	const userEmail = req.body.email;
	crypto.randomBytes(32, (err, buffer) => {
		if (err) {
			console.log(err);
			return res.redirect('/reset');
		}
		const token = buffer.toString('hex');
		User.findOne({ email: userEmail })
			.then((user) => {
				if (!user) {
					req.flash('error', 'No account with such email found!');
					return res.redirect('/reset');
				}
				user.resetToken = token;
				user.resetTokenExpiration = Date.now() + 3600000;
				return user.save();
			})
			.then(() => {
				res.redirect('/login');
				const msg = {
					to: userEmail,
					from: 'hello@libertyskygraphics.com',
					subject: 'Your password reset',
					html: `<h3>You requested password reset</h3>
								<p>Click this <a href="http://localhost:3000/reset/${token}" target="_blank">link</a> to reset your password.</p>`,
				};
				return sgMail.send(msg).then(
					() => {},
					(error) => {
						console.error(error);

						if (error.response) {
							console.error(error.response.body);
						}
					}
				);
			})
			.catch((err) => console.log(err));
	});
};

exports.getNewPassword = (req, res, next) => {
	const token = req.params.token;
	User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
		.then((user) => {
			let message = req.flash('error');
			if (message.length > 0) {
				message = message[0];
			} else {
				message = null;
			}
			res.render('auth/new-password', {
				pageTitle: 'Set New Password',
				path: '/new-password',
				errorMessage: message,
				userId: user._id.toString(),
				passwordToken: token,
			});
		})
		.catch((err) => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
	const newPassword = req.body.password;
	const userId = req.body.userId;
	const passwordToken = req.body.passwordToken;
	let updatedUser;

	User.findOne({
		resetToken: passwordToken,
		resetTokenExpiration: { $gt: Date.now() },
		_id: userId,
	})
		.then((user) => {
			if (!user) {
				req.flash('error', 'User not found!');
				return res.redirect('/reset');
			}
			updatedUser = user;
			return bcrypt.hash(newPassword, 12);
		})
		.then((hashedPassword) => {
			updatedUser.password = hashedPassword;
			updatedUser.resetToken = undefined;
			updatedUser.resetTokenExpiration = undefined;
			return updatedUser.save();
		})
		.then(() => {
			res.redirect('/login');
			const msg = {
				to: updatedUser.email,
				from: 'hello@libertyskygraphics.com',
				subject: 'Password changed',
				html: `<h3>You requested password reset</h3>
						<p>Your password successfully updated!</p>
						<p><a href="http://localhost/3000/login">Login</a> with your new password</p>`,
			};
			return sgMail.send(msg).then(
				() => {},
				(error) => {
					console.error(error);

					if (error.response) {
						console.error(error.response.body);
					}
				}
			);
		})
		.catch((err) => console.log(err));
};
