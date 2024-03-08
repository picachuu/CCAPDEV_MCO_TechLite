// Installation Procedure
// npm init
// npm i express express-handlebars body-parser mongoose

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

// Mongoose connection

const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/Techlite');

// user-infos collection (contains user information)
const userSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String },
  password: { type: String },
  img_link: { type: String },
  quote: { type: String }
},{ versionKey: false });

const userModel = mongoose.model('user_info', userSchema);

// Schema for Schedules of different tier levels
const scheduleSchema = new mongoose.Schema({
    seats: { type: String },
    time_start: { type: BigInt },
    time_end: { type: BigInt },
    assigned_to: { type: String },
    email: { type: String },
    taken: { type: Boolean },
    month: { type: BigInt },
    day: { type: BigInt },
    year: { type: BigInt }
  },{ versionKey: false });
  
// tier1_scheds collection (contains schedule for tier 1 seats)
const tier1_schedModel = mongoose.model('tier1_sched', scheduleSchema);

// seats collection (contains seat information)
const seatSchema = new mongoose.Schema({
  seats: { type: BigInt },
  tier: { type: BigInt }
},{ versionKey: false });

const seatModel = mongoose.model('seat', seatSchema);

// error function for catches
function errorFn(err){
    console.log('Error fond. Please trace!');
    console.error(err);
}

// login post request for user log-in
server.post('/login-account', function(req, resp){
  //Creating a new instance can be made this way.
  const searchQuery = { //searchQuery for username based log-in
    username: req.body.username,
    password: req.body.password
  };

  const searchEmail = { //searchQuery for email based log-in
    email: req.body.username,
    password: req.body.password
  };

  let user = null;  // user object for user information is default to null

  userModel.findOne(searchQuery).lean().then(function(user_data){ //search for username based log-in
    if (user_data != null){

      user = user_data; // user object is assigned to user_data
      resp.redirect('/?success=true'); //redirect to home page with success message

    } else {
      userModel.findOne(searchEmail).lean().then(function(user_data){ //search for email based log-in

        if (user_data != null){
          user = user_data; // user object is assigned to user_data
          resp.redirect('/?success=true'); //redirect to home page with success message
        } else {
          resp.redirect('/?success=false'); //redirect to home page with failure message
        }

      }).catch(errorFn);
    }

  }).catch(errorFn);
});


//This part of the code will load the controllers that will interact
//with the rest of the system.
const controllers = ['routes'];
for(var i=0; i<controllers.length; i++){
  const ctrl = require('./controllers/'+controllers[i]);
  ctrl.add(server);
}


const port = process.env.PORT | 9090;
server.listen(port, function(){
    console.log('Listening at port '+port);
});
