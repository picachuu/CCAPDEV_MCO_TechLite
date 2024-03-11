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

  server.post('/tier-slots', function(req, resp){
    console.log('tier-slots query received');

    let tierModel;
    switch(Number(req.body.tier_num)){
        case 1: tierModel = tier1_schedModel; break;
        case 2: tierModel = tier2_schedModel; break;
        case 3: tierModel = tier3_schedModel; break;
    }

    const searchQuery = { taken: false };

    console.log("Searching for Tier"+req.body.tier_num+": "+ JSON.stringify(searchQuery));

    tierModel.findOne(searchQuery).lean().then(function(val){
        console.log('Tier-slot query successful');
        let isAvailable = true;
        if(val == null){
            isAvailable = false;
        }
        console.log('Tier'+req.body.tier_num+' Availability: '+ isAvailable);
        resp.send({isAvail: isAvailable});
    }).catch(errorFn);

  });
  

  // login post request for user log-in, returns user object
  server.post('/login-account', async function(req, resp){  //async function for asynchronous operations
    //Creating a new instance can be made this way.
    const searchQuery = { //searchQuery for username based log-in
      username: req.body.username,
      password: req.body.password
    };
  
    //const dateinfo = require('./DateInfo');
    /* const searchEmail = { //searchQuery for email based log-in
      email: req.body.username,
      password: req.body.password
    }; */
  
    let user = null;  // user object for user information is default to null
  
    /* userModel.findOne(searchQuery).lean().then(function(user_data){ //search for username based log-in
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
  
    }).catch(errorFn); */

    user = await checkLoginDB(searchQuery); // wait for the function to finish before proceeding


    // below is a placeholder
    if (user != null){
      resp.redirect('/?success=true'); //redirect to home page with success message
    } else {
      resp.redirect('/?success=false'); //redirect to home page with failure message
    }

  });

  // check-login post request for user log-in validation, returns validation boolean
  server.post('/check-login', async function(req, resp){  //async function for asynchronous operations
    //Creating a new instance can be made this way.
    const searchQuery = { //searchQuery for username based log-in
      username: req.body.username,
      password: req.body.password
    };

    let valid = false;

    let user = await checkLoginDB(searchQuery); // wait for the function to finish before proceeding

    if (user != null){
      console.log('Obtained Username: ' + user.username);
    } else {
      console.log('No User Found');
    }

    if (user) {
      valid = true;
    }

    resp.send({valid: valid});
  });

  async function checkLoginDB(searchQuery){ //async function for asynchronous operations

    console.log('Checking login credentials...');

    // Check if searchQuery is an object
    if (typeof searchQuery !== 'object' || searchQuery === null) {
        throw new Error('searchQuery must be an object');
    }

    // Check if searchQuery has a 'username' property
    if (!searchQuery.hasOwnProperty('username')) {
        throw new Error('searchQuery must have a username property');
    }

    // Check if searchQuery has a 'password' property
    if (!searchQuery.hasOwnProperty('password')) {
        throw new Error('searchQuery must have a password property');
    }
/* 
    const searchUsername = searchQuery;

    const searchEmail = { //searchQuery for email based log-in
      email: searchQuery.username,
      password: searchQuery.password
    };

    // user object for user information is default to null
    let user = null;  // also used as boolean
  
    await userModel.findOne(searchUsername).lean().then(function(user_data){ //search for username based log-in
      if (user_data != null){

        user = user_data; // user object is assigned to user_data
        console.log('1User Credentials: ' + user);



      } else {
        await userModel.findOne(searchEmail).lean().then(function(user_data){ //search for email based log-in

          if (user_data != null){

            user = user_data; // user object is assigned to user_data
            console.log('1User Credentials: ' + user);
            
          }

        }).catch(errorFn);
      }
  
    }).catch(errorFn);

    console.log('2User Credentials: ' + user); */
    let user;
    let username = await checkLoginUsername(searchQuery); // wait for the function to finish before proceeding
    let email = await checkLoginEmail(searchQuery); // wait for the function to finish before proceeding

    console.log('Wtihtin username User Credentials: ' + JSON.stringify(username));
    console.log('Wtihtin email User Credentials: ' + JSON.stringify(email));

    if (username != null){  // check if username based log-in is successful
      user = username;
    } else if (email != null){ // check if email based log-in is successful
      user = email;
    } else {
      user = null;
    }
    
    // return {user_username: await checkLoginUsername(searchQuery), user_email: await checkLoginEmail(searchQuery)};
    return user;
  }

  // check user credentials based on username
  async function checkLoginUsername(searchQuery) {  //async function for asynchronous operations
    let user = null;

    console.log('Checking Credentials: Username');

    //searchQuery for username based log-in (wait for the function to finish before proceeding)
    await userModel.findOne(searchQuery).lean().then(function(user_data){
      if (user_data != null){ // if query is successful

        user = user_data;
        // console.log('Wtihtin username User Credentials: ' + JSON.stringify(user));
        
      }
    }).catch(errorFn);

    return user;
  }

  // check user credentials based on email
  async function checkLoginEmail(searchQuery) { //async function for asynchronous operations
    searchQuery = { //searchQuery for email based log-in
      email: searchQuery.username,
      password: searchQuery.password
    };

    let user = null;

    console.log('Checking Credentials: Email');
    //searchQuery for email based log-in (wait for the function to finish before proceeding)
    await userModel.findOne(searchQuery).lean().then(function(user_data){
      if (user_data != null){

        user = user_data;
        
        // console.log('Wtihtin email User Credentials: ' + JSON.stringify(user));
      }
    }).catch(errorFn);

    return user;
  }

}


module.exports.add = add;