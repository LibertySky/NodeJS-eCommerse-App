const User = require('../models/user');

exports.getLogin = (req, res, next) => {
	res.render('auth/login', {
		pageTitle: 'Login',
		path: '/login',
		isAuthenticated: req.isLoggedIn,
	});
};

exports.postLogin = (req, res, next) => {
	User.findById('5fc68448ad60db0cb053a931')
		.then((user) => {
			req.session.isLoggedIn = true;
			req.session.user = user;
			req.session.save(() => {
				res.redirect('/');
			});
		})
		.catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
	req.session.destroy(() => {
		res.redirect('/');
	});
};
