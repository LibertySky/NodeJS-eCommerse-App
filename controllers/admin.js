const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
	res.render('admin/edit-product', {
		pageTitle: 'Add Product',
		path: '/admin/add-product',
		editing: false,
	});
};

exports.postAddProduct = (req, res, next) => {
	const title = req.body.title;
	const imgUrl = req.body.imgUrl;
	const description = req.body.description;
	const price = req.body.price;
	// Creating product with sequelize
	Product.create({
		title: title,
		price: price,
		imgUrl: imgUrl,
		description: description,
	})
		.then(res.redirect('/admin/products'))
		.catch((err) => console.log(err));

	// Creating product with mysql2 package
	// const product = new Product(null, title, imgUrl, description, price);
	// product
	// 	.save()
	// 	.then(() => {
	// 		res.redirect('/');
	// 	})
	// 	.catch((err) => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
	const editMode = req.query.edit;
	if (!editMode) {
		return res.redirect('/');
	}
	const prodId = req.params.productId;
	Product.findByPk(prodId)
		.then((product) => {
			if (!product) {
				return res.redirect('/');
			}
			res.render('admin/edit-product', {
				pageTitle: 'Edit Product',
				path: '/admin/edit-product',
				editing: editMode,
				product: product,
			});
		})
		.catch((err) => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
	const prodId = req.body.productId;
	const updatedTitle = req.body.title;
	const updatedPrice = req.body.price;
	const updatedImgUrl = req.body.imgUrl;
	const updatedDesc = req.body.description;
	Product.findByPk(prodId)
		.then((product) => {
			product.title = updatedTitle;
			product.price = updatedPrice;
			product.description = updatedDesc;
			product.imgUrl = updatedImgUrl;
			return product.save();
		})
		.then(res.redirect('/admin/products'))
		.catch((err) => console.log(err));

	// const updatedProduct = new Product(
	// 	prodId,
	// 	updatedTitle,
	// 	updatedImageUrl,
	// 	updatedDesc,
	// 	updatedPrice
	// );
	// updatedProduct.save();
	res.redirect('/admin/products');
};

exports.getProducts = (req, res, next) => {
	Product.findAll()
		.then((products) => {
			res.render('admin/products', {
				prods: products,
				pageTitle: 'Admin Products',
				path: '/admin/products',
			});
		})
		.catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
	const prodId = req.body.productId;
	console.log(`ProdId: ${prodId}`);
	Product.deleteById(prodId);
	res.redirect('/admin/products');
};
