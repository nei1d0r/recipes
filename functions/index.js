const functions = require('firebase-functions')
const express = require('express')
const bodyParser = require('body-parser')
const engines = require('consolidate')
var hbs = require('handlebars')
const admin = require('firebase-admin')
const app = express()

const cors = require('cors')
const routes = require('./api/index')
const { authJWT } = require('./api/authentication')

app.engine('hbs', engines.handlebars)
app.set('views','./views')
app.set('view engine','hbs')

app.use(bodyParser.urlencoded({ extended: false }))
app.use('/api', routes)
app.use(cors())
app.options('*', cors())

const utils = require('./models/utils')

// admin.initializeApp(functions.config().firebase) // prod

var serviceAccount = require("../firebaseService.json") // dev
admin.initializeApp({
credential: admin.credential.cert(serviceAccount),
databaseURL: "https://raspi-8c114.firebaseio.com"
})

// initialize db
getFirestore = async () => {
    const firestore_con  = await admin.firestore()
    const writeResult = firestore_con.collection('sample').doc('sample_doc').get()
        .then(doc => {
            if (!doc.exists) { 
                console.log('No such document!') 
            }
            else {
                return doc.data()
            }
        })
        .catch(err => { 
            console.log('Error getting document', err)
        })
    return writeResult
}

app.get('/', authJWT, async (req,res) =>{    
    var db_result = await getFirestore()
    const time = utils.getCurrentTime()
    res.render('index',{ db_result, time })
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