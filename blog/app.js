var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var path = require('path');
var http = require('http');
var server = http.createServer(app);
var session = require('express-session');
var flash = require('express-flash-messages');
var mysql = require('./routes/mysql_connect');

app.set('trust proxy', 1) // trust first proxy
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(flash());

app.use(session({
	secret: '343ji43j4n3jn4jk3n',
	resave: false,
	saveUninitialized: true,
	cookie: {
		maxAge: 24 * 60 * 60 * 1000,
		sameSite: true
	}
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

var indexRouter = require(__dirname + '/routes/front');
var userRouter = require(__dirname + '/routes/user');

app.get('*', function(req, res, next) {
	var loggedin = req.session.loggedin;
	mysql.query('select * from categories',function(error, categories, fields) {
		res.locals.categories = categories;
		res.locals.loggedin = loggedin;
		next();
	});
});
app.use('/', indexRouter);
app.get('/user', function(req,res) {
	res.redirect('/user/blog-list');
});
app.use('/user', userRouter);



server.listen(3000,function() {
	console.log('Listining to http://localhost:3000');
})