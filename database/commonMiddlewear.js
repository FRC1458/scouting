const winston = require('winston');
const mongoose = require('mongoose')

const reportModel = mongoose.model("Report")

module.exports.injectAllReports = (req, res, next) => {
    reportModel.find({}).sort({submittedAt:-1}).exec((err, reports) => {
        if(err){
            req.flash("error", "Error getting reports.")
            next();
        }else{
            req.reports = reports
            next();
        }
    })
}