const express      = require('express')
const bodyParser   = require('body-parser')
const mongoose     = require('mongoose')
const authRoutes   = require('./server/routes')
const cookieParser = require('cookie-parser')

// init app & middleware
const app = express()
app.use(express.json())
app.use(express.static(__dirname + '/client'))
app.use(cookieParser())

var port = 3000

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

app.use(authRoutes)

// NOT RELEVANT
app.post('/users', (req, res) =>{
    const user = req.body
    db.collection('users')
        .insertOne(user)
        .then(result => {
            res.status(201).json(result)
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({err : 'Error2'})
        })
})

app.get('/users', (req, res) =>{
    let users = []

    db.collection('users')
        .find()
        .forEach(user => users.push(user))
        .then (() => res.status(200).json(users))
        .catch(() => res.status(500).json({error : 'Error :('}))
})