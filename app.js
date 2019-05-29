var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');


// create api
var app = express();

// view enging
app.set('views',path.join(__dirname,'views'));
app.set('view engin','ejs');

// middle wares
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')));

//get request 
app.get('/',function(req,res){
    res.send('It works');
})

// set listen port 
app.listen(3000);
var port = 3000;
console.log(`Server running on port = ${port}`);


module.exports = app;
