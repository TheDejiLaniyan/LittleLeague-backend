const express = require('express')
const router = express.Router()
const leagueControllers = require('../controllers/leagueController') 
// const verifyJWT = require('../middleware/verifyJWT')

// router.use(verifyJWT)

router.route('/')
    .get(leagueControllers.getAllLeagues)
    .post(leagueControllers.createNewLeague)
    .patch(leagueControllers.updateLeague)
    .delete(leagueControllers.deleteLeague)

module.exports = router