const passport = require('passport');
const userController = require('../controllers/users.js');
const movieController = require('../controllers/movies.js');
const { check, validationResult } = require('express-validator');

const authJWT = passport.authenticate('jwt', { session: false });

const checkValidation = [
    check('userName', 'Username length should be more than 4').isLength({ min: 5 }),
    check('userName', 'Non-alphanumeric characters are not allowed in username').isAlphanumeric(),
    check('password', 'Password is required').not().isEmpty(),
    check('email', 'Email does not appear to be valid').isEmail()
];


module.exports = (app) => {
    //removed auth from route movies->movies/authJWT
    app.get("/movies", movieController.listOfMovies)
    app.get("/movies/:title", authJWT, movieController.movieByTitle)
    app.get("/movies/genre/:name", authJWT, movieController.genreDescriptionByName)
    app.get("/movies/directors/:name", authJWT, movieController.directorDetailsByName)
    app.post("/register", checkValidation, userController.registerUser)
    app.put("/updateUser", authJWT, checkValidation, userController.updateUser)
    app.post("/addfab/:movieTitle", authJWT, movieController.addMovieFavList)
    app.delete("/deletefab/:movieTitle", authJWT, movieController.deleteMovieFromFavList)
    app.delete("/deleteUser", authJWT, userController.deleteUser)
    app.get('/', (req, res) => { res.send('Welcome to movieApi') });
}