const express = require("express");
const bodyParser = require("body-parser");
const movieServices = require('../services/movies.js')
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


module.exports.listOfMovies = function (req, res) {
    movieServices.listOfAllMovies().then(result => {
        if (Array.isArray(result) && result.length > 0) {
            return res.status(201).json(result);
        }
        return res.status(400).send('Unable to fetch Movies.');
    }).catch(error => {
        return "Error:", error
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
        return "Error:", error;
    })
}

module.exports.genreDescriptionByName = function (req, res) {
    movieServices.genreDescriptionByName(req.params.name).then(result => {
        if (result instanceof Error) {
            return res.status(400).send(result.message);
        }
        return res.status(201).json(result);
    }).catch(error => {
        return "Error:", error;
    })
}

module.exports.directorDetailsByName = function (req, res) {
    movieServices.directorDetailsByName(req.params.name).then(result => {
        if (result instanceof Error) {
            return res.status(400).send(result.message);
        }
        return res.status(201).json(result);

    }).catch(error => {
        return "Error:", error;
    })
}

module.exports.addMovieFavList = function (req, res) {
    userName = req.user.userName
    movieServices.addFavMovie(req.params.movieTitle, userName).then(result => {
        if (result instanceof Error) {
            return res.status(400).send(result.message);
        }
        return res.status(201).json({ "userName": result.userName, "favoriteMovies": result.favoriteMovies });

    }).catch(error => {
        return "Error:", error;
    })

}

module.exports.deleteMovieFromFavList = function (req, res) {
    userName = req.user.userName
    movieServices.deleteFavMovie(req.params.movieTitle, userName).then(result => {
        if (result instanceof Error) {
            return res.status(400).send(result.message);
        }
        return res.status(201).json({ "userName": result.userName, "favoriteMovies": result.favoriteMovies });

    }).catch(error => {
        return "Error:", error;
    })
}

