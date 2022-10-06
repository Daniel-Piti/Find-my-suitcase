const express      = require('express')
const mongoose     = require('mongoose')
const jwt          = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const User = require('./server/User')

// init app & middleware
const app = express()
app.use(express.json())
app.use(express.static(__dirname + '/client'))
app.use(cookieParser())

const port = 3000
const secret = 'LEE SIN'
const maxAge = 3 * 24 * 60 * 60;

// FUNCTIONS

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

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt
    if(token){
        jwt.verify(token, secret, (err, docodedToken) => {
            if(err){
                console.log(err.message)
                res.redirect('/sign-in')
            }
            else {
                console.log(docodedToken)
                next()
            }
        })
    }
    else {
        res.redirect('/sign-in')
    }
}

const createToken = id => {
    return jwt.sign({ id }, secret, {
        expiresIn: maxAge
    })
}

const getUser = cookie => {
    return "Nana"
}

// connect to DB
const dbURI = 'mongodb+srv://danielpi:1234@cluster0.cxgnxlm.mongodb.net/node-auth'
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => {
        app.listen(port)
        console.log(port + ' is on!')
    })
    .catch(err => console.log(err))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/home/home.html')
})

app.get('/get-name', (req, res) => {
    const name = getUser(req.cookies.jwt)
    console.log(name)
    res.status(201).json({ name })
})

app.get('/sign-in', (req, res) => {
    res.sendFile(__dirname + '/client/sign-in/sign-in.html')
})

app.get('/sign-up', (req, res) => {
    res.sendFile(__dirname + '/client/sign-up/sign-up.html')
})

app.get('/my-suitcases', requireAuth, (req, res) => {
    console.log("dude")
    res.sendFile(__dirname + '/client/my-suitcases/my-suitcases.html')
})

app.post('/sign-up', async (req, res) => {
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

app.post('/sign-in', async (req, res) =>{
    const { email, password } = req.body

    try {
        const user = await User.login(email, password)
        const token = createToken(user._id)
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(200).json({ user : user._id })
    }
    catch (err) {
        // Not secure
        // const errors = handleErrors(err)
        
        res.status(400).json({ "error" : "Email or password are incorrect" })
    }
})

app.get('/sign-out', (req, res) =>{
    res.cookie('jwt', '', { maxAge: 1 })
    res.redirect('/')
})

app.use((req, res, next) => {
    res.status(404).sendFile(__dirname + '/client/not-found/not-found.html')
})