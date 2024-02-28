// *** imports ***

const express = require('express');

const { login, register, updateUser } = require('../controllers/auth');
const authenticateUser = require('../middleware/authentication');
const testUser = require('../middleware/testUser');

// *** inicializo router ***
const router = express.Router();

// *** Routing ***


router.post('/register', register)
router.post('/login', login)
router.patch('/updateUser',authenticateUser, testUser, updateUser) // to update the user info, we need to authenticate the user, and extract the token data

module.exports = router
