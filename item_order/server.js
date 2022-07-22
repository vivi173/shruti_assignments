require('dotenv').config();
const express = require('express');

//const dotenv = require('dotenv');
const morgan = require('morgan');
const bodyparser = require("body-parser");
const path = require('path');
const cookieParser =require("cookie-parser");


const connectDB = require('./server/database/connection');

const app = express();

//dotenv.config( { path : 'config.env'} )
const PORT = process.env.PORT || 9000
//const PORT = 9000
console.log(process.env.SECRET_KEY);


// log requests
app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser());


// mongodb connection
connectDB();

// parse request to body-parser
app.use(bodyparser.urlencoded({ extended : true}))

// set view engine
app.set("view engine", "ejs")
//app.set("views", path.resolve(__dirname, "views/ejs"))



// load routers
app.use('/', require('./server/routes/router'))

app.listen(PORT, ()=> { console.log(`Server is running on http://localhost:${PORT}`)});