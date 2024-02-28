
const {BadRequestError} = require('../errors')

const testUser = (req, res, next) => {

  if (req.user.testUser) {
    throw new BadRequestError('Test user have only read permissions')
  }

  next();
}

module.exports = testUser; 