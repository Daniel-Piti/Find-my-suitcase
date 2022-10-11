const mongoose  = require('mongoose')

const messageSchema = require('./Message')

const suitcaseSchema = new mongoose.Schema({
    qr: {
        type: String,
        unique: true,
        required: [true, 'Please enter a QR code']
    },
    massages: [{
        type : messageSchema
    }]
})

const Suitcase = mongoose.model('suitcases', suitcaseSchema)

module.exports = Suitcase;