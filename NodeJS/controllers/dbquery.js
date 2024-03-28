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
    switch(req.body.mode) {
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

  server.post('/tier-slots', function(req, resp) {
    console.log('tier-slots query received');

    let tierModel;
    switch(Number(req.body.tier_num)) {
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

  server.post('/profile-reservations', function(req, resp) {  
    console.log('Profile post request received');

    let tierModel;
    switch(Number(req.body.tier_num)) {
        case 1: tierModel = tier1_schedModel; break;
        case 2: tierModel = tier2_schedModel; break;
        case 3: tierModel = tier3_schedModel; break;
    }

    //change searchQuery based on mode: "days", "taken_false", "taken_true"
    let searchQuery;
    switch(req.body.mode){

      case "reservations": searchQuery = {
        assigned_to: String(req.body.user_name)
      }; break;
    }
    
    console.log("Searching for Tier"+req.body.tier_num+": "+ JSON.stringify(searchQuery));

    tierModel.find(searchQuery).lean().then(function(vals){
      console.log('List successful');
      console.log(vals.length);
      resp.send({reservations: vals});
    }).catch(errorFn);
      
  });

  server.post('/manageable-check', function(req, resp) {
    console.log('Manage post request received');

    let tierModel;
    switch(Number(req.body.tier_num)) {
        case 0: tierModel = null; break;
        case 1: tierModel = tier1_schedModel; break;
        case 2: tierModel = tier2_schedModel; break;
        case 3: tierModel = tier3_schedModel; break;
    }

    //change searchQuery based on mode: "days", "taken_false", "taken_true"
    let searchQuery;
    switch(req.body.mode){
      
      //this is for hasReservations_atDayX() in manage.js
      case "find_timeslot": searchQuery = {
        seats: Number(req.body.seat_num),
        assigned_to: String(req.body.user_name),
        time_start: String(req.body.time_start),
        //taken: true, //this is for customers lang naman
        day: Number(req.body.day_num)
      }; findAll = false; break;
    }

    tierModel.findOne(searchQuery).lean().then(function(vals){
      console.log('Timeslot found for manage page');
      resp.send({seat: vals});
    }).catch(errorFn);

  });

  // Nothing to see here. Never used, never existed
  // 
  // // manage post request for determining which seats are manageable by req.body.username
  // server.post('/manageable-check', function(req, resp) {  
  //   console.log('Manage post request received');

  //   var findAll = true; //default to true

  //   //expected values, username, tier_num, day_num, seat_num
  //   //taken should be true na (would obv mean that seat already has username)

  //   let tierModel;
  //   switch(Number(req.body.tier_num)) {
  //       case 0: tierModel = null; break;
  //       case 1: tierModel = tier1_schedModel; break;
  //       case 2: tierModel = tier2_schedModel; break;
  //       case 3: tierModel = tier3_schedModel; break;
  //   }

  //   //change searchQuery based on mode: "days", "taken_false", "taken_true"
  //   let searchQuery;
  //   switch(req.body.mode){
      
  //     //this is for hasReservations_atDayX() in manage.js
  //     case "days": searchQuery = {
  //       assigned_to: String(req.body.user_name),
  //       //taken: true, //this is for customers lang naman
  //       day: Number(req.body.day_num)
  //     }; findAll = false; break;

  //     case "seats_reserved": searchQuery = {
  //       seats: Number(req.body.seat_num),
  //       assigned_to: String(req.body.user_name),
  //       day: Number(req.body.day_num)
  //     }; findAll = false; break;

  //     case "timeblocks_of_seat_X": searchQuery = {
  //       seats: Number(req.body.seat_num),
  //       assigned_to: String(req.body.user_name),
  //       day: Number(req.body.day_num)
  //     }; findAll = true; break;
  //   }
    
  //   console.log("Searching for Tier"+req.body.tier_num+": "+ JSON.stringify(searchQuery));

  //   if (tierModel == null) {
  //     console.log('Invalid Tier');
  //     resp.send({isAvail: false});
  //   }
  //   else {
  //     if (findAll) {
  //       tierModel.find(searchQuery).lean().then(function(vals){
  //         console.log('List successful');
  //         console.log(vals.length);
  //         resp.send({seats: vals});
  //       }).catch(errorFn);
  //     }
      
  //     else {
  //       tierModel.findOne(searchQuery).lean().then(function(vals){
  //         //credits to Stanley 
  //         let isAvailable = true;
  //         if(vals == null){
  //             isAvailable = false;
  //         }
  //         console.log('Tier'+req.body.tier_num+' Availability: '+ isAvailable);
  //         resp.send({isAvail: isAvailable});
  //       }).catch(errorFn);
  //     }
  //   }
  // });

  

}


module.exports.add = add;