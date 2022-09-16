const mongoose  = require('mongoose')

const messageSchema = new mongoose.Schema({
    massage: {
        type: String
    }
})

const Message = mongoose.model('message', messageSchema)

module.exports = Message;