var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
// use for neo4j DB
var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'test'));
var session = driver.session();
var query =
    "MATCH (n:Movie) \
   RETURN n \
   LIMIT $limit";

var params = { "limit": 10 };
session.run(query, params)
    .then(function (result) {
        result.records.forEach(function (record) {
            console.log(record._fields[0].properties);          
        })
    })
    .catch(function (error) {
        console.log(error);
    });

// create api
var app = express();

// view enging
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// middle wares
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//get request 
app.get('/', function (req, res) {
    //res.send('It works');
    session.run(query, params)
    .then(function (result) {
        var MovieArr = [];
        result.records.forEach(function (record) {
            MovieArr.push({
                id:record._fields[0].identity.low,
                title:record._fields[0].properties.title,
                year:record._fields[0].properties.year.low
            })
        })
        res.render('index',{
            movies:MovieArr
        })
    })
    .catch(function (error) {
        console.log(error);
    });

})

app.post('/movie/add',function(req,res){
    var title = req.body.movie_name;
    var year = req.body.movie_year;
    session
    .run('CREATE(n:Movie {title:{titleParam},year:{yearParam}}) RETURN n.title', {titleParam:title,yearParam:year} )
    .then(function(result){
        
    })
    .catch(err=>{
        console.log(err)
    })
    // console.log(name);
    // res.redirect('/')
})

// set listen port 

var port = 3000;
app.listen(port);
console.log(`Server running on port = ${port}`);


module.exports = app;
