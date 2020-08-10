
google vision environment setup in powershell
path = filepath of firebasseService.json
https://www.npmjs.com/package/@google-cloud/vision for npm library
$env:GOOGLE_APPLICATION_CREDENTIALS="[PATH]"

// API
    /users
        /
        /login
        /logout
    /Ingredients
    /recipes
    /middleware

    // MODELS
    /users
    /Ingredients
    /recipes
    /utils

    // VIEWS - utilising handlebars view engine
    /index
    /partials
        /header
        /footer


// BCRYPT
    https://www.npmjs.com/package/bcrypt
    Used to encrypt and decrypt password data and provide a means of secure storage of sensitive information for the creation of users and login checks

// JWT - Auth
    Jwt auth is set in the login route, and this value is then assigned to the user response (can be changed)
    this can be pulled out and sent as a header { Authorization: bearer <jwt token>}
    middleware has been set up to handle authentication and authorization of routes, and will need to be considered. can also be used for multi level authorization eg {role: admin} in JWT payload
    for all routes going forward - as of now this is a proof of concept to demonstrate current web standards

    postman routes requrie headers set as above

    jwt.sign({ sub: user.id }, secret, { expiresIn: '1m' })
    secret is stored in config, and expiry is currently set to 1 min -> for demonstration.

    No refresh token being used at present for simplicity

// COOKIES
    WHY AM I USING THEM...? Instead of adding complexity to the application through using a key value storage solution, it was simpler to store the token as a cookie. In 'real life' i would use Redis or something similar.

    it's http only i guess, so it could be worse.
