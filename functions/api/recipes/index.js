const express = require("express")
const app = express()
const admin = require("firebase-admin")
const request = require('request-promise')
const RecipeModel = require('../../models/recipes')
const { apiKey } = require('../../config.json')
const { authJWT } = require('../authentication')

app.set('view engine', 'pug')
app.use(express.static('public'));


app.get("/", authJWT, async (req, res) => {
  const snapshot = await admin.firestore().collection("ingredients").get()
  // if we land on this page from add-iongredient, then we can get the
  // details to post as a success message
  const queryParams = Object.keys(req.query).length > 0 ? req.query : false

  const newDate = new Date()
  let ingredients = []
  snapshot.forEach((doc) => {
    // We can compute the unix time values, and use them for comparison in order to set a class
    // based on expiry date...
    const todayDate = Math.round(newDate.getTime() / 1000)
    const expiryDate = new Date(doc.data().expiryDate).getTime() / 1000

    // Set class for element - maybe set these using bulma styles?
    let expiringSoon
    if (todayDate < expiryDate - 86400) expiringSoon = 'inDate'
    if (todayDate > expiryDate) expiringSoon = 'expired'
    if (expiryDate.toString().slice(0, 5) == todayDate.toString().slice(0, 5)) expiringSoon = 'expiresToday'

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
  return res.render('./pages/recipes/select-ingredients', { heading: 'Choose Ingredients', ingredients: sortedIngredients, expiringSoon: ingredients.expiringSoon, queryParams })
})

app.post("/", authJWT, async (req, res) => {
  if (!Object.keys(req.body).length > 0) return res.redirect('./recipes?error=You must select at least one ingredient or intolerance')
  const ingredients = req.body
  const requestUrl = RecipeModel.structuredRequest(apiKey, ingredients, limit = 4)

  const parsedRecipes = await request(requestUrl, { json: true })
  return res.render('./pages/recipes/choose-recipe', { parsedRecipes })
})

app.get("/:id", authJWT, async (req, res) => {
  const recipeId = req.params.id
  const recipeInformationUrl = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`

  await request(recipeInformationUrl, { json: true })
    .then((recipe) => res.render('./pages/recipes/final-recipe', { recipe }))
    .catch((err) => console.log(err.message))
})

module.exports = app