require('dotenv').config();

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');

// MySQL DB handling
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
// const db = require('./util/database');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
	User.findByPk(1)
		.then((user) => {
			req.user = user;
			next();
		})
		.catch((err) => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

const PORT = process.env.PORT || 3000;

// Define db tables relations
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

// DB synchronization
sequelize
	.sync()
	// .sync({ force: true })
	.then((result) => {
		return User.findByPk(1);
		// console.log(result);
	})
	.then((user) => {
		if (!user) {
			return User.create({ name: 'LibertySky', email: 'test@test.com' });
		}
		return user;
	})
	.then((user) => {
		// console.log(user);
		return user.createCart();
	})
	.then(() => {
		app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
	})
	.catch((err) => {
		console.log(err);
	});
