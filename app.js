// -------------- load packages -------------- //
// INITIALIZATION STUFF

var express = require('express')
const fs = require('fs')
const path = require('path')
const port = 3000;

const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
    service: 'Outlook',
    name: 'Outlook.com',
    auth: {
        user: 'dccfweb@outlook.com', // generated ethereal user
        pass: 'Dccfwpixs!', // generated ethereal password
    },
});

var app = express();

app.use(express.static('public/static_files'))

var announcementsdata = path.join('public','data','announcementdata.json')


var hbs = require('hbs')
hbs.registerPartials(__dirname + '/public/views/partials', function (err) {});
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, '/public/views'));

// const routePage = require('./routes/route.js')
// app.use(routePage)

app.get('/', function(req, res){

    data = getAnnouncements();
    res.render('base.hbs', {aData: data['announcements']})
})

app.get('/admin', function(req, res){
    res.render('adminform.hbs')
})

app.get('/adminresponse', function(req, res){
    console.log(req.query)
    if (!('password' in req.query) || req.query.password!="testpass") {
        res.redirect('/')
    }
    if (req.query.title) {
        var title = req.query.title
        var msg = req.query.msg
        var link = req.query.link
        
        var linkmsg = req.query.linkmsg
        if (!linkmsg || !link){
            linkmsg = link
        }
        var today = new Date();
        var yyyy = today.getFullYear();
        var mm = today.getMonth() + 1; // Months start at 0!
        var dd = today.getDate();

        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;

        var date = dd + '/' + mm + '/' + yyyy;
         
        var jsonData  = {
            "date": date,
            "title": title,
            "message": msg,
            "link":link,
            "linkmessage":linkmsg
        }
        var clear = false
        if ('clear' in req.query && req.query.clear=='on'){
            clear = true
        }

        updateAnnouncements(jsonData, clear, res)

    } else if ('clear' in req.query && req.query.clear=='on') {
        console.log('here')
        updateAnnouncements(false, true, res)
    } else {
        res.redirect('/')
    }
    

})

app.get('/form', function(req,res){
    console.log(req.query)
    if ('json' in req.query){
        var response = JSON.parse(req.query.json)
        console.log(response)
        var subject = `Website Message from ${response.name}`
        var email = 'Not Provided'
        var phone = 'Not Provided'
        if (response.email) {
            email = response.email
        }
        if (response.phone) {
            phone = response.phone
        }
        var message = `${response.msg} \nEmail: ${email} \nPhone Number: ${phone}`

        transporter.sendMail({
            from: 'dccfweb@outlook.com', // sender address
            to: "djjagga@gmail.com", // list of receivers
            subject: subject, // Subject line
            text: message, // plain text body
        }, (error, info) => {
            if (error) {
                return console.log(error);
            } else {
                console.log('Message sent: %s', info.messageId);
            }
            
        });


    }
    res.redirect('/')
})

function getAnnouncements() {
    
    var data = JSON.parse(fs.readFileSync(announcementsdata));
    //console.log(data["announcements"])
    return data
}
function updateAnnouncements(newData, clear, res){
    fs.readFile(announcementsdata, 'utf8', function readFileCallback(err, data){

        if (err){
            console.log(err);
        } else {
        
            obj = JSON.parse(data);
             //add some data
            obj.announcements.reverse()
            if (obj.announcements.length > 20){
                obj.announcements.shift()
            }
            if (clear){
                obj.announcements=[]
            }
            if (newData){
                obj.announcements.push(newData);
            }
            obj.announcements.reverse()
            json = JSON.stringify(obj); //convert it back to json
            fs.writeFile(announcementsdata, json, 'utf8', (err) => {
                if (err) {
                    console.log(err);
                    res.redirect('/')
                }
                else {
                  console.log("File written successfully\n");
                  console.log("The written has the following contents:");
                  res.redirect('/')
                }
              });
            
        }
    });
}

function urlExists(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            callback(xhr.status < 400);
        }
    };
    xhr.open('HEAD', url);
    xhr.send();
}


// run function
function check_link(url) {
    urlExists(url, function (exists) {
        if (exists) {
            console.log('"%s" exists?', url, exists);
        }
    });
}

var listener = app.listen(port, function() {
    console.log(`Express server started on http://localhost:${port}`);
});