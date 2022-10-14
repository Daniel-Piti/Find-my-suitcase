const express      = require('express')
const mongoose     = require('mongoose')
const jwt          = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const QRCode = require("qrcode");

const User = require('./server/User')
const SuitCase = require('./server/SuitCase')

// init app & middleware
const app = express()
app.use(express.json())
app.use(express.static(__dirname + '/client'))
app.use(cookieParser())

const port = 3000
const SECRET = 'LEE SIN'
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
        jwt.verify(token, SECRET, (err, docodedToken) => {
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
    return jwt.sign({ id }, SECRET, {
        expiresIn: maxAge
    })
}

const getUser = async (token) => {
    try {
        let decodedToken = jwt.verify(token, SECRET)
        let user = await User.findById(decodedToken.id)
        return user
    }
    catch (err) {
        return null
    }
}

const getQR = async (id) => {
    let url = 'localhost:3000/write-message?id=' + id
    let qr = await QRCode.toDataURL(url)
    return qr
}

const getCleanSuitcases = async (data) => {
    let suitcases = data._doc.suitcases
    await Promise.all(suitcases.map(async suitcase => {
        let qr = await getQR(suitcase._id)
        suitcase._doc.qr = qr
        delete suitcase._doc.__v
        suitcase._doc.massages.forEach(message => {
            delete message._doc._id
            delete message._doc.__v
        })
    }))
    return suitcases
}

// connect to DB
const dbURI = 'mongodb+srv://danielpi:1234@cluster0.cxgnxlm.mongodb.net/node-auth'
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, autoIndex: true })
    .then(result => {
        app.listen(port)
        console.log(port + ' is on!')
    })
    .catch(err => console.log(err))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/home/home.html')
})

app.get('/get-name', async (req, res) => {
    let name = null
    try {
        let decodedToken = jwt.verify(req.cookies.jwt, SECRET)
        let user = await User.findById(decodedToken.id)
        if(user.name){
            name = user.name.toLowerCase()
        }
    }
    catch(err){        
        console.log(err.message)
    }
    
    if(name === null)
        res.status(404).json({name : ''})
    else
        res.status(201).json({ name })
})

app.get('/sign-in', (req, res) => {
    res.sendFile(__dirname + '/client/sign-in/sign-in.html')
})

app.get('/sign-up', (req, res) => {
    res.sendFile(__dirname + '/client/sign-up/sign-up.html')
})

app.get('/my-suitcases', requireAuth, (req, res) => {
    res.sendFile(__dirname + '/client/my-suitcases/my-suitcases.html')
})

app.get('/write-message', (req, res) => {
    res.sendFile(__dirname + '/client/write-message/write-message.html')
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
    console.log(email, password)
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

app.get('/sign-out', (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 })
    res.redirect('/')
})

app.post('/add-message', async (req, res) => {
    const { location, message, QR } = req.body
    console.log(location, message, QR)
    let date = Date.now()
    try {
        let suitcase = await SuitCase.findOne({ _id : QR})
        suitcase.massages.push({date, location, message})
        suitcase.save()
        res.status(201).json({ status : "OK" })
    }
    catch (err) {
        res.status(400).json({ status : "ERROR" })
    }
})

app.post('/add-suitcase', async (req, res) => {
    let suitcaseName = req.body.suitcaseName

    try {
        let decodedToken = jwt.verify(req.cookies.jwt, SECRET)

        const suitcase  = await SuitCase.create({ name : suitcaseName })
        await User.findOneAndUpdate({_id : decodedToken.id}, { $push : { suitcases: suitcase }}, { new : true })
        suitcase._doc.qr = await getQR(suitcase._id)
        console.log('Added suitcase - ' + suitcase._id)
        res.status(201).json(suitcase)
    }
    catch (err) {
        const errors = handleErrors(err)
        res.status(400).json({ errors })
    }
})

app.post('/remove-suitcase', async (req, res) => {
    let suitcaseID = req.body.suitcaseID

    try {
        let user = await getUser(req.cookies.jwt)
        if(user !== null) {
            let suitcase = await SuitCase.findOne({ _id : suitcaseID})
            let doc =  await User.findOneAndUpdate({_id : user.id}, { $pull : { suitcases: suitcase.id } }, { new : true })
            if(user.suitcases.length - doc.suitcases.length === 1){
                console.log("Suitcase deleted - " + suitcase.id)
                res.status(200).json({status : "OK"})
            }
            else {
                res.status(400).json({status : "ERROR"})
            }
        }
    }
    catch (err) {
        res.status(400).json({ status : "ERROR" })
    }
})

app.get('/get-suitcases', async (req, res) => {
    let user = await getUser(req.cookies.jwt)
    if(user !== null){
        let suitcases = await getCleanSuitcases(await user.populate('suitcases'))
        res.status(201).json(suitcases)
    }
    else {
        res.status(400).json({ name: "not connected" })
    }
})

app.use((req, res) => {
    res.status(404).sendFile(__dirname + '/client/not-found/not-found.html')
})

