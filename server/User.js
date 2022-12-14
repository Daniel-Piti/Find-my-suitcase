const mongoose    = require('mongoose')
const { isEmail } = require('validator')
const bcrypt      = require('bcrypt')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter an name'],
        lowercase: true
    },
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true.valueOf,
        validate: [ isEmail , 'Please enter a valid name']
    },
    suitcases: [{
        type : mongoose.Schema.Types.ObjectId,
        ref  : 'suitcases'
    }],
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6, 'Minimum length is 6 characters']
    }
})

userSchema.pre('save', async function (next) {
    console.log('New user about to be created ->', this.email)
    const salt = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

userSchema.post('save', function (doc, next) {
    console.log('New user saved -> ', doc.email)
    next()
})

userSchema.statics.login = async function(email, password){
    const user = await this.findOne({ email })
    if(user) {
        const auth = await bcrypt.compare(password, user.password)
        if(auth) {
            return user
        }
        throw Error('Incorrent password')
    }
    throw Error('Incorrent email')

}

const User = mongoose.model('user', userSchema)

module.exports = User;

