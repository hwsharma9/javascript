var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '12345678',
  database : 'blogs',
  multipleStatements: true
});
 
connection.connect(function(err){
	if(!err) {
	    console.log("Database is connected.");
	} else {
	    console.log("Error connecting database.");
	}
});

module.exports = connection;