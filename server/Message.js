const mongoose  = require('mongoose')

const messageSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
})

module.exports = messageSchema;