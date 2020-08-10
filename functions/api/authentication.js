const jwt = require('jsonwebtoken')
const { secret } = require('../config.json')
const Auth = {}

Auth.authJWT = (req, res, next) => {
    console.log(req.headers.cookie)

    if (req.headers.cookie === undefined) return res.redirect('/login', 307)
    
    const token = req.headers.cookie.split('=')[1]

    if (token) {
        
        jwt.verify(token, secret, (err, user) => {
            if (err) {
                res.redirect('/login', 307)
            }

            req.user = user
            res.locals.user = {...user, token}
            next()
        })
    } else {
        res.redirect('/login', 308)
    }
}

module.exports = Auth
