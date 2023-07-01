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
    app.get('/', (res) => { res.send('Movie'); });
    app.get("/movies", authJWT, movieController.listOfMovies)
    app.get("/movies/:title", authJWT, movieController.movieByTitle)
    app.get("/movies/genre/:name", authJWT, movieController.genreDescriptionByName)
    app.get("/movies/directors/:name", authJWT, movieController.directorDetailsByName)
    app.post("/register", checkValidation, userController.registerUser)
    app.put("/user/:userName", authJWT, checkValidation, userController.updateUser)
    app.post("/addfab/:userName/:movieTitle", authJWT, movieController.addMovieFavList)
    app.delete("/deletefab/:userName/:movieTitle", authJWT, movieController.deleteMovieFromFavList)
    app.delete("/deleteUser/:userName", authJWT, userController.deleteUser)
}