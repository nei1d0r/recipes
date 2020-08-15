const jwt = require('jsonwebtoken')
const { secret } = require('../config.json')
const Auth = {}

Auth.authJWT = (req, res, next) => {
    if (req.headers.cookie === undefined) return res.redirect('/login', 307)
    
    const token = req.headers.cookie.split('=')[1]

    if (token) {
        
        jwt.verify(token, secret, (err, user) => {
            if (err) {
                res.redirect('/login')
            }

            req.user = user
            res.locals.user = { ...user, token }
            next()
        })
    } else {
        res.redirect('/login')
    }
}

module.exports = Auth
