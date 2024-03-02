const Job = require('../models/Job')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')

const moment = require('moment')
const mongoose = require('mongoose')

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
    queryObject.status = status
  }
  if (jobType && jobType !== 'all') {
    queryObject.jobType = jobType
  }

  
  // await al final, cuando ya haya hecho todas las sort conditions (for naw filtering by position and user)
  let result = Job.find(queryObject)

  // *** Adding the different queryiong methods ***
  // -> Sort
  switch (sort) {
    case 'latest':
      result = result.sort('-createdAt')
      break;
    
    case 'oldest':
      result = result.sort('createdAt')
      break;
    case 'z-a':
      result = result.sort('-position')
      break;

    case 'a-z':
      result = result.sort('position')
      break;
  
    default:
      break;
  }
  
  // -> Pagination (limiting also the amount of data sended)

  // setup page, limit and skig (to jump over some registers and go to the selectred page)
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  // additional data (to paginatio fronted setup)

  const totalJobs = await Job.countDocuments(queryObject)
  const numOfPages = Math.ceil(totalJobs/limit); // ceil -> simpere una pagina de mas, si se pasa el limit
  // *** response
  // default behavior -> Sino hay amtch, no retorna ningun Job, sino todos los Jobs (por mongoose 6, mongoose 5 es al reves)
  const jobs = await result
  res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages})
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


const showStats = async (req, res) => {

  //aggregation pipeline user jobs, grouped by job status and coun aggreagtain fuynction
  let stats = await Job.aggregate([
    {$match: {createdBy: mongoose.Types.ObjectId(req.user.userId)}}, //the type of the id es the mongoose objectId type
    {$group: {_id: '$status', count: {$sum: 1}}}
  ])

  console.log(stats);

  
  res
    .status(StatusCodes.OK)
    .json({defaultStats: {}, monthlyApplications: []});

  // respopnse are the stats object and the applications per month
}
module.exports = {
  createJob,
  deleteJob,
  getAllJobs,
  updateJob,
  getJob,
  showStats
}
