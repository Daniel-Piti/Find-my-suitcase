const mongoose  = require('mongoose')

const messageSchema = require('./Message')

const suitcaseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter a name for your suitcase']
    },
    massages: [{
        type : messageSchema
    }]
})

const Suitcase = mongoose.model('suitcases', suitcaseSchema)

module.exports = Suitcase;