var express = require('express');
var mysql = require('./mysql_connect');
var Promise = require('bluebird');
var router = express.Router();

var queryAsync = Promise.promisify(mysql.query.bind(mysql));

/*router.get('/user/*', function(req, res) {
	var loggedin= req.session.loggedin;
	if (!loggedin) {
		res.redirect('/login');
	}
});*/

router.get('/', function(req,res) {
	var numRows;
	var queryPagination;
	var numPerPage = parseInt(req.query.npp, 10) || 10;
	var page = parseInt(req.query.page, 10) || 0;
	var numPages;
	var skip = page * numPerPage;
	console.log(req.query);  
	console.log("page = " + page)
	console.log("numPerPage = " + numPerPage);
	console.log(skip);
	// Here we compute the LIMIT parameter for MySQL query
	var end_limit = numPerPage; 
	var limit = skip + ',' + end_limit;
	console.log(limit);
	console.log("SELECT * FROM blogs LIMIT " + limit);
	queryAsync('SELECT count(*) as numRows FROM blogs')
	.then(function(results) {
		numRows = results[0].numRows;
		numPages = Math.ceil(numRows / numPerPage);
		console.log('number of pages:', numPages);
	})
	.then(() => queryAsync('SELECT * FROM blogs LIMIT ' + limit))
	.then(function(results) {
		var responsePayload = {
			results: results,
			numPages: numPages
		};
		if (page < numPages) {
			responsePayload.pagination = {
				current: page,
				perPage: numPerPage,
				previous: page > 0 ? page - 1 : undefined,
				next: page < numPages - 1 ? page + 1 : undefined
			}
		}
		else responsePayload.pagination = {
			err: 'queried page ' + page + ' is >= to maximum page number ' + numPages
		}
		// responsePayload.pageLinks = pages(responsePayload.numPages,((page==0)?1:page));
		res.render('../views/front/index',responsePayload);
		// res.json(responsePayload);
	})
	.catch(function(err) {
		console.error(err);
		res.json({ err: err });
	});
});

/*function pages(numPages,page=1) {
	var html = '';
	if (numPages) {
		for(var i = 1; i <= numPages; i++) {
			html += `<li class="page-item ${(i==page)?'active':''}"><a class="page-link" href='?page=${i}'>${i}</a></li>`;
		}
	}
	return html;
}*/

router.get('/contact-us', function(req,res) {
	res.render('../views/front/contact-us');
})
.post('/contact-us', function(req,res) {
	res.redirect('/contact-us');
});

router.get('/about-us', function(req,res) {
	res.render('../views/front/about-us');
});

router.get('/login', function(req,res) {
	/*var loggedin= req.session.loggedin;
	if (loggedin) {
		res.redirect('/user/blog-list');
	}*/
	res.render('../views/front/login');
})
.post('/login', function(req,res) {
	var email = req.body.email;
	var password = req.body.password;
	mysql.query('SELECT name,email,password FROM users where email = ?',[email],function(error,results,fields) {
		if (error) {
		    // console.log("error ocurred",error);
		    res.send({
				"code":400,
				"failed":"error ocurred"
		    });
		}else{
			// console.log('The solution is: ', results);
			if(results.length >0){
				console.log(results);
				if(results[0].password == password){
					/*res.send({
						"code":200,
						"success":"login sucessfull"
					});*/
					req.session.loggedin = true;
					req.session.id = results[0].id;
					req.session.name = results[0].name;
					req.session.email = results[0].email;
					res.redirect('/user');
				}
				else{
					res.send({
						"code":204,
						"success":"Email and password does not match"
					});
				}
			}
			else{
				res.send({
					"code":204,
					"success":"Email does not exits"
				});
			}
		}
		res.end();
	});
});

router.get('/logout', function(req,res) {
	req.session = null;
	res.redirect('/login');
});

router.get('/register', function(req,res) {
	res.render('../views/front/register');
})
.post('/register', function(req,res) {
	var name = req.body.name;
	var mobile_number = req.body.mobile_number;
	var email = req.body.email;
	var password = req.body.password;
	var created_at = new Date();
	var updated_at = new Date();
	var user = {"name":name,"mobile_number":mobile_number,"email":email,"password":password,"created_at":created_at,"updated_at":updated_at};
	mysql.query('INSERT INTO users SET ?',user,function(error,results,fields) {
		if (error) throw error;
		res.redirect('/register');
	});
});

router.get('/view-blog/:id', function(req,res) {
	var id = req.params.id;
	mysql.query('select * from blogs where id = ?',[id],function(error,results,fields) {
		res.render('../views/front/view-blog',results[0]);
	});
});

router.get('/category/:id', function(req,res) {
	var id = req.params.id;
	/*mysql.query('select * from blogs where cat_id = ?',[id],function(error,results,fields) {
		res.render('../views/front/index',{results:results});
	});*/
	var numRows;
	var queryPagination;
	var numPerPage = parseInt(req.query.npp, 10) || 10;
	var page = parseInt(req.query.page, 10) || 0;
	var numPages;
	var skip = page * numPerPage;
	console.log(req.query);  
	console.log(page)
	console.log(numPerPage);
	console.log(skip);
	// Here we compute the LIMIT parameter for MySQL query
	var end_limit = numPerPage; 
	var limit = skip + ',' + end_limit;
	console.log(limit);
	console.log("SELECT * FROM blogs LIMIT " + limit);
	queryAsync('SELECT count(*) as numRows FROM blogs where cat_id = ' + id)
	.then(function(results) {
		numRows = results[0].numRows;
		numPages = Math.ceil(numRows / numPerPage);
		console.log('number of pages:', numPages);
	})
	.then(() => queryAsync('SELECT * FROM blogs where cat_id = ' + id + ' LIMIT ' + limit))
	.then(function(results) {
		var responsePayload = {
			results: results,
			numPages: numPages
		};
		if (page < numPages) {
			responsePayload.pagination = {
				current: page,
				perPage: numPerPage,
				previous: page > 0 ? page - 1 : undefined,
				next: page < numPages - 1 ? page + 1 : undefined
			}
		}
		else responsePayload.pagination = {
			err: 'queried page ' + page + ' is >= to maximum page number ' + numPages
		}
		// responsePayload.pageLinks = pages(responsePayload.numPages,((page==0)?1:page));
		res.render('../views/front/index',responsePayload);
		// res.json(responsePayload);
	})
	.catch(function(err) {
		console.error(err);
		res.json({ err: err });
	});
})

module.exports = router;