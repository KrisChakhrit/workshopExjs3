var jwt = require('jsonwebtoken')

const getId = (token) => {
    const decoded = jwt.verify(token,process.env.JWT_KEY)
    return decoded.id
}

module.exports = getId;