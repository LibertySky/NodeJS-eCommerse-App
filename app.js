const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
	User.findById('5fc68448ad60db0cb053a931')
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

mongoose
	.connect('mongodb://localhost:27017/eCommerceApp', {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		User.findOne().then((user) => {
			if (!user) {
				const user = User({
					name: 'LibertySky',
					email: 'hello@libertyskygraphics.com',
					cart: { items: [] },
				});
				user.save();
			}
		});
		app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
	});
