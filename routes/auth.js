// *** imports ***

const express = require('express');

const { login, register, updateUser } = require('../controllers/auth');
const authenticateUser = require('../middleware/authentication');
const testUser = require('../middleware/testUser');


const rateLimiter = require('express-rate-limit')
const apiLimiter =  rateLimiter(
  {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    message: {
      msg: 'Too many requests from this IP. Please try again after 15 minutes'
    }
  }
)

// *** inicializo router ***
const router = express.Router();

// *** Routing ***


router.post('/register', apiLimiter,  register)
router.post('/login', apiLimiter, login)
router.patch('/updateUser',authenticateUser, testUser, updateUser) // to update the user info, we need to authenticate the user, and extract the token data

module.exports = router
