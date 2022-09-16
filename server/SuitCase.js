const mongoose  = require('mongoose')

const suitCaseSchema = new mongoose.Schema({
    qr: {
        type: String,
        required: [true, 'Please enter a QR code']
    },
    massages: {
        type: Array,
        default: []
    }
})

const SuitCase = mongoose.model('suitCase', suitCaseSchema)

module.exports = SuitCase;