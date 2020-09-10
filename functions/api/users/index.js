const admin = require("firebase-admin")
const express = require("express")
const app = express()
var cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { authJWT } = require('../authentication')
const { secret } = require('../../config.json')

app.set('view engine', 'pug')
app.use(cookieParser())


app.get("/", authJWT, async (req, res) => {
  const snapshot = await admin.firestore().collection("users").get()
  let users = []
  snapshot.forEach((doc) => {
    let id = doc.id
    let data = doc.data()
    users.push({ id, ...data })
  })
  res.status(200).json(users)
})

app.get("/:id", authJWT, async (req, res) => {
    const snapshot = await admin.firestore().collection('users').doc(req.params.id).get()
    const userId = snapshot.id
    const userData = snapshot.data()
    res.status(200).json({id: userId, ...userData})
})

// To create a user
app.post("/", async (req, res) => {
  const { password, password2, email } = req.body

  // check req body contains correct properties
  if (!email || !password || !password2) res.render('./pages/signup', { error: 'Please provide all required fields' })
  
  // check email is unique and that passwords match
  if (password !== password2) res.render('./pages/signup', { error: 'Passwords do not match' })
  
  const userCheck = await admin.firestore().collection('users').where('email', '==', email).get()
  if (!userCheck.empty) res.render('./pages/signup', { error: 'Email address already in use' })

  
  // hash password before storing to database
  const user = await bcrypt.hash(password, 2)
  .then((hash) => {
    const mappedUser = {
      email,
      password: hash
    }
    return mappedUser
  })

  await admin.firestore().collection("users").add(user)
  // set JWT or Cookie??
  const token = jwt.sign({ sub: user.id, email: user.email }, secret, { expiresIn: '7d' })

  // JWT - expires 1h
  res.cookie('__session', token, { expires: new Date(Date.now() + 3600000), httpOnly: true })
  res.redirect('../../') // redirect home
})


app.post("/login", async (req, res) => {
  const { password, email } = req.body
  // check user exists in database
  let user = []
  await admin.firestore().collection('users').where('email', '==', email).get()
    .then((data) => {

      data.docs.forEach((doc) => {
        user = { id: doc.id, ...doc.data() }
    })
  })

  if (user.length < 1) res.render('./pages/login', { error: 'Your username or password are not recognised' })

  // Compare used to negate unhashing of passwords in API
  const passwordMatch = await bcrypt.compare(password, user.password)
  if (!passwordMatch) res.render('./pages/login', { error: 'Your username or password are not recognised' })

  // set JWT or Cookie??
  const token = jwt.sign({ sub: user.id, email: user.email }, secret, { expiresIn: '7d' })

  // THIS IS A BAD EXAMPLE OF STORING A JWT!! I WOULDN'T DO THIS IN PRODUCTION
  res.cookie('__session', token, { expires: new Date(Date.now() + 3600000*24*7), httpOnly: true })
  res.redirect('../../') // redirect home
})

app.get("/logout", async (req, res) => {
  res.cookie.set('__session', {expires: Date.now()});
  res.redirect('../../login') 
})

app.put("/:id", async (req, res) => {
    const body = req.body
    await admin.firestore().collection('users').doc(req.params.id).update(body)
    res.status(200).json({})
})

app.delete("/:id", async (req, res) => {
    await admin.firestore().collection("users").doc(req.params.id).delete()
    res.status(200).json({})
})

module.exports = app