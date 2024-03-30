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

//bcrypt is a library that will help us hash passwords
const bcrypt = require('bcrypt');
const saltRounds = 10;  // keep this at 10
// end bcrypt



//This part of the code will load the controllers that will interact
//with the rest of the system.
const controllers = ['routes','dbquery','dbaccounts'];
for(var i=0; i<controllers.length; i++){
  const ctrl = require('./controllers/'+controllers[i]);

  switch (controllers[i]) {
    case 'dbaccounts':
      ctrl.add(server, bcrypt, saltRounds);
      break;
    default:
      ctrl.add(server);
      break;
  }
}

const port = process.env.PORT | 3000;
server.listen(port, function(){
    console.log('Listening at port '+port);
});
