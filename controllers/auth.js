const jwtSecret = process.env.MOVIE_JWT_SECRET,
    jwt = require('jsonwebtoken'),
    lodAsh = require('lodash'),
    passport = require('passport');

require('../config/passport');


function generateJWTToken(user) {
    return jwt.sign(user, jwtSecret, {
        subject: user.userName,
        expiresIn: '6d',
        algorithm: 'HS256'
    });
}

module.exports = (router) => {
    router.post('/login', (req, res) => {
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
                let token = generateJWTToken(lodAsh.pick(user, ['userName', '_id']));
                let selectedProperties = lodAsh.pick(user, ['userName', 'Email', 'Birth']);
                return res.json({ user: selectedProperties, token });
            });
        })(req, res);
    });
}