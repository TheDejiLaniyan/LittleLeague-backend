const mongoose = require('mongoose')

const officerSchema = new mongoose.Schema({
    username: {
        type:String,
        required: true
    },
    email: {
        type:String,
        required:true
    },
    league: {
        type:String,
        required:true
    },
    contact: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Officer', officerSchema)