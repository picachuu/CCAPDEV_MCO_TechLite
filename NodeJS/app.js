// Installation Procedure
// npm init
// npm i express express-handlebars body-parser mongoose bcrypt multer express-session connect-mongodb-session

const dbmodel = require('./models/dbmodel'); //database models

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

const multer = require('multer');
const path = require('path');

// Set up storage engine
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/uploads');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });


const mongoose = dbmodel.mongoose;
const mongo_uri = dbmodel.mongo_uri;
mongoose.connect(mongo_uri);


// sessions: this is a way to store data on the client side browser (per) - basically cookies
const session = require('express-session');
const mongoStore = require('connect-mongodb-session')(session);

server.use(session({
  secret: 'a secret fruit',
  saveUninitialized: true, 
  resave: false,
  store: new mongoStore({ 
    uri: mongo_uri,
    collection: 'mySession',
    expires: 1000*60*60 // 60 minutes
  })
}));



// stores modules and constants that will be used by the controllers
// not sure if all will be used within controller
const modules = {
  dbmodel: dbmodel,
  express: express,
  bcrypt: bcrypt,
  saltRounds: saltRounds,
  mongoose: mongoose,
  upload: upload
};


//This part of the code will load the controllers that will interact
//with the rest of the system.
const controllers = ['routes','dbquery','dbaccounts','dbupdater'];
for(let i=0; i<controllers.length; i++){
  const ctrl = require('./controllers/'+controllers[i]);

  ctrl.add(server, modules);
}

const port = process.env.PORT | 3000;
server.listen(port, function(){
    console.log('Listening at port '+port);
});

// export all the dbmodels
module.exports = dbmodel.tier1_schedModel;
module.exports = dbmodel.tier2_schedModel;
module.exports = dbmodel.tier3_schedModel;
module.exports = dbmodel.userReservationModel;
module.exports = dbmodel.userModel;