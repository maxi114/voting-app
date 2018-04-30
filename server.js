//bring in node needed node modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const router = require('./routes/api');

//store express in the app variable
const app = express();

//use the imported npm
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/node_modules", express.static(path.join(__dirname + '/node_modules')));
app.use(express.static(path.join(__dirname + '/public')));
app.use("/api", router);
app.get('*', function(req, res) {
    res.sendFile(__dirname + '/public/view.html');
});

//port varibales
var db = 'mongodb://localhost:27017/pva';
var port = process.env.PORT || 8000;

//connect to mongo
mongoose.connect(db, function(err) {
    if (err) {
        console.log(err)
    }
});

//mongo connection events
mongoose.connection.on('connected', function() {
    console.log('succesfully opened a connection to ' + db)
});

mongoose.connection.on('disconnected', function() {
    console.log('successfully disconnected from ' + db)
});

mongoose.connection.on('error', function() {
    console.log('error has occured connectiong to ' + db)
});

//dotenv
dotenv.config({ verbose: true })
console.log(process.env.secret)

//listening port
app.listen(port, function() {
    console.log('port is working')
});