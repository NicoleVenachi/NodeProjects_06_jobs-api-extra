const express = require('express')

const router = express.Router()
const {
  createJob,
  deleteJob,
  getAllJobs,
  updateJob,
  getJob,
} = require('../controllers/jobs')
const testUser = require('../middleware/testUser')

// test users can't CrUD jobs
router.route('/').post(testUser, createJob).get(getAllJobs)

router.route('/:id').get(getJob).delete(testUser, deleteJob).patch(testUser, updateJob)

module.exports = router
