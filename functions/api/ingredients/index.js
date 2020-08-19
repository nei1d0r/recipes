const admin = require("firebase-admin")
const express = require("express")
const app = express()
const ImageModel = require('../../models/ingredients')
const { authJWT } = require('../authentication')
const querystring = require('querystring')

app.set('view engine', 'pug')
app.use(express.static('public'));

app.get("/", authJWT,  async (req, res) => {
  const snapshot = await admin.firestore().collection("ingredients").get()
  // if we land on this page from add-iongredient, then we can get the
  // details to post as a success message
  const queryParams = Object.keys(req.query).length > 0 ? req.query : false

  const newDate = new Date()
  let ingredients = []
  snapshot.forEach((doc) => {
    // We can compute the unix time values, and use them for comparison in order to set a class
    // based on expiry date...
    const todayDate = Math.round(newDate.getTime() /1000)
    const expiryDate = new Date(doc.data().expiryDate).getTime() /1000

    // Set class for element - maybe set these using bulma styles?
    let expiringSoon 
    if (todayDate < expiryDate - 86400) expiringSoon = 'inDate'
    if (todayDate > expiryDate) expiringSoon = 'expired'
    if (expiryDate.toString().slice(0,5) == todayDate.toString().slice(0,5)) expiringSoon = 'expiresToday'

    let id = doc.id
    let data = doc.data()

    ingredients.push({ id, ...data, expiringSoon })
  })

  // sort by location to display in /ingredients
  let fridge = []
  let freezer = []
  let cupboard = []
  let other = []
  ingredients.forEach(ingredient => {
    if (ingredient.location === 'Fridge') fridge.push(ingredient)
    else if (ingredient.location === 'Freezer') freezer.push(ingredient)
    else if (ingredient.location === 'Cupboard') cupboard.push(ingredient)
    else other.push(ingredient) 
  })

  const sortedIngredients = { fridge, freezer, cupboard, other }

  res.render('./pages/ingredients/index', { heading: 'Ingredients', ingredients: sortedIngredients, expiringSoon: ingredients.expiringSoon, queryParams })
})

app.get("/add",  authJWT, async (req, res) => {
  res.render('./pages/ingredients/add-ingredients', { title: 'Add Ingredients'})
})

app.get("/:id", async (req, res) => {
    const snapshot = await admin.firestore().collection('ingredients').doc(req.params.id).get()
    const ingredientId = snapshot.id
    const ingredientData = snapshot.data()
    res.status(200).json({id: ingredientId, ...ingredientData })
})

// Route called in script.js -> client side
app.post("/identify-food", authJWT, async (req, res) => {
  const { image } = req.body
  if (!image) res.send('No image attached')
  const labelledFoodItem = await ImageModel.identifyFoodItem(image)
  res.status(200).json(labelledFoodItem)
})

app.post("/", authJWT, async (req, res) => {
  const ingredient = req.body
  const { label, expiryDate, quantity, location } = ingredient

  await admin.firestore().collection("ingredients").add(ingredient)
  res.locals.ingredient = ingredient
  const query = querystring.stringify({
    label,
    quantity,
    location,
    expiryDate, 
  })
  res.redirect('./?' + query, 201, 'GET')
})

// USED FOR POSTMAN TESTING - CAN BE ADDED BACK IN, IN THE FUTURE

// app.put("/:id", async (req, res) => {
//     const body = req.body
//     await admin.firestore().collection('ingredients').doc(req.params.id).update(body)
//     res.status(200).json({})
// })

// app.delete("/:id", async (req, res) => {
//     await admin.firestore().collection("ingredients").doc(req.params.id).delete()
//     res.status(200).json({})
// })

module.exports = app