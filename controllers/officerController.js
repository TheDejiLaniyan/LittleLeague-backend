const asyncHandler = require('express-async-handler')
const Officer = require('../models/Officer')


const getAllOfficers = asyncHandler(async(req, res) =>{
    const officers = await Officer.find().lean()

    // if (!officers?.length) {
    //     return res.status(400).json({ message: 'No officers found' })
    // }

    res.json(officers)
})
const createNewOfficer = asyncHandler(async(req, res) =>{
    const {username, email, league, contact} = req.body

    if (!username || !email || !league || !contact ) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate username
    const duplicate = await Officer.findOne({ username }).exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Name has been taken!' })
    }

    const exists = await Officer.findOne({email}).exec()
    if(exists){
        return res.status(408).json({message: 'Email has been taken'})
    }

    const officerObject = { 
         username,
         email,
         league,
         contact }

   // Create and store new officer 
   const officer = await Officer.create(officerObject)

   if (officer) { //created 
       res.status(201).json({ message: `New District Officer ${username} created` })
   } else {
       res.status(400).json({ message: 'Invalid officer data received' })
   }
})

const updateOfficer = asyncHandler(async(req, res) =>{
    const { id, username, email, league, contact } = req.body

    // Confirm data 
    if (!id || !email || !username || !league || !contact  ) {
        return res.status(400).json({ message: 'All fields are required' })
    }
 
    // Does the user exist to update?
    const officer = await Officer.findById(id).exec()

    if (!officer) {
        return res.status(400).json({ message: 'Officer not found' })
    }

    // Check for duplicate 
    const duplicate = await Officer.findOne({ username }).lean().exec()

    // Allow updates to the original officer 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    officer.username = username
    officer.email = email
    officer.league = league
    officer.contact = contact

    const updatedOfficer = await officer.save()

    res.json({ message: `${updatedOfficer.username} updated` })
})

const deleteOfficer = asyncHandler(async(req, res) =>{
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Officer ID Required' })
    }

    
    // Does the user exist to delete?
    const officer = await Officer.findById(id).exec()

    if (!officer) {
        return res.status(400).json({ message: 'Officer not found' })
    }

    const result = await officer.deleteOne()

    const reply = `Officer ${result.username} with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllOfficers,
    createNewOfficer,
    updateOfficer,
    deleteOfficer
}