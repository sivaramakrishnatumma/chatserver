'use strict'

// const express = require('express');
// const bodyParser = require('body-parser');
// const request = require('request');

// const app = express()

// app.set('port', (process.env.PORT || 5000));

// app.use(bodyParser.urlencoded({extended: false}));
// app.use(bodyParser.json());

// app.get('/', function(req, res){
//     res.send("Hi I am a chatbot");
// });

// app.get('/login', function(req, res){
//     res.send("Hi I am a Login");
// });

// app.listen(app.get('port'), function(){
//     console.log('running: port');
// })









var io = require('socket.io'),
    http = require('http');
var express = require('express');
var app = express();
app.set('port', (process.env.PORT || 5000));
app.server = http.createServer(app);
var io = io.listen(app.server);
var bodyParser = require('body-parser');

var mongojs = require('mongojs');
var db = mongojs('mongodb://siva:siva@ds127391.mlab.com:27391/ionicchat', ['users', 'messages', 'aiequeries']);

io.on('connection', function (socket) {
    console.log('User Connected');

    socket.on('message', function (msg) {
        db.messages.save(msg, function (err, message) {
            if (err) {
                //res.send(err);
            }
            else {
                //res.json({ 'success': true, 'extras': {'msg': msg} });
                io.emit('message', msg);
            }
        })

    });

    db.users.find(function (err, users) {
        if (err) {
            console.log("Error:::", err);
        }
        else {
            if (users === null) {
                console.log('NULL');
            }
            else {
                console.log('User logged IN');
                io.emit('newuseronline', users)
            }
        }
    });
});

var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.use(allowCrossDomain);


app.post('/register', function (req, res) {
    var user = req.body;
    db.users.save(user, function (err, user) {
        if (err) {
            res.send(err);
        }
        else {
            res.json({ 'success': true, 'extras': { 'user': user } });

        }
    })
});

app.get('/messages', function (req, res) {
    //console.log(req.body);
    db.messages.find({}, function (err, messages) {
        if (err) {
            res.send(err);
        }
        else {
            if (messages === null) {
                res.json({ 'success': false, 'extras': { 'msg': "MESSAGES NOT FOUND" } });
            }
            else {
                res.json({ 'success': true, 'extras': { 'messages': messages } });
            }

        }
    })
});



app.get('/', function (req, res) {
    res.send("Hi, Tech savvy Server is running here...");
});

app.post('/login', function (req, res) {
    //console.log(req.body);
    db.users.findOne({ phonenumber: req.body.phonenumber }, function (err, user) {
        if (err) {
            res.send(err);
        }
        else {
            if (user === null) {
                res.json({ 'success': false, 'extras': { 'msg': "USER DOESN'T EXISTS" } });
            }
            else {
                if (user.password === req.body.password) {
                    db.users.update({ _id: user._id }, { $set: { isOnline: true } }, function (err, docs) {
                        console.log(docs);
                    })
                    user.isOnline = true;
                    res.json({ 'success': true, 'extras': { 'userProfile': user } });
                }
                else {
                    res.json({ 'success': false, 'extras': { 'msg': 'INVALID PASSWORD' } });
                }
            }

        }

    })
});

app.post('/aielogin', function (req, res) {
    console.log(req.body);
    db.aieusers.findOne({ empId: req.body.username }, function (err, user) {
        if (err) {
            res.send(err);
        }
        else {
            if (user === null) {
                res.json({ 'success': false, 'extras': { 'msg': "USER DOESN'T EXISTS" } });
            }
            else {
                if (user.password === req.body.password) {
                    db.aieusers.update({ _id: user._id }, { $set: { isOnline: true } }, function (err, docs) {
                        console.log(docs);
                    })
                    user.isOnline = true;
                    res.json({ 'success': true, 'extras': { 'userProfile': user } });
                }
                else {
                    res.json({ 'success': false, 'extras': { 'msg': 'INVALID PASSWORD' } });
                }
            }

        }

    })
});


app.get('/aiequeries', function (req, res) {
    //console.log(req.body);
    db.aiequeries.find({}, function (err, queries) {
        if (err) {
            res.send(err);
        }
        else {
            if (queries === null) {
                res.json({ 'success': false, 'extras': { 'msg': "QUERIES NOT FOUND" } });
            }
            else {
                res.json({ 'success': true, 'extras': { 'queries': queries } });
            }

        }
    })
});

app.post('/postquery', function (req, res) {
    var query = req.body;
    console.log(query);
    db.aiequeries.save(query, function (err, query) {
        if (err) {
            res.send(err);
        }
        else {
            res.json({ 'success': true, 'extras': { 'query': query } });
            
        }
    })
});



app.server.listen(app.get('port'), function () {
    console.log('Server started');
});