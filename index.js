require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const validUrl = require('valid-url');
const { urlencoded } = require('body-parser');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');

//Connect to MongoDb
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));

//Define Schema
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});

//Define Model
const Urls = mongoose.model('Urls', urlSchema)
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
//*****************MY MOUNTED MIDDLEWARE***************
//Middleware to parse json bodies
app.use(express.json())

//Middleware to parse URL encoded bodies
app.use(express.urlencoded({extended: true}));

//Mounts
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

//Create an incrementing ID that you will assign to the short_url value in the to be create document
let newUrlId = 1;

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  //Gain access to the req.body
  let {url} = req.body
  
  // Validate url for being a valid url
  if (!validUrl.isWebUri(url)) {
    // Return 200 OK status code along with the error message
    return res.status(200).json({ error: 'invalid url' });
  }
  //Must be valid to get to this code
  let valid = url;

  //Create new document using the Urls model
  let newUrl = new Urls({
    original_url: valid,
    short_url: newUrlId
  });

  //Save created document
  newUrl.save()
    .then(savedUrl => {
      console.log('New saved URL:', savedUrl)
      res.json(savedUrl);
          //Increment newUrlId
          newUrlId++;
          console.log(newUrlId);
    }).catch(err => {
        console.error('Error saving URL:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      });
});

app.get('/api/shorturl/:short_url', function(req, res){
  //Access parameter short_url
  const {short_url} = req.params
  //Access database and look for object matching short_url
  Urls.findOne({short_url: short_url})
  .then(url =>{
    if(!url){
      return res.status(404).json({ error: 'URL not found' });
    }
    // If URL found, redirect to original URL
    res.redirect(url.original_url);
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
