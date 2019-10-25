var express = require('express');
var mysql = require('./mysql_connect');
var categories = require('./categories');
var Promise = require('bluebird');
var router = express.Router();

var queryAsync = Promise.promisify(mysql.query.bind(mysql));
/*router.get('/user', function(req,res) {
	res.redirect('/user/blog-list');
});*/

router.get('/add-blog', function(req,res) {
	mysql.query('select * from categories', function(error, results, fields) {
		res.render('../views/user/add-blog',{categories:results});
	});
})
.post('/add-blog', function(req,res) {
	var title = req.body.title;
	var description = req.body.description;
	var category = req.body.category;
	var created_at = new Date();
	var updated_at = new Date();
	var blog = {"userid":1,"title":title,"description":description,"cat_id":category,"created_at":created_at,"updated_at":updated_at};
	mysql.query('INSERT INTO blogs SET ?',blog,function(error,results,fields) {
		if (error) throw error;
		res.redirect('/user/blog-list');
	});
});

router.get('/edit-blog/:id', function(req,res) {
	var id = req.params.id;
	var loggedin = req.session.loggedin;
	mysql.query('select * from blogs where id = ?;select * from categories;',[id],function(error,results,fields) {
		res.render('../views/user/edit-blog',{blog:results[0][0],categories:results[1]},loggedin);
	});
})
.post('/edit-blog/:id', function(req,res) {
	var id = req.params.id;
	var title = req.body.title;
	var description = req.body.description;
	var category = req.body.category;
	var updated_at = new Date();
	
	mysql.query('UPDATE blogs SET title = ?, description = ?,cat_id = ? , updated_at = ? where id = ?',[title, description, category, updated_at, id],function(error,results,fields) {
		req.flash('success', 'Blog Updated Succesfully!');
		res.redirect('/user/blog-list');
	});
});

router.get('/blog-list', function(req,res) {
		// res.send(categories);
	/*mysql.query('select * from blogs where userid = 1',function(error,results,fields) {
		res.render('../views/user/blog-list',{blogs:results,loggedin});
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
	console.log("SELECT B.*,C.category_name FROM blogs AS B left join categories AS C ON B.cat_id = C.id where userid = 1 LIMIT " + limit);
	queryAsync('SELECT count(*) as numRows FROM blogs')
	.then(function(results) {
		numRows = results[0].numRows;
		numPages = Math.ceil(numRows / numPerPage);
		console.log('number of pages:', numPages);
	})
	.then(() => queryAsync('SELECT B.*,C.category_name FROM blogs AS B left join categories AS C ON B.cat_id = C.id where userid = 1 LIMIT ' + limit))
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
		res.render('../views/user/blog-list',responsePayload);
		// res.json(responsePayload);
	})
	.catch(function(err) {
		console.error(err);
		res.json({ err: err });
	});
});

router.get('/delete-blog',function(req,res) {
	var id = req.query.id;
	mysql.query('delete from blogs where id = ?',[id],function(error,results,fields) {
		if (results.affectedRows) {
			res.send(results);
		}
	});
});

module.exports = router;