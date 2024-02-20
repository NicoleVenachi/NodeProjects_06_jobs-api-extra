const Job = require('../models/Job')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')

const getAllJobs = async (req, res) => {
  const {search, status, jobType, sort} = req.query;
  
  // *** Object Setup (serach logic) ***
  // query object will be the obnjecto to find  data in the db according to filters
  // since it is a a protected route, lets extract from its token the user ID (to see only its specifc jobs
  const queryObject = {
    createdBy: req.user.userId
  }

  // lets add the position name given in the filter
  if (search) {
    queryObject.position = {$regex: search, $options:'i'} // regular expression to llok for the value in any position, and i is to indicate it won't be case sensitive
  }




  // *** chaining all of the remaining data filter properties ***
  if (status && status !== 'all') {
    queryObject. status = status
  }
  if (jobType && jobType !== 'all') {
    queryObject. jobType = jobType
  }

  // await al final, cuando ya haya hecho todas las sort conditions (for naw filtering by position and user)
  const result = Job.find(queryObject)

  // *** response
  // default behavior -> Sino hay amtch, no retorna ningun Job, sino todos los Jobs (por mongoose 6, mongoose 5 es al reves)
  const jobs = await result
  res.status(StatusCodes.OK).json({ jobs, count: jobs.length })
}

const getJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req

  const job = await Job.findOne({
    _id: jobId,
    createdBy: userId,
  })
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`)
  }
  res.status(StatusCodes.OK).json({ job })
}

const createJob = async (req, res) => {
  req.body.createdBy = req.user.userId
  const job = await Job.create(req.body)
  res.status(StatusCodes.CREATED).json({ job })
}

const updateJob = async (req, res) => {
  const {
    body: { company, position },
    user: { userId },
    params: { id: jobId },
  } = req

  if (company === '' || position === '') {
    throw new BadRequestError('Company or Position fields cannot be empty')
  }
  const job = await Job.findByIdAndUpdate(
    { _id: jobId, createdBy: userId },
    req.body,
    { new: true, runValidators: true }
  )
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`)
  }
  res.status(StatusCodes.OK).json({ job })
}

const deleteJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req

  const job = await Job.findByIdAndRemove({
    _id: jobId,
    createdBy: userId,
  })
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`)
  }
  res.status(StatusCodes.OK).send()
}

module.exports = {
  createJob,
  deleteJob,
  getAllJobs,
  updateJob,
  getJob,
}
