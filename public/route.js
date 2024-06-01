const express = require('express')
var router = express.Router()

app.get('/route', function(req,res){
    res.render('base.html')
})

module.exports = router