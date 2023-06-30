const express = require("express"),
    mongoose = require("mongoose"),
    passport = require('passport'),
    bodyParser = require("body-parser"),
    morgan = require("morgan"),
    cors = require('cors'),
    fs = require("fs"),
    path = require("path"),
    accessLogStream = fs.createWriteStream(path.join("log.txt"), { flags: "a" }),
    { check, validationResult } = require('express-validator'),
    app = express(),
    userController = require('./controllers/users.js'),
    movieController = require('./controllers/movies.js');
const checkValidation = [
    check('userName', 'Username length should be more than 4').isLength({ min: 5 }),
    check('userName', 'Non-alphanumeric characters are not allowed in username').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
],
    authJWT = authJWT;

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require('./config/passport.js');

mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', (req, res) => { res.send('Movie app!'); });
app.get("/movies", authJWT, movieController.listOfMovies)
app.get("/movies/:title", authJWT, movieController.movieByTitle)
app.get("/movies/genre/:name", authJWT, movieController.genreDescriptionByName)
app.get("/movies/directors/:name", authJWT, movieController.directorDetailsByName)
app.post("/register", checkValidation, userController.registerUser)
app.put("/user/:userName", authJWT,
    checkValidation, userController.updateUser)
app.post("/addfab/:userName/:movieTitle", authJWT, movieController.addMovieFavList)
app.delete("/deletefab/:userName/:movieTitle", authJWT, movieController.deleteMovieFromFavList)
app.delete("/deleteUser/:userName", authJWT, userController.registerUser)



app.use(express.static("public"));
app.use(morgan("combined", { stream: accessLogStream }));
app.use((err, req, res, next) => {
    res.status(500).send("error" + err);
})

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('App is listening in ' + port);
});

