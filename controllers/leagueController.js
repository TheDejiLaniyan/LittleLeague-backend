const asyncHandler = require('express-async-handler')
const League = require('../models/League')
const Officer = require('../models/Officer')

const getAllLeagues = asyncHandler(async(req, res)=>{
    const leagues = await League.find().lean()
    
    // if (!leagues?.length) {
    //     return res.status(400).json({ message: 'No leagues found' })
    // }

    const leagueWithOfficer = await Promise.all(leagues.map(async (league) => {
        const officer = await Officer.findById(league.officer).lean().exec()
        return { ...league, username: officer.username }
    }))

    res.json(leagueWithOfficer)
})

const createNewLeague = asyncHandler( async (req, res)=>{
    const {name, location, officer} = req.body

    if(!name || !location || !officer){
        return res.status(400).json({ message: 'All fields are required' })
    }

    const duplicate = await League.findOne({ name }).exec()

    if (duplicate) {
        return res.status(409).json({ message: 'League already exists!' })
    }


    const leagueObject = { 
         name,
         location,
         officer }

   // Create and store new officer 
   const league = await League.create(leagueObject)

   if(league) { //created 
       res.status(201).json({ message: `New League ${name} created` })
   } else {
       res.status(400).json({ message: 'Invali data received' })
   }

})

const updateLeague = asyncHandler(async(req, res)=>{
    const { id, name, location, officer } = req.body

    // Confirm data 
    if (!id || !name || !location || !officer   ) {
        return res.status(400).json({ message: 'All fields are required' })
    }
 
    // Does the user exist to update?
    const league = await League.findById(id).exec()

    if (!league) {
        return res.status(400).json({ message: 'League not found' })
    }

    // Check for duplicate 
    const duplicate = await League.findOne({ name }).lean().exec()

    // Allow updates to the original league 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate League' })
    }

    league.name = name
    league.location = location
    league.officer = officer

    const updatedLeague = await league.save()

    res.json({ message: `${updatedLeague.name} updated` })    
})

const deleteLeague = asyncHandler(async(req, res)=>{
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'League ID Required' })
    }

    
    // Does the user exist to delete?
    const league = await League.findById(id).exec()

    if (!league) {
        return res.status(400).json({ message: 'User not found' })
    }

    const result = await league.deleteOne()

    const reply = `League ${result.name} with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    createNewLeague,
    updateLeague,
    getAllLeagues,
    deleteLeague
}

