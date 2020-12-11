require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('../models/user');

// send emails
const sgMail = require('@sendgrid/mail');
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
	});
};

exports.postLogin = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;
	User.findOne({ email: email })
		.then((user) => {
			if (!user) {
				req.flash('error', 'Invalid email or password');
				return res.redirect('/login');
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
					req.flash('error', 'Invalid email or password');
					res.redirect('/login');
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
	const confirmPassword = req.body.confirmPassword;
	User.findOne({ email: userEmail })
		.then((userDoc) => {
			if (userDoc) {
				req.flash('error', 'Email already in use');
				return res.redirect('/signup');
			}
			return bcrypt
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
						cc: 'hello@libertyskygraphics.com',
						subject: 'Your account successfully created',
						text:
							'Your account at eCommerce Training App with Node.JS successfully created.',
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
		})
		.catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
	req.session.destroy(() => {
		res.redirect('/');
	});
};
