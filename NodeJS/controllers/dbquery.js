const mongoose = require('mongoose');

const dbmodel = require('../models/dbmodel');
const tier1_schedModel = dbmodel.tier1_schedModel;
const tier2_schedModel = dbmodel.tier2_schedModel;
const tier3_schedModel = dbmodel.tier3_schedModel;
const userReservationModel = dbmodel.userReservationModel;
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

  server.post('/profile-reservations', async function(req, resp) {  
    console.log('Profile post request received');

    const page = Math.max(1, Number(req.body.page));
    const pageSize = 3;
    // Expect tier_nums to be an array of selected tier numbers. If not provided or empty, select all tiers.
    const tierFilters = req.body.tier_nums ? req.body.tier_nums.map(Number) : [1, 2, 3];

    let combinedReservations = [];
    let totalReservations = 0;

    const tiers = [tier1_schedModel, tier2_schedModel, tier3_schedModel];
    let tierCounts = {1: 0, 2: 0, 3: 0};

    for (let tierIndex = 0; tierIndex < tiers.length; tierIndex++) {
        // Include tiers based on the filter
        if (!tierFilters.includes(tierIndex + 1)) continue;

        let tierModel = tiers[tierIndex];
        const reservations = await tierModel.find({ assigned_to: String(req.body.user_name) }).lean();
        const reservationsWithTier = reservations.map(reservation => ({
            ...reservation,
            tier: tierIndex + 1
        }));
        combinedReservations.push(...reservationsWithTier);
        tierCounts[tierIndex + 1] = reservationsWithTier.length;
        totalReservations += reservationsWithTier.length;
    }

    console.log("Tier Counts:", tierCounts);
    const startIndex = (page - 1) * pageSize;
    let paginatedReservations = combinedReservations.slice(startIndex, startIndex + pageSize);

    resp.send({
        reservations: paginatedReservations,
        page: page,
        pageSize: pageSize,
        total: totalReservations,
        totalPages: Math.ceil(totalReservations / pageSize)
    });

    console.log(`Page ${page} of ${Math.ceil(totalReservations / pageSize)}`);
    console.log(`Total reservations: ${totalReservations}`);
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

  // Reservation Form post request (reserving a slot given variables)
  server.post('/reserve-form', function(req, resp) {
    console.log('--- Reserve form post request received ---');
    

    const selectedTier = req.body.selectedTier;
    const selectedDay = req.body.selectedDay; // in the form of "2024-03-09"
    const times = req.body.time.trim();  // in the form of "02:00 02:30 08:30"
    const seat = req.body.seat;
    const name = req.body.name;
    const email = req.body.email;
    const isManager = req.body.reserveManager == 'true';
    const reserverName = req.body.reserverName;
    const reserverEmail = req.body.reserverEmail;
    
    const year = Number(selectedDay.split('-')[0]);
    const month = Number(selectedDay.split('-')[1]);
    const day = Number(selectedDay.split('-')[2]);

    // Get array of time in military time in the form of "0200 0230 0830"
    const timeArray = times.split(' ').map(time => {
        const hour = Number(time.split(':')[0]);
        const minute = Number(time.split(':')[1]);
        return hour * 100 + minute;
    });

    if ((timeArray.length > 4 && !isManager) || timeArray.length < 1 ) {
      let message = 'Invalid Reservation Times';
      console.log("In server.post('/reserve-form') - " + message);
      reserve_failed(resp,message);
    }

    // Get tier model for the respective tier collection
    let tierModel;
    switch(Number(selectedTier)) {
        case 1: tierModel = tier1_schedModel; break;
        case 2: tierModel = tier2_schedModel; break;
        case 3: tierModel = tier3_schedModel; break;
    }

    console.log("CHECKPOINTASOINHTPOIAESWNTPOGAS");
    //display all constants
    console.log("Selected Tier: "+selectedTier);
    console.log("Selected Day: "+selectedDay);
    console.log("Times: "+times);
    console.log("Seat: "+seat);
    console.log("Name: "+name);
    console.log("Email: "+email);
    console.log("Is Manager: "+isManager);
    console.log("Year: "+year);
    console.log("Month: "+month);
    console.log("Day: "+day);
    console.log("Time Array: "+timeArray);

    // step 1: check if user (the reserver) exists (name and email) and obtain the _id of the user document
    userModel.findOne({ username: reserverName, email: reserverEmail }).lean().then(function(user_data) {
      if (user_data == null) {
          let message = 'User not found';
          console.log("In server.post('/reserve-form') - " + message);
          reserve_failed(resp,message);
      } else {
        console.log('User found');
        console.log(user_data);
        let reserver = user_data._id;
        // step 2: check if the selected slots are available
        tierModel.find({
          seats: seat,
          day: day,
          year: year,
          month: month,
          taken: false,
          cancelled: false,
          time_start: { $in: timeArray }
        }).lean().then(function(reservations) {
          if (reservations.length != timeArray.length) {
            let message = 'Selected slots are not available';
            console.log("In server.post('/reserve-form') - " + message);
            reserve_failed(resp,message);
          } else {
            // step 3: create a user_reservation document (if email is an empty string, then walk_in is TRUE), and get the _id of the user_reservation
            const walk_in = email == '';
            let userReservation = {
                reserve_time: new Date(),
                tier: selectedTier,
                reserver: reserver,
                walk_in: walk_in,
                slots: timeArray.length
            };

            userReservationModel.create(userReservation).then(function(user_reservation) {
              console.log('User reservation created');
              console.log(user_reservation);

              // step 4: reserve the selected slots (editing the documents)
              let reservation_id = user_reservation._id;

              let updateQuery = {
                seats: seat,
                time_start: { $in: timeArray },
                month: month,
                day: day,
                year: year
              };

              if (walk_in) {
                email = 'walk-in';
              }

              let updateValues = {
                $set: {
                  reservation_id: reservation_id,
                  cancelled: false,
                  taken: true,
                  assigned_to: name,
                  email: email
                }
              };

              tierModel.updateMany(updateQuery, updateValues).then(function(reservations) {
                console.log('Reservation successful');
                reserve_success(resp,reservation_id);
              }).catch(errorFn);

            }).catch(errorFn);
          }
        }).catch(errorFn);
      }
    }).catch(errorFn);

  });

  function reserve_failed(resp,message){
    resp.render('reserve_fail',{
      layout: 'index',
      title: 'TechLite - Reservation Failed',
      message: message
    });
  }

  function reserve_success(resp,reservation_id){
    resp.render('reserve_success',{
      layout: 'index',
      title: 'TechLite - Reservation Success',
      reservation_id: String(reservation_id)
    });
  }

}


module.exports.add = add;