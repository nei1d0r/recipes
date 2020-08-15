// This will contain helper functions for models

const getCurrentTime = () => {
    let today = new Date()
    return today.toISOString().substr(11, 8)
}

const printHello = () => {
    return ('Hello')
}
// todo - better logging https://itnext.io/setup-logger-for-node-express-app-9ef4e8f73dac
const logger = (userAgent) => {
    let fs = require('fs')        
    let newLog=`${new Date()},${userAgent}\r`

    fs.appendFile("file.csv", newLog, function(err){
            if(err) throw err
        }
    )
}

module.exports = {
    getCurrentTime,
    printHello,
    logger
}