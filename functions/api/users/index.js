// const functions = require("firebase-functions")
const express = require("express")
const app = express()
var cookieParser = require('cookie-parser')
const { secret } = require('../../config.json')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { authJWT } = require('../authentication')

const admin = require("firebase-admin")

app.use(cookieParser())

// NEED CORS FOR EXTERNAL APPLICATION - CREATE WHITELIST FOR PRODUCTION
const cors = require('cors')
app.use(cors())
app.options('*', cors())

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

app.get("/:id", async (req, res) => {
    const snapshot = await admin.firestore().collection('users').doc(req.params.id).get()
    const userId = snapshot.id
    const userData = snapshot.data()
    res.status(200).json({id: userId, ...userData})
})

// To create a user
app.post("/", async (req, res) => {
  const { password, password2, email } = req.body
  // check req body contains correct properties
  if (!email || !password || !password2) res.status(400).json({ error: 'Please provide all required fields' })
  
  // check email is unique and that passwords match
  const userCheck = await admin.firestore().collection('users').where('email', '==', email).get()
  if (!userCheck.empty) res.status(400).json({ error: 'email address already taken' })
  if (password !== password2) return res.status(400).json({ error: 'passwords do not match' })
  
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
  return res.status(201).json({ message: 'success' })
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

  if (user.length < 1) res.status(400).json({ error: 'Your username or password are incorrect, or you may need to sign up' })

  // Compare used to negate unhashing of passwords in API
  const passwordMatch = await bcrypt.compare(password, user.password)
  if (!passwordMatch) res.status(400).json({ error: 'Your username or password are incorrect' })

  // set JWT or Cookie??
  const token = jwt.sign({ sub: user.id }, secret, { expiresIn: '1m' })
  const omitPassword = (user, token) => {
    const { password, ...userWithoutPassword } = user;
    return {...userWithoutPassword, token};
  }

  const authenticatedUser = omitPassword(user, token)

  // THIS IS A BAD EXAMPLE OF STORING A JWT!! I WOULDN'T DO THIS IN PRODUCTION
  res.cookie('Authorization', token, { expires: new Date(Date.now() + 900000), httpOnly: true })
  res.redirect(307,'../../', 'GET') // currently redirects to home... go to app main page? 
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