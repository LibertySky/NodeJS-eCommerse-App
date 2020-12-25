const { validationResult } = require('express-validator');
const Product = require('../models/product');

const fileHelper = require('../util/file');

exports.getAddProduct = (req, res, next) => {
	res.render('admin/edit-product', {
		pageTitle: 'Add Product',
		path: '/admin/add-product',
		editing: false,
		hasError: false,
		errorMessage: null,
		validationErrors: [],
	});
};

exports.postAddProduct = (req, res, next) => {
	const title = req.body.title;
	const image = req.file;
	const description = req.body.description;
	const price = req.body.price;

	if (!image) {
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'Add Product',
			path: '/admin/add-product',
			editing: false,
			hasError: true,
			product: {
				title: title,
				price: price,
				description: description,
			},
			errorMessage: 'Attached file is not a valid image.',
			validationErrors: [],
		});
	}

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		console.log(errors.array());
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'Add Product',
			path: '/admin/add-product',
			editing: false,
			hasError: true,
			product: {
				title: title,
				price: price,
				description: description,
			},
			errorMessage: errors.array()[0].msg,
			validationErrors: errors.array(),
		});
	}

	const imgUrl = image.path;

	const product = new Product({
		title: title,
		imgUrl: imgUrl,
		description: description,
		price: price,
		userId: req.user,
	});
	product
		.save()
		.then(() => {
			res.redirect('/admin/products');
		})
		.catch((err) => {
			const error = new Error(
				`Creating a product failed. Please try again. ${err}`
			);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getEditProduct = (req, res, next) => {
	const editMode = req.query.edit;
	if (!editMode) {
		return res.redirect('/');
	}
	const prodId = req.params.productId;
	Product.findById(prodId)
		.then((product) => {
			if (!product) {
				return res.redirect('/');
			}
			res.render('admin/edit-product', {
				pageTitle: 'Edit Product',
				path: '/admin/edit-product',
				editing: editMode,
				product: product,
				hasError: false,
				errorMessage: null,
				validationErrors: [],
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.postEditProduct = (req, res, next) => {
	const prodId = req.body.productId;
	const updatedTitle = req.body.title;
	const updatedPrice = req.body.price;
	const image = req.file;
	const updatedDesc = req.body.description;

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'Edit Product',
			path: '/admin/edit-product',
			editing: true,
			hasError: true,
			product: {
				title: updatedTitle,
				description: updatedDesc,
				price: updatedPrice,
				_id: prodId,
			},
			errorMessage: errors.array()[0].msg,
			validationErrors: errors.array(),
		});
	}

	Product.findById(prodId)
		.then((product) => {
			if (product.userId.toString() !== req.user._id.toString()) {
				return res.redirect('/admin/products');
			}
			product.title = updatedTitle;
			product.price = updatedPrice;
			if (image) {
				fileHelper.deleteFile(product.imgUrl);
				product.imgUrl = image.path;
			}
			product.description = updatedDesc;
			return product.save().then(() => {
				res.redirect('/admin/products');
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getProducts = (req, res, next) => {
	Product.find({ userId: req.user._id })
		// .select('title price -_id')
		// .populate('userId', 'name')
		.then((products) => {
			res.render('admin/products', {
				prods: products,
				pageTitle: 'Admin Products',
				path: '/admin/products',
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

// exports.postDeleteProduct = (req, res, next) => {
// 	const prodId = req.body.productId;
// 	Product.findById(prodId)
// 		.then((product) => {
// 			if (!product) {
// 				return next(new Error('Product not found'));
// 			}
// 			fileHelper.deleteFile(product.imgUrl);
// 			return Product.deleteOne({ _id: prodId, userId: req.user._id });
// 		})
// 		.then(() => res.redirect('/admin/products'))
// 		.catch((err) => {
// 			const error = new Error(err);
// 			error.httpStatusCode = 500;
// 			return next(error);
// 		});
// };

// Async request handler
exports.deleteProduct = (req, res, next) => {
	const prodId = req.params.productId;
	Product.findById(prodId)
		.then((product) => {
			if (!product) {
				return next(new Error('Product not found'));
			}
			fileHelper.deleteFile(product.imgUrl);
			return Product.deleteOne({ _id: prodId, userId: req.user._id });
		})
		.then(() =>
			res.status(200).json({ message: 'Product deleted successfully!' })
		)
		.catch((err) => {
			res.status(500).json({ message: 'Product deleting fail(' });
		});
};
