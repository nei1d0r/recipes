const express = require("express")
const app = express()
const admin = require("firebase-admin")
const request = require('request-promise')
const RecipeModel = require('../../models/recipes')
const { apiKey } = require('../../config.json')

app.set('view engine', 'pug')
app.use(express.static('public'));

// COULD LOAD FORM PAGE IN HERE?
app.get("/", async (req, res) => {
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
    res.render('./pages/recipes/select-ingredients', { heading: 'Choose Ingredients', ingredients: sortedIngredients, expiringSoon: ingredients.expiringSoon, queryParams })
  })

app.post("/", async (req, res) => {
  if (!Object.keys(req.body).length > 0) return res.redirect('./?error="You must select at least one ingredient or intolerance"')
  const ingredients = req.body

  // structures api request url based on req.params (could pass in limit here, but removed for brevity)
  const requestUrl = RecipeModel.structuredRequest(apiKey, ingredients, limit=4)

  // use request-promise library to get recipe from API and parse string return to object
  const recipes = await request(requestUrl)
  const parsedRecipes = JSON.parse(recipes)

  return res.status(200).send(parsedRecipes)
})

// use this to rederict based on user recipe choice -> can make another spoonacular 
// call or pass recipe date accross
app.get("/:id", async (req, res) => {
    const snapshot = await admin.firestore().collection('recipes').doc(req.params.id).get()
    const recipeId = snapshot.id
    const recipeData = snapshot.data()
    res.status(200).json({id: recipeId, ...recipeData})
})

module.exports = app