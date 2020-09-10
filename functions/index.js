const functions = require('firebase-functions')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const path = require('path')
const admin = require('firebase-admin')
const utils = require('./models/utils')
const routes = require('./api/index')
const { authJWT } = require('./api/authentication')

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
app.locals.basedir = path.join(__dirname, 'views')
app.set('etag', false)

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'))
app.use('/api', routes)

admin.initializeApp(functions.config().firebase)

app.get('/', authJWT, async (req,res) =>{   
    const { user } = res.locals
    const time = utils.getCurrentTime()
    res.render('index',{ time, user })
})

app.get('/signup',async (req,res) =>{ 
    res.render('./pages/signup',{ heading: 'Sign Up' })
})

app.get('/login',async (req,res) =>{ 
    res.render('./pages/login',{ heading: 'Log In' })
})

app.get('*', (req,res) =>{
    res.send('I think you are lost?', 404)
})
    
exports.app = functions.https.onRequest(app)