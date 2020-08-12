const express = require("express")
const ImageModel = require('../../models/ingredients')
const engines = require('consolidate')

const admin = require("firebase-admin")
const app = express()

app.engine('hbs', engines.handlebars)
app.set('views','./views')

app.get("/", async (req, res) => {
  const snapshot = await admin.firestore().collection("ingredients").get()
  let ingredients = []
  snapshot.forEach((doc) => {
    let id = doc.id
    let data = doc.data()
    ingredients.push({ id, ...data })
  })
  console.log(ingredients)
  res.render('./pages/ingredients/index.hbs', { heading: 'Ingredients', ingredients: ingredients }) // TESTING
  // res.status(200).json(ingredients)
})

app.get("/:id", async (req, res) => {
    const snapshot = await admin.firestore().collection('ingredients').doc(req.params.id).get()
    const ingredientId = snapshot.id
    const ingredientData = snapshot.data()
    res.status(200).json({id: ingredientId, ...ingredientData })
})

app.post("/identify-food", async (req, res) => {
  const { image } = req.body
  
  if (!image) res.send('No image attached')
  
  const labelledFoodItem = await ImageModel.identifyFoodItem(image) // enable these to turn on image recognition
  
  res.status(200).json(labelledFoodItem)
})

app.post("/", async (req, res) => {
  const ingredient = req.body
  await admin.firestore().collection("ingredients").add(ingredient)
  res.status(201).json({})
})

app.put("/:id", async (req, res) => {
    const body = req.body
    await admin.firestore().collection('ingredients').doc(req.params.id).update(body)
    res.status(200).json({})
})

app.delete("/:id", async (req, res) => {
    await admin.firestore().collection("ingredients").doc(req.params.id).delete()
    res.status(200).json({})
})

module.exports = app