const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const express = require("express")
const mongoose = require('mongoose');
const session = require('express-session');


module.exports = (app) => {

    // Configure body parser
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(cookieParser(process.env.COOKIE_SECRET || "insecure"));

    // Set up public folders
    app.use("/", express.static('./bower_components'));
    app.use("/", express.static('./public'));
    
    // Configure app
    app.set("view engine", "pug");
    app.set('views', './app/views');

    // Configure Sessions
    app.use(session({
        secret: process.env.COOKIE_SECRET || "insecure",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({
            mongooseConnection: mongoose.connection
        })
    }));

    // Login Redirection (as Middlewear)

    // Configure Passport

    // Base Routing
}