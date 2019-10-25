var express = require('express');
var mysql = require('./mysql_connect');
var router = express.Router();
router.get('/', function(req,res) {
	res.render('../views/user/categories',{hello:'Hello Categories'});
})
module.exports = router;