const mongoose = require('mongoose')

const leagueSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    // officer: {
    //     type:Object
    // }
    officer:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Officer',
        required: true
    }
    // officer:{
    //     type: String
    // }
})

module.exports = mongoose.model('League', leagueSchema)

