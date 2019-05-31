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

        session.run('MATCH (n:Actor) RETURN n LIMIT 25')
        .then(function (result) {
            var ActorArr = [];
            result.records.forEach(function (record) {          
                ActorArr.push({                   
                    name:record._fields[0].properties.name,
                })
            })
            console.log(ActorArr)
            res.render('index',{
                movies:MovieArr,
                actors:ActorArr
            })
        })
        .catch(function (error) {
            console.log(error);
        });

    })
    .catch(function (error) {
        console.log(error);
    });

})


// add routine  for insert a entity in graph db
app.post('/movie/add',function(req,res){
    var title = req.body.movie_name;
    var year = req.body.movie_year;
    session
    .run('CREATE(n:Movie {title:{titleParam},year:{yearParam}}) RETURN n.title', {titleParam:title,yearParam:year} )
    .then(function(result){
        res.redirect('/');
    })
    .catch(err=>{
        console.log(err)
    })
    // console.log(name);
    // res.redirect('/')
})

app.post('/actor/add',function(req,res){
    var name = req.body.actor_name;
    session
    .run('CREATE(n:Actor {name:{nameParam}}) RETURN n.name', {nameParam:name} )
    .then(function(result){
        res.redirect('/');
    })
    .catch(err=>{
        console.log(err)
    })
    
})

app.post('/movie/actor/add',function(req,res){
    var name = req.body.actor_name;
    var title = req.body.movie_name;
    session
    .run('MATCH (a:Actor {name:{nameParam}}) , (b:Movie {title:{titleParam}}) MERGE (a)-[r:ACTED_IN]-(b) RETURN a,b', {nameParam:name,titleParam:title} )
    .then(function(result){
        res.redirect('/');
    })
    .catch(err=>{
        console.log(err)
    })
    
})

// set listen port 

var port = 3000;
app.listen(port);
console.log(`Server running on port = ${port}`);


module.exports = app;
