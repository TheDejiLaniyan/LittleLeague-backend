require('dotenv').config()
const express = require('express')
const app = express()
const Port = process.env.PORT|| 3500
const path = require('path')
const mongoose = require('mongoose')
const connectDB = require('./config/dbConn')
const bodyParser = require('body-parser')
const {logger, logEvents} = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')

connectDB()

app.use(logger)
app.use(cors(corsOptions))
app.use(express.json({limit: "10mb", extended: true}))
app.use(express.urlencoded({limit: "10mb", extended: true, parameterLimit: 50000}))
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true})); //allows for files > 50mb to be sent
app.use(cookieParser()) //cookie parser for refresh
app.use('/', express.static(path.join(__dirname, 'public')))


app.use('/', require('./routes/root'))
app.use('/auth', require('./routes/authRoutes'))
app.use('/users', require('./routes/userRoutes'))
app.use('/officers', require('./routes/officersRoutes'))
app.use('/leagues', require('./routes/leagueRoutes'))


app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' })
    } else {
        res.type('txt').send('404 Not Found')
    }
})

mongoose.connection.once('open', ()=>{
    console.log('Connected to mongoDB')
    app.listen(Port, ()=> console.log(`Listening on PORT ${Port}`))
})

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})