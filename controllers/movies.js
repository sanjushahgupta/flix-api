const express = require("express"),
    movieModels = require("../models/movies.js"),
    userModels = require("../models/users.js"),
    bodyParser = require("body-parser"),
    cors = require('cors'),
    lodAsh = require('lodash'),
    Movies = movieModels.Movie,
    Users = userModels.User,
    app = express();


app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require('../config/passport.js');

module.exports.listOfMovies = function (req, res) {
    Movies.find()
        .then(movies => {
            return res.status(201).json(movies);
        })
        .catch(err => {
            return res.status(500).send("Error: " + err);
        });
}

module.exports.movieByTitle = function (req, res) {
    Movies.find({ "Title": req.params.title })
        .then(movie => {
            return res.status(201).json(movie);
        }).catch(err => {
            return res.status(500).send("Error: Sorry, the requested movie was not found.");
        })
}

module.exports.genreDescriptionByName = function (req, res) {
    Movies.findOne({ "Genre.Name": req.params.name })
        .then(movie => {
            var genreDescription = movie.Genre.Description;
            return res.status(201).json(genreDescription);
        }).catch(err => {
            return res.status(500).send("Error: Sorry, the genre of requested movie was not found.");
        })
}

module.exports.directorDetailsByName = function (req, res) {
    Movies.findOne({ "Director.Name": req.params.name }).
        then(movie => {
            var directorDetails = movie.Director
            return res.status(200).json(directorDetails);
        }).catch(err => {
            return res.status(500).send("Error: Sorry, the director's details of requested movie were not found.");
        })
}

module.exports.addMovieFavList = function (req, res) {
    Movies.findOne({ Title: req.params.movieTitle })
        .then(movie => {
            if (movie) {
                const movieId = movie._id;
                Users.findOneAndUpdate(
                    { userName: req.params.userName },
                    { $addToSet: { favoriteMovies: movieId } },
                    { new: true }
                )
                    .then(user => {
                        res.status(201).json(lodAsh.pick(user, ['userName', 'favoriteMovies']))
                    })
                    .catch(err => {
                        res.status(400).send("Error:" + err);
                    });
            } else {
                res.status(400).send("Error: Requested movie was not found.");
            }
        })
        .catch(err => {
            res.status(500).send(err);
        });
}

module.exports.deleteMovieFromFavList = function (req, res) {
    Movies.findOne({ Title: req.params.movieTitle }).
        then(movie => {
            if (movie) {
                const movieId = movie._id
                Users.findOneAndUpdate({ userName: req.params.userName },
                    { $pull: { favoriteMovies: movieId } },
                    { new: true }).then(user => {
                        return res.status(200).json(lodAsh.pick(user, ['userName', 'favoriteMovies']))
                    }).catch(err => {
                        return res.status(500).send(err);
                    })
            } else {
                return res.status(500).send("Error: Requested movie was not found.")
            }
        }).catch(err => {
            return res.status(500).send("Error:" + err);
        })
}