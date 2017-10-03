'use strict'

const express = require('expess');
const bodyParser = require('body-parser');
const request = require('request');

const app = express()

app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', function(req, res){
    res.send("Hi I am a chatbot");
});

app.listen(app.get('port'), function(){
    console.log('running: port');
})