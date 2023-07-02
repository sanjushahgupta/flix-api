const movieModels = require('../models/movies.js')

module.exports.listOfAllMovies = async () => {
    const listOfMovies = await movieModels.Movie.find();
    return listOfMovies;
}

module.exports.getMovieByTitle = async (Title) => {
    const movie = await movieModels.Movie.find({ "Title": Title })
    return movie;
}

module.exports.genreDescriptionByName = async (genreName) => {
    const movie = await movieModels.Movie.findOne({ "Genre.Name": genreName });
    if (movie) {
        return movie.Genre.Description;
    }
    return new Error("Error: Sorry, Requested movie not found.");
}