const express = require('express')
const router = express.Router()
const officerControllers = require('../controllers/officerController')
// const verifyJWT = require('../middleware/verifyJWT')

// router.use(verifyJWT)

router.route('/')
    .get(officerControllers.getAllOfficers)
    .post(officerControllers.createNewOfficer)
    .patch(officerControllers.updateOfficer)
    .delete(officerControllers.deleteOfficer)

module.exports = router