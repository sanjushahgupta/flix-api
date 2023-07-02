const jwtSecret = process.env.MOVIE_JWT_SECRET;
const jwt = require('jsonwebtoken');
const lodAsh = require('lodash');
const passport = require('passport');

require('../passport');

function generateJWTToken(user) {
    return jwt.sign(user, jwtSecret, {
        subject: user.userName,
        expiresIn: '6d',
        algorithm: 'HS256'
    });
}

module.exports = (app) => {
    app.post('/login', (req, res) => {
        passport.authenticate('local', { session: false }, (error, user, info) => {
            if (error || !user) {
                console.log(error);
                return res.status(400).json({
                    message: 'Something went wrong',
                    error: error
                });
            }
            req.login(user, { session: false }, (error) => {
                if (error) {
                    res.send(error);
                }
                let token = generateJWTToken({ userName: user.userName, id: user.id });
                return res.json({ user, token });
            });
        })(req, res);
    });
}