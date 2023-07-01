const mongoose = require('mongoose');

let movieSchema = mongoose.Schema({
    Title: { type: String, required: true },
    Description: String,
    Genre: {
        Name: String,
        Description: String
    },
    Director: {
        Name: String,
        Bio: String,
        Birth: Date,
    },
    Actor: String,
    Image: String,
    Featured: Boolean
});

let Movie = mongoose.model("Movie", movieSchema);
module.exports.Movie = Movie;