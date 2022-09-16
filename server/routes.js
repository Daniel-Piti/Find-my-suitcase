const { Router } = require('express')
const router = Router()
const User = require('./User')
const jwt = require('jsonwebtoken')

// Handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code)
    let errors = { name: '', email : '', password : '' }

    // Incorrect email
    if (err.message === 'Incorrent email'){
        errors.email = 'Incorrent email'
    }

    // Incorrect password
    if (err.message === 'Incorrent password'){
        errors.password = 'Incorrent password'
    }

    // duplicate error code
    if (err.code === 11000){
        errors.email = 'That email is already registered'
        return errors
    }

    // Validation errors
    if (err.message.includes('user validation failed')){
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message
        })
    }

    return errors
}

// 3 Days in seconds
const maxAge = 3 * 24 * 60 * 60;

const createToken = id => {
    return jwt.sign({ id }, 'LEE SIN', {
        expiresIn: maxAge
    })
}

router.post('/sign-up', async (req, res) => {
    const { name, email, password } = req.body

    try {
        const user  = await User.create({ name, email, password })
        const token = createToken(user._id)
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(201).json({ user : user._id })
    }
    catch (err) {
        const errors = handleErrors(err)
        res.status(400).json({ errors })
    }
})

router.post('/sign-in', async (req, res) =>{
    const { email, password } = req.body

    try {
        const user = await User.login(email, password)
        const token = createToken(user._id)
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(200).json({ user : user._id })
    }
    catch (err) {
        const errors = handleErrors(err)
        res.status(400).json({errors})
    }

})

router.get('/sign-out', (req, res) =>{
    res.send('SIGN OUT')
})

module.exports = router