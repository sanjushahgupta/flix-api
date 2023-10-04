const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const userModel = require("./models/users.js");
const passportJWT = require("passport-jwt");

const Users = userModel.User;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

passport.use(
  new LocalStrategy(
    {
      usernameField: "userName",
      passwordField: "password",
    },
    (userName, password, callback) => {
      Users.findOne({ userName: userName })
        .then((user) => {
          if (!user) {
            return callback(null, false, { message: "Incorrect username." });
          }

          if (!user.validatePassword(password)) {
            return callback(null, false, { message: "Incorrect password." });
          }
          return callback(null, {
            userName: user.userName,
            email: user.Email,
            birth: user.Birth,
            id: user._id,
            favoriteMovies: user.favoriteMovies,
          });
        })
        .catch((error) => {
          return callback(error);
        });
    }
  )
);
//for other requests
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.MOVIE_JWT_SECRET,
    },
    (jwtPayload, callback) => {
      Users.findById(jwtPayload.id)
        .then((user) => {
          return callback(null, user);
        })
        .catch((error) => {
          return callback(error);
        });
    }
  )
);
