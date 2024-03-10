const mongoose = require('mongoose');

const dbmodel = require('../models/dbmodel');
const tier1_schedModel = dbmodel.tier1_schedModel;
const tier2_schedModel = dbmodel.tier2_schedModel;
const tier3_schedModel = dbmodel.tier3_schedModel;
const userModel = dbmodel.userModel;
const seatModel = dbmodel.seatModel;
const db_url = dbmodel.db_url;
const databaseName = dbmodel.databaseName;
const errorFn = dbmodel.errorFn;
const successFn = dbmodel.successFn;

mongoose.connect(db_url+databaseName);

function add(server){

  server.post('/reserve', function(req, resp){

    console.log('Reserve post request received');

    let tierModel;
    switch(Number(req.body.tier_num)){
        case 1: tierModel = tier1_schedModel; break;
        case 2: tierModel = tier2_schedModel; break;
        case 3: tierModel = tier3_schedModel; break;
    }

    //change searchQuery based on mode: "all", "taken_false", "taken_true"
    let searchQuery;
    switch(req.body.mode){
      case "all": searchQuery = {
        seats: Number(req.body.seat_num),
        day: Number(req.body.day_num)
      }; break;

      case "taken_false": searchQuery = {
        seats: Number(req.body.seat_num),
        taken: false,
        day: Number(req.body.day_num)
      }; break;

      //taken_true has not been used yet pero could be useful for finding which are to be editable
      case "taken_true": searchQuery = {
        seats: Number(req.body.seat_num),
        taken: true,
        day: Number(req.body.day_num)
      }; break;
    }

    console.log("Searching for Tier"+req.body.tier_num+": "+ JSON.stringify(searchQuery));

    tierModel.find(searchQuery).lean().then(function(vals){
        console.log('List successful');
        console.log(vals.length);
        resp.send({seats: vals});
    }).catch(errorFn);

  });

  // login post request for user log-in
server.post('/login-account', function(req, resp){
    //Creating a new instance can be made this way.
    const searchQuery = { //searchQuery for username based log-in
      username: req.body.username,
      password: req.body.password
    };
  
  //const dateinfo = require('./DateInfo');
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

}

module.exports.add = add;