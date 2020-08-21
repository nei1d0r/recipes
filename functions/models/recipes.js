const RecipeModel = {}

RecipeModel.structuredRequest = (apiKey, ingredients, limit ) => {
    const baseUrl = 'https://api.spoonacular.com/recipes/findByIngredients?'
    let INGREDIENTS_QUERY = ''
    let INTOLERANCE_QUERY = ''
    let MAX_LIMIT = 4


    const { ingredient, intolerance } = ingredients    
    // PARSE INGREDIENTS
    // creates ingredients query string for individual ingredient
    if (typeof ingredient === 'string' && ingredients) INGREDIENTS_QUERY = `&ingredients=${ingredient}`

    // creates ingredients query string for multiple ingredients
    if (typeof ingredient !== 'string' && ingredients) {
      const [...uniqueIngredients] = new Set(ingredient)
      uniqueIngredients.forEach(ingredient => {
        INGREDIENTS_QUERY += `${ingredient}+,`
      })
      const slicedIngredients = INGREDIENTS_QUERY.slice(0,-2)
      INGREDIENTS_QUERY = `&ingredients=${slicedIngredients}`
    }

    // PARSE INTOLERANCES
    // creates intolerance query string for individual intolerance
    if (typeof intolerance === 'string' && ingredients) INTOLERANCE_QUERY = `&intolerances=${intolerance}`

    // creates ingredients query string for multiple ingredients
    if (typeof intolerance !== 'string' && ingredients) {
      const [...uniqueIngredients] = new Set(intolerance)
      uniqueIngredients.forEach(intolerance => {
        INTOLERANCE_QUERY += `${intolerance}+,`
      })
      const slicedIntolerences = INTOLERANCE_QUERY.slice(0,-2)
      INTOLERANCE_QUERY = `&intolerances=${slicedIntolerences}`
    }

    // sets MAX_LIMIT to user defined max limit (if less than original MAX_LIMIT) - to save me money :)
    if (limit && limit < MAX_LIMIT) MAX_LIMIT = limit
    
    const structuredRequestUrl = `${baseUrl}apiKey=${apiKey}${INGREDIENTS_QUERY}${INTOLERANCE_QUERY}&number=${MAX_LIMIT}`
    console.log('URL', structuredRequestUrl)
    return structuredRequestUrl
  }

module.exports = RecipeModel