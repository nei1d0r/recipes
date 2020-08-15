const admin = require("firebase-admin")
const express = require("express")
const app = express()
const ImageModel = require('../../models/ingredients')

app.set('view engine', 'pug')
app.use(express.static('public'));

app.get("/", async (req, res) => {
  const snapshot = await admin.firestore().collection("ingredients").get()

  const newDate = new Date()
  let ingredients = []
  snapshot.forEach((doc) => {
    // We can compute the unix time values, and use them for comparison in order to set a class
    // based on expiry date...
    const todayDate = Math.round(newDate.getTime() /1000)
    const expiryDate = new Date(doc.data().expiryDate).getTime() /1000

    // Set class for element - maybe set these using bulma styles?
    let expiringSoon 
    if (todayDate < expiryDate - 86400) expiringSoon = 'has-text-success'
    if (todayDate > expiryDate) expiringSoon = 'has-text-danger'
    if (expiryDate.toString().slice(0,5) == todayDate.toString().slice(0,5)) expiringSoon = 'has-text-warning'

    let id = doc.id
    let data = doc.data()
    ingredients.push({ id, ...data, expiringSoon })
  })
  res.render('./pages/ingredients/index', { heading: 'Ingredients', ingredients: ingredients, expiringSoon: ingredients.expiringSoon })
})

app.get("/add", async (req, res) => {
  res.render('./pages/ingredients/add-ingredients', { title: 'Add Ingredients'})
})

app.get("/:id", async (req, res) => {
    const snapshot = await admin.firestore().collection('ingredients').doc(req.params.id).get()
    const ingredientId = snapshot.id
    const ingredientData = snapshot.data()
    res.status(200).json({id: ingredientId, ...ingredientData })
})

// Route called in script.js -> client side
app.post("/identify-food", async (req, res) => {
  const { image } = req.body
  if (!image) res.send('No image attached')
  const labelledFoodItem = await ImageModel.identifyFoodItem(image)
  res.status(200).json(labelledFoodItem)
})

app.post("/", async (req, res) => {
  const ingredient = req.body

  await admin.firestore().collection("ingredients").add(ingredient)
  res.redirect('./', 201, 'GET')
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