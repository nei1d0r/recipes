const fs = require('fs')
const ImageModel = {}

ImageModel.identifyFoodItem = async (base64Image) => {
    const vision = require('@google-cloud/vision')
    const client = new vision.ImageAnnotatorClient()
   
    const bufferedImage = await ImageModel.convertBase64ToImage(base64Image)
    const [result] = await client.labelDetection({ 
          "image":{
            "content": bufferedImage
          }
    })

    const labels = result.labelAnnotations;
    // select relevent fields from result and map them
    const mappedLabels = []
    const data = labels.forEach(label => {
       mappedLabels.push(label.description)
    })

    return mappedLabels
  }

ImageModel.convertBase64ToImage = async (base64Image) => {
  const strippedBase64Data = base64Image.replace(/^data:image\/(jpeg|png);base64,/, "")
  const bufferedImage = Buffer.from(strippedBase64Data, 'base64')
  return bufferedImage
}

module.exports = ImageModel
   