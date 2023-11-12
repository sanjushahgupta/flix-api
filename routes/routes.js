const passport = require("passport");
const userController = require("../controllers/users.js");
const movieController = require("../controllers/movies.js");
const { check, validationResult } = require("express-validator");

/** Authenticate passport using Json Web Token */
const authJWT = passport.authenticate("jwt", { session: false });

/** check user inputs */
const checkValidation = [
  check("userName", "Username length should be more than 4").isLength({
    min: 5,
  }),
  check(
    "userName",
    "Non-alphanumeric characters are not allowed in username"
  ).isAlphanumeric(),
  check("password", "Password is required").not().isEmpty(),
  check("email", "Email does not appear to be valid").isEmail(),
];

module.exports = (app) => {
  //removed auth from route movies->movies/authJWT

  /** default route */
  app.get("/", (req, res) => {
    res.send("Welcome to movieApi");
  });

  /** route to get list of movies */
  app.get("/movies", authJWT, movieController.listOfMovies);

  /** route to get details of movie by tittle */
  app.get("/movies/:title", authJWT, movieController.movieByTitle);

  /** route to get details of movie by movie's genre  */
  app.get(
    "/movies/genre/:name",
    authJWT,
    movieController.genreDescriptionByName
  );

  /** route to get details of director's by directors name */
  app.get(
    "/movies/directors/:name",
    authJWT,
    movieController.directorDetailsByName
  );
  /** route to register new user */
  app.post("/register", checkValidation, userController.registerUser);

  /** route to update user's details */
  app.put("/updateUser", authJWT, checkValidation, userController.updateUser);

  /** route to add movie to favourite list */
  app.post("/addfab/:movieTitle", authJWT, movieController.addMovieFavList);

  /** route to delete movie from favourite list */
  app.delete(
    "/deletefab/:movieTitle",
    authJWT,
    movieController.deleteMovieFromFavList
  );

  /** route to delete user */
  app.delete("/deleteUser", authJWT, userController.deleteUser);

  /** route to get list of users */
  app.get("/users", userController.listOfUsers);
};
