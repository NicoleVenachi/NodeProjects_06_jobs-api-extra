const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors')

const register = async (req, res) => {
  const user = await User.create({ ...req.body })
  const token = user.createJWT()
  res.status(StatusCodes.CREATED).json({
      user: { 
        name: user.name,
        lastName: user.lastName,
        location: user.location,
        email: user.email,
        token 
      },
    })
}

const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new BadRequestError('Please provide email and password')
  }
  const user = await User.findOne({ email })
  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials')
  }
  const isPasswordCorrect = await user.comparePassword(password)
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials')
  }
  // compare password
  const token = user.createJWT()
  res.status(StatusCodes.OK).json({
    user: { 
      name: user.name,
      lastName: user.lastName,
      location: user.location,
      email: user.email,
      token 
    },
  })
}

const updateUser = async (req, res) => {

  // console.log(req.body); //from the authenticated token
  console.log(req.user) //token info

  //get info from request
  const {email, name, lastName, location } = req.body

  if (!email || !lastName || !name | !location) {
    throw new BadRequestError('Please provide all values')
  }

  // lookf for the user in the DB and update
  const user = await User.findOne({_id: req.user.userId})

  console.log(user)
  user.name = name
  user.location = location
  user.lastName = lastName
  user.email = email

  await user.save()

  //  necesito crear new token? depedne, estamos pasando un posible valor diferente? enotnce sí, porque en el metodo de crear el token, se necesita la info del name (o Id. Damos además un new expiratio, lo alargamos
  const token = user.createJWT()

  // send repsonse
  res.status(StatusCodes.OK).json({
    user: { 
      name: user.name,
      lastName: user.lastName,
      location: user.location,
      email: user.email,
      token 
    },
  })
}


module.exports = {
  register,
  login,
  updateUser
}
