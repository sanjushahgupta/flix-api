const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

let userSchema = mongoose.Schema({
    userName: { type: String, required: true },
    Password: { type: String, required: true },
    Email: { type: String, required: true },
    Birth: String,
    favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.Password);
};

let User = mongoose.model("User", userSchema);
module.exports.User = User;