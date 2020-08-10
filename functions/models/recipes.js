const RecipeModel = {}

RecipeModel.structuredRequest = (apiKey, ingredients, limit ) => {
    const baseUrl = 'https://api.spoonacular.com/recipes/findByIngredients?'
    let INGREDIENTS_QUERY = ''
    let MAX_LIMIT = 4
    
    // creates ingredients query string for individual ingredient
    if (ingredients && ingredients.length === 1) INGREDIENTS_QUERY = `&ingredients=${ingredients[0]}`

    // creates ingredients query string for multiple ingredients
    if (ingredients && ingredients.length) {
      ingredients.forEach(ingredient => {
        INGREDIENTS_QUERY += `${ingredient}+,`
      })
      const slicedIngredients = INGREDIENTS_QUERY.slice(0,-2)
      INGREDIENTS_QUERY = `&ingredients=${slicedIngredients}`
    }

    // sets MAX_LIMIT to user defined max limit (if less than original MAX_LIMIT)
    if (limit && limit < MAX_LIMIT) MAX_LIMIT = limit

    // BUUILD UP REQUEST AS WE LEARN MORE ABOUT REQUIREMENTS
    // CONSIDER PAGINATION - OR AT LEAST WRITE ABOUT IT!

    const structuredRequestUrl = `${baseUrl}apiKey=${apiKey}${INGREDIENTS_QUERY}&number=${MAX_LIMIT}`
    return structuredRequestUrl
  }

module.exports = RecipeModel