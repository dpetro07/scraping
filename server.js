var express = require('express');
var expressHandlebars = require('express-handlebars');
var app = express();
var request = require('request');
var cheerio = require('cheerio');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var PORT = process.env.PORT || 3000;


app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

//middleware for serving static folders
app.use(express.static("public"));


// //Database configuration using mongojs
// var mongojs = require('mongojs');
// var databaseUrl = "scraper";
// var collections = ["scrapedData"];
// var db = mongojs(databaseUrl, collections);
// db.on('error', function(err) {
//   console.log('Database Error:', err);
// });

//setting up the database using mongoose
mongoose.connect("mongodb://localhost/scrapingNotesDB");
var db = mongoose.connection;

db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});
db.once('open', function() {
  console.log('Mongoose connection successful.');
});

//Require Schemas
var Note = require("./models/notes.js");
var Data = require("./models/data.js");

//Home Route
app.get("/", function(req, res){
  res.send("Home Page");
})


//scraper for hacker news
//Get from DB
app.get('/illegal', function(req, res) {
  db.scrapedData.find({}, function(err, found) {
    if (err) {
      console.log(err);
    } else {
      res.json(found);
    }
  });
});

app.get('/scraper', function(req, res) {
  request('https://news.ycombinator.com/', function(error, response, html) {
    var $ = cheerio.load(html);
    $('.title').each(function(i, element) {
      var title = $(this).children('a').text();
      var link = $(this).children('a').attr('href');
      if (title && link) {
        db.scrapedData.save({
          title: title,
          link: link
        }, function(err, saved) {
          if (err) {
            console.log(err);
          } else {
            console.log(saved);
          }
        });
      }
    });
  });
  res.send("Scrape Complete");
});










app.listen(PORT, function() {
  console.log('App running on port %s', PORT);
});