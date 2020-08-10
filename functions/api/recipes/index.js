const functions = require("firebase-functions")
const express = require("express")
const cors = require("cors")
const request = require('request-promise')
const RecipeModel = require('../../models/recipes')
const { apiKey } = require('../../config.json')

const admin = require("firebase-admin")
const app = express()

// COULD LOAD FORM PAGE IN HERE?
// app.get("/", async (req, res) => {
//     const snapshot = await admin.firestore().collection("recipes").get()
//     let recipes = []
//     snapshot.forEach((doc) => {
//       let id = doc.id
//       let data = doc.data()
//       .push({ id, ...data })
//     })
//     res.status(200).json(recipes)
//   })

app.post("/", async (req, res) => {
  const {
    ingredients,
    limit
  } = req.body

  // structures api request url based on req.params
  const requestUrl = RecipeModel.structuredRequest(apiKey, ingredients, limit)

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