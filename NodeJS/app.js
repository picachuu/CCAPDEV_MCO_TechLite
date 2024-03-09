// Installation Procedure
// npm init
// npm i express express-handlebars body-parser

const express = require('express');
const server = express();

const bodyParser = require('body-parser');
server.use(express.json()); 
server.use(express.urlencoded({ extended: true }));

const handlebars = require('express-handlebars');
server.set('view engine', 'hbs');
server.engine('hbs', handlebars.engine({
    extname: 'hbs',
}));

server.use(express.static('public'));

//Use this function to turn the status of an day into
//a class that is consistent with the naming convention the
//css file use.

//Modify the code in this area


//const dateinfo = require('./DateInfo');


//This part of the code will load the controllers that will interact
//with the rest of the system.
const controllers = ['routes','dbquery'];
for(var i=0; i<controllers.length; i++){
  const ctrl = require('./controllers/'+controllers[i]);
  ctrl.add(server);
}


const port = process.env.PORT | 9090;
server.listen(port, function(){
    console.log('Listening at port '+port);
});
