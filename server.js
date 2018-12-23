var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;




// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
//mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/unit18Populater";
mongoose.connect(MONGODB_URI);



// Routes
// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  axios.get("https://lifehacker.com/").then(function(response) {
    //http://www.echojs.com/
    //https://www.quora.com/topic/History
    //https://www.reddit.com/r/SeaWA/
    //https://medium.com/s/love-hate
    var $ = cheerio.load(response.data);
    console.log("before $");
    // Now, we grab every h2 within an article tag, and do the following:
    $("article header h1.headline a").each(function(i, element) {
      //article h2
      //FeedStory .ui_story_title
      //scrollerItem h2
      //section a
      var result = {};

      result.title = $(this)
        //.children("a")
        .text();

      result.link = $(this)
        .attr("href");

        console.log(result.link);
        console.log(result.title);
        console.log("--------------------------------\n");
        

      //THIS ERRORS OUT//
      // Create a new Article using the `result` object built from scraping

      // db.Article.create(result)
      // .then(function(dbArticle) {
      //   // View the added result in the console
      //   console.log(dbArticle);
      // })
      // .catch(function(err) {
      //   // If an error occurred, log it
      //   console.log(err);
      // });

    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
