const reportSchemas = require("./../reportSchemas")
const winston = require('winston');
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const passport = require('passport')

module.exports.render = (req, res, page, variables) => {
    if(!variables)
        variables = {}
    variables.tba = req.tba
    variables.reportSchemas = reportSchemas
    variables.flashMessages = {
        errors: req.flash("error"),
        successes: req.flash("success"),
        warnings: req.flash("warning"),
        info: req.flash("info") 
    }
    variables.user = req.user
    req.session.flash = [];
    res.render(page, variables)
}

// SCOUTING
const reportModel = mongoose.model("Report");

module.exports.getScout = (req, res, next) => {
    let schemaMatches = reportSchemas.filter(a => a.name == req.params.reportName);
    if(schemaMatches.length < 1)
        next()
    else{
        // Additional Processing
        schemaMatches[0].fields.filter(a => a.name == "team").forEach(a => {
            a.options = req.tba.teams.map(b => (b.team_number + " - " + b.nickname))
        });

        module.exports.render(req, res, "scout", {schema: schemaMatches[0]})
    }
}

module.exports.postScout = (req, res, next) => {
    let schemaMatches = reportSchemas.filter(a => a.name == req.params.reportName);
    if(schemaMatches.length < 1)
        next()
    else{
        // Only take information in schema (Prevents clients sending in random data)
        let data = {}
        data.schemaName = schemaMatches[0].name
        data.submittedBy = req.user.name
        let keys = schemaMatches[0].fields.map(a => a.name);
        keys.forEach(key => {
            if(req.body.hasOwnProperty(key)){
                data[key] = req.body[key]
            }
        })
            
        reportModel.create(data, (err, report) => {
			module.exports.mongooseHandler(req, res, err, report, (report, successful) => {
                if(successful){
                    req.flash("success", "Successfully submitted report.")
                }
                module.exports.render(req, res, "scout", {schema: schemaMatches[0]})
            })
		});

    }
}


// USERS

const userModel = mongoose.model("User");

module.exports.postUser = (req, res) => {
    bcrypt.hash(req.body.password, 512, (bcryptError, hashedPassword) => {
        if(bcryptError){
            req.flash("error", "BCrypt error creating user.")
            winston.error("Bcrypt Error: " + bcryptError);
            if(!res.headerSent)
                module.exports.render(req, res, "register")
        }
        userModel.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        }, (err, user) => {
            module.exports.mongooseHandler(req, res, err, user, (user, successful) => {
                if(successful){
                    req.flash("success", "Successfully registered " + user.name + ".")
                }
                module.exports.render(req, res, "register")
            })
        });
    });
}

module.exports.mongooseHandler = (req, res, err, data, callback) => {
    if(err || !data){
        for(var key in err.errors){
            if(err.errors.hasOwnProperty(key)){
                if(err.errors[key].name != "ValidatorError"){
                    winston.error(JSON.stringify(err.errors[key]))
                    req.flash("error", "Could not complete request.")    
                }else{
                    req.flash("error", err.errors[key].message)
                }
            }
        }
        callback(null, false)
    }else{
        callback(data, true);
    }
}

module.exports.postLogin = (req, res) => {
    winston.silly(req.user)
}

module.exports.getLogout = (req, res) => {
    req.logout();
    res.redirect('/login');
}