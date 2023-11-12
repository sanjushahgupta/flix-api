const movieModels = require("../models/movies.js");
const userModels = require("../models/users.js");

/**
 * get list of movies
 
* @async
 * @returns {Promise<Array<object>>} => list of movies
 * @throws {Error} => if movies not found
 */
module.exports.listOfAllMovies = async () => {
  const listOfMovies = await movieModels.Movie.find();
  if (listOfMovies) {
    return listOfMovies;
  }
  return new Error("Error: Sorry, movies not found.");
};

/**
 * get movie's details by title
 *
 * @async
 * @param {string} Title - Title of movie
 * @returns {Promise<movie>} movie
 * @throws {Error} if movie not found
 */
module.exports.getMovieByTitle = async (Title) => {
  const matchedMovieByTitle = await movieModels.Movie.find({ Title: Title });
  if (matchedMovieByTitle) {
    return matchedMovieByTitle;
  }
  return new Error("Error: Sorry, Requested movie not found.");
};

/**
 * get movie's details by genre
 *
 * @async
 * @param {string} genreName - genre of movie
 * @returns {Promise<movie>} movie
 * @throws {Error} if movie not found
 */
module.exports.genreDescriptionByName = async (genreName) => {
  const matchedMovieByGenreName = await movieModels.Movie.findOne({
    "Genre.Name": genreName,
  });
  if (matchedMovieByGenreName) {
    return matchedMovieByGenreName.Genre.Description;
  }
  return new Error(
    "Error: Sorry, Requested movie and it's genre details not found."
  );
};

/**
 * get director's details by director name
 * @async
 * @param {string} directorName - director's name
 * @returns {Promise<Director>} director;s details
 * @throws {Error} if movie or director details are not found
 */
module.exports.directorDetailsByName = async (directorName) => {
  const matchedMovieByDirectorName = await movieModels.Movie.findOne({
    "Director.Name": directorName,
  });
  if (matchedMovieByDirectorName) {
    return matchedMovieByDirectorName.Director;
  }
  return new Error(
    "Error: Sorry, Requested movie and it's director details not found."
  );
};

/**
 * add movie to favourite list
 * @async
 * @param {string} movieTitle
 *  * @param {string} userName
 * @returns {Promise<movie>} director;s details
 * @throws {Error} if movies is not added in fav list
 */
module.exports.addFavMovie = async (movieTitle, userName) => {
  const movie = await movieModels.Movie.findOne({ Title: movieTitle });
  if (movie) {
    const movieId = await movie._id;
    const movieAddedInFav = await userModels.User.findOneAndUpdate(
      { userName: userName },
      { $addToSet: { favoriteMovies: movieId } },
      { new: true }
    );
    if (movieAddedInFav) {
      return movieAddedInFav;
    }
  }
  return new Error("Error: Sorry, unable to add movie in favourite list.");
};

/**
 * delete movie from favourite list
 * @async
 * @param {string} movieTitle
 *  * @param {string} userName
 * @returns {Promise<movie>} director;s details
 * @throws {Error} if movies is not deleted in fav list
 */
module.exports.deleteFavMovie = async (movieTitle, userName) => {
  const movieToDelete = await movieModels.Movie.findOne({ Title: movieTitle });
  if (movieToDelete) {
    const movieId = await movieToDelete._id;
    const movieDeleted = await userModels.User.findOneAndUpdate(
      { userName: userName },
      { $pull: { favoriteMovies: movieId } },
      { new: true }
    );

    if (movieDeleted) {
      return movieDeleted;
    }
    return new Error("delete movie from favourites list");
  }
  return new Error("Unable to delete movie from favourites list");
};
