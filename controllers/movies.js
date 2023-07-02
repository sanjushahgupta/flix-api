const express = require("express");
const movieModels = require("../models/movies.js");
const userModels = require("../models/users.js");
const bodyParser = require("body-parser");
const lodAsh = require('lodash');
const Movies = movieModels.Movie;
const Users = userModels.User;
const movieServices = require('../services/movies.js')
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require('../passport.js');

module.exports.listOfMovies = function (req, res) {
    movieServices.listOfAllMovies().then(result => {
        if (Array.isArray(result) && result.length > 0) {
            return res.status(201).json(result);
        }
        return res.status(400).send('Unable to fetch Movies.');
    }).catch(error => {
        return "Error:" + error;
    })
}

module.exports.movieByTitle = function (req, res) {
    movieServices.getMovieByTitle(req.params.title).then(result => {
        if (typeof result === 'object' && result.length > 0) {
            return res.status(201).json(result);
        } else {
            return res.status(500).send("Error: Sorry, the requested movie was not found.");
        }
    }).catch(error => {
        return "Error:" + error;
    })
}

module.exports.genreDescriptionByName = function (req, res) {
    movieServices.genreDescriptionByName(req.params.name).then(result => {
        if (result instanceof Error) {
            return res.status(400).send(result.message);
        }
        return res.status(201).json(result);

    }).catch(error => {
        return "Error:" + error;
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
            addFavMovie(movie)
        })
        .catch(err => {
            res.status(500).send(err);
        });
}

module.exports.deleteMovieFromFavList = function (req, res) {
    Movies.findOne({ Title: req.params.movieTitle }).
        then(movie => {
            deleteFavMovie(movie)
        }).catch(err => {
            return res.status(500).send("Error:" + err);
        })
}

function addFavMovie(movie) {
    if (movie) {
        const movieId = movie._id;
        Users.findOneAndUpdate(
            { userName: req.params.userName },
            { $addToSet: { favoriteMovies: movieId } },
            { new: true }
        )
            .then(user => {
                res.status(201).json(lodAsh.pick(user, ['userName', 'favoriteMovies']));
            })
            .catch(err => {
                res.status(400).send("Error:" + err);
            });
    } else {
        res.status(400).send("Error: Requested movie was not found.");
    }
}

function deleteFavMovie(movie) {
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
}