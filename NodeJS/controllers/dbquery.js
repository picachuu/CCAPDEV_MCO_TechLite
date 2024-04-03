const { json } = require("body-parser");

function add(server, modules){
  // establish all module constants
  const dbmodel = modules.dbmodel;
  const bcrypt = modules.bcrypt;
  const saltRounds = modules.saltRounds;
  const mongoose = modules.mongoose;

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
  const upload = modules.upload;


  server.post('/reserve', function(req, resp){
    console.log('Reserve post request received');
    let isPreselect = false;
    if (req.body.reservation) {
      isPreselect = true;
      req.session.reservation = req.body.reservation;
      resp.render('reserve',{
        layout: 'index',
        title: 'TechLite - Reserve Your Seat',
        isPreselect: true
      });
      return;
    }

    //change searchQuery based on mode: "all", "taken_false", "taken_true"
    let searchQuery;
    switch(req.body.mode) {
      case "all": searchQuery = {
        cancelled_by: null,
        seats: Number(req.body.seat_num),
        day: Number(req.body.day_num),
        month: Number(req.body.month_num),
        year: Number(req.body.year_num)
      }; break;

      case "taken_false": searchQuery = {
        seats: Number(req.body.seat_num),
        taken: false,
        cancelled_by: null,
        day: Number(req.body.day_num),
        month: Number(req.body.month_num),
        year: Number(req.body.year_num)
      }; break;

      //taken_true has not been used yet pero could be useful for finding which are to be editable
      case "taken_true": searchQuery = {
        seats: Number(req.body.seat_num),
        taken: true,
        cancelled_by: null,
        day: Number(req.body.day_num),
        month: Number(req.body.month_num),
        year: Number(req.body.year_num)
      }; break;

      case "preselect": {
        resp.send({reservation: req.session.reservation});
      }
      return;
    }

    let tierModel;
    switch(Number(req.body.tier_num)){
        case 1: tierModel = tier1_schedModel; break;
        case 2: tierModel = tier2_schedModel; break;
        case 3: tierModel = tier3_schedModel; break;
    }

    console.log("Searching for Tier"+req.body.tier_num+": "+ JSON.stringify(searchQuery));

    tierModel.find(searchQuery).lean().then(function(vals){
        console.log('List successful');
        console.log(vals.length);
        // sorts the array by time_start
        vals.sort((a, b) => a.time_start - b.time_start);
        resp.send({seats: vals});
    }).catch(errorFn);

  }); // end reserve post request

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

  /* server.post('/oldprofile-reservations', async function(req, resp) {  
    console.log('Profile reservations request received');

    const page = Math.max(1, Number(req.body.page));
    const pageSize = 3;
    const tierFilters = req.body.tier_nums ? req.body.tier_nums.map(Number) : [1, 2, 3];

    let combinedReservations = [];
    let totalReservations = 0;

    const tiers = [tier1_schedModel, tier2_schedModel, tier3_schedModel];
    let tierCounts = {1: 0, 2: 0, 3: 0};

    for (let tierIndex = 0; tierIndex < tiers.length; tierIndex++) {
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
  }); */

  // Profile reservations post request based on reservation_id
  server.post('/profile-reservations', async function(req, resp) { 
    console.log('Profile reservations request received');
    console.log(req.body);
    if (req.body.logged == 'false') {
      resp.redirect('/');
    } else {

      const tierFilters = req.body.tier_nums ? req.body.tier_nums.map(Number) : [1, 2, 3];

      let combinedReservations = [];
      let totalReservations = 0;

      const tiers = [tier1_schedModel, tier2_schedModel, tier3_schedModel];
      let tierCounts = {1: 0, 2: 0, 3: 0};

      // assuming user exists since logged in
      // (1) find the user_reservation document given the username
      // (1.1) find the _id of the user in the user_info collection (Model: userModel)
      const user = await userModel.findOne({ username: req.body.user_name }).lean();
      const user_id = user._id;
      

      for (let tierIndex = 0; tierIndex < tiers.length; tierIndex++) {
        if (!tierFilters.includes(tierIndex + 1)) continue;

        let tierModel = tiers[tierIndex];
        // (1.2) find all the reservations given user_id and tier in the user_reservation collection (Model: userReservationModel) where the user is the reserver
        // the user is the reserver in this case
        let reservation_ids = [];
        let reserver_user_reservation = await userReservationModel.find({ reserver: user_id, tier: tierIndex + 1 }).lean();
        for (let i = 0; i < reserver_user_reservation.length; i++) {  // pushed all the reservation_ids of the user
          reservation_ids.push(reserver_user_reservation[i]._id);
        }

        // (1.3) find all the reservations associated with the user (i.e. as a reserved_for) in the userResevationsModel using the req.session.user._id linked from user
        // find all user_reservations where the user._id is the reserved_for
        let reserved_for_user_reservation = await userReservationModel.find({ reserved_for: user_id, tier: tierIndex + 1 }).lean();
        for (let i = 0; i < reserved_for_user_reservation.length; i++) {  // pushed all the reservation_ids of the user
          reservation_ids.push(reserved_for_user_reservation[i]._id);
        }

        // converts all the reservation_ids to string
        reservation_ids = reservation_ids.map(reservation_id => String(reservation_id));

        // get unique _id of the reservations by comparing by objectID strings (since new ObjectID is a different instance)
        reservation_ids = [...new Set(reservation_ids)];

        //reservation_ids = [...new Set(reservation_ids)];

        console.log("Reservation IDs:", reservation_ids);

        /* // create an array element to the user_reservation structure being the reservations associated with the user
        let associated_user_reservations = await tierModel.find({ assigned_to: req.session.user.username }).lean();
        // get unique _id of the reservations
        let associated_reservation_ids = [...new Set(associated_user_reservations.map(reservation => reservation.reservation_id))];
        // combine the reservation_ids and associated_reservation_ids
        reservation_ids = reservation_ids.concat(associated_reservation_ids);
        // get unique _id of the overall reservation_ids
        reservation_ids = [...new Set(reservation_ids)]; */

        // (2) create an array of reservations (tierModel) from the user_reservation document using reservation._id
        // (2.1) find all the reservations given reservation_id in the tier collection
        // create an array element to the user_reservation structure being the reservations given reservation_id
        /* let reservations = await Promise.all(user_reservation.map(async reservation => {
            const reservation_id = reservation._id;
            let tempfind = await tierModel.find({ reservation_id: reservation_id }).lean();
            // sort the reservations by time_start
            tempfind.sort((a, b) => a.time_start - b.time_start);
            return tempfind;
        })); */
        let reservations = [];
        for (let i = 0; i < reservation_ids.length; i++) {
            const reservation_id = reservation_ids[i];
            let tempfind = await tierModel.find({ reservation_id: reservation_id }).lean();
            tempfind.sort((a, b) => a.time_start - b.time_start);
            reservations.push(tempfind);
        }

        // sort reservations by time_start of the first reservation (not yet implemented(unsure))


        const reservationsWithTier = reservations.map(reservation => ({
            ...reservation,
            tier: tierIndex + 1
        }));
        combinedReservations.push(...reservationsWithTier);
        tierCounts[tierIndex + 1] = reservationsWithTier.length;
        totalReservations += reservationsWithTier.length;
      }

      console.log("Tier Counts:", tierCounts);

      resp.send({
          reservations: combinedReservations,
          total: totalReservations,
      });
    }
  });

  // Profile walk-in reservations post request based on reservation_id to show all walk-in reservations
  server.post('/profile-walkin-reservations', async function(req, resp) { 
    console.log('Profile walk-in reservations request received');
    console.log(req.body);
    if (req.body.logged == 'false' && req.session && req.session.user) {
      resp.redirect('/');
    } else {

      const tierFilters = req.body.tier_nums ? req.body.tier_nums.map(Number) : [1, 2, 3];

      let combinedReservations = [];
      let totalReservations = 0;

      const tiers = [tier1_schedModel, tier2_schedModel, tier3_schedModel];
      let tierCounts = {1: 0, 2: 0, 3: 0};

      let searchQuery = {
        email: 'walk-in'
      };

      for (let tierIndex = 0; tierIndex < tiers.length; tierIndex++) {
        if (!tierFilters.includes(tierIndex + 1)) continue;

        let tierModel = tiers[tierIndex];

        // (1) find all the walk-in reservations in the tier collections (Model: tier1_schedModel, tier2_schedModel, tier3_schedModel)
        const allReservations = await tierModel.find(searchQuery).lean();

        // (2) make an array of unique reservation_id from allReservations
        const reservationIds = [...new Set(allReservations.map(reservation => reservation.reservation_id))];

        // (3) find all user_reservation documents given reservation_id in the user_reservation collection (Model: userReservationModel)
        const user_reservation = await userReservationModel.find({ _id: { $in: reservationIds } }).lean();

        // (4) create an array of reservations (tierModel) from the user_reservation document using reservation._id (including reserver information)
        let reservations = [];
        for (let i = 0; i < user_reservation.length; i++) {
            const reservation_id = user_reservation[i]._id;
            let user_reserver = await userModel.findOne({ _id: user_reservation[i].reserver }).lean();
            let reserver_username = user_reserver.username;
            let reserver_email = user_reserver.email;

            let tempfind = await tierModel.find({ reservation_id: reservation_id }).lean();

            tempfind.sort((a, b) => a.time_start - b.time_start);

            // add reserver information to each reservation
            tempfind = tempfind.map(reservation => ({
              ...reservation,
              reserver_username: reserver_username,
              reserver_email: reserver_email
            }));
            
            reservations.push(tempfind);
        }

        // sort reservations by time_start of the first reservation (not yet implemented(unsure))


        const reservationsWithTier = reservations.map(reservation => ({
            ...reservation,
            tier: tierIndex + 1
        }));
        combinedReservations.push(...reservationsWithTier);
        tierCounts[tierIndex + 1] = reservationsWithTier.length;
        totalReservations += reservationsWithTier.length;
      }

      console.log("Tier Counts:", tierCounts);

      resp.send({
          reservations: combinedReservations,
          total: totalReservations,
      });
    }
  });

  server.post('/update-profile', upload.fields([{ name: 'profileImage' }, { name: 'coverImage' }]), async (req, res) => {
    const { username, displayName, bio } = req.body;

    let updateData = {
        display: displayName,
        bio_msg: bio
    };

    if (req.files['profileImage'] && req.files['profileImage'][0]) {
        updateData.img_url = '/uploads/' + req.files['profileImage'][0].filename;
    }
    if (req.files['coverImage'] && req.files['coverImage'][0]) {
        updateData.banner_url = '/uploads/' + req.files['coverImage'][0].filename;
    }

    try {
        const doc = await userModel.findOneAndUpdate(
            { username: username },
            { $set: updateData },
            { new: true }
        );

        if (doc) {
            res.send({ message: 'Profile updated successfully', user: doc });
        } else {
            res.status(404).send({ message: 'User not found' });
        }
    } catch (err) {
        console.error("Error updating profile", err);
        res.status(500).send({ message: 'Error updating profile', error: err });
    }
});




  server.post('/manageable-check', function(req, resp) {// need change to real-time
    console.log('Manage post request received');

    let tierModel;
    switch(Number(req.body.tier_num)) {
        case 0: tierModel = null; break;
        case 1: tierModel = tier1_schedModel; break;
        case 2: tierModel = tier2_schedModel; break;
        case 3: tierModel = tier3_schedModel; break;
    }

    console.log("Searching for Tier"+req.body.tier_num+": "+ JSON.stringify(req.body));

    //change searchQuery based on mode: "days", "taken_false", "taken_true"
    let searchQuery;
    switch(req.body.mode){
      
      //this is for hasReservations_atDayX() in manage.js
      case "find_timeslot": searchQuery = {
        seats: Number(req.body.seat_num),
        assigned_to: String(req.body.user_name),
        time_start: String(req.body.time_start),
        //taken: true, //this is for customers lang naman
        year: Number(req.body.year_num),
        month: Number(req.body.month_num),
        day: Number(req.body.day_num)
      }; findAll = false; break;
    }

    tierModel.findOne(searchQuery).lean().then(function(vals){
      console.log('Timeslot found for manage page');
      resp.send({seat: vals});
    }).catch(errorFn);

  });

  server.post('/test', function(req, resp) {
    console.log('Test post request received');
    tier1_schedModel.create({seats: 1,
      reservation_id: null, //objectID type
      cancelled_by: null,
      time_start: 0,
      time_end: 30,
      assigned_to: "",
      email: "walk-in",
      taken: true,
      month: 1,
      day: 1,
      year: 2020});
  });

  function deleteReservation(req,resp) {
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

    // Get tier model for the respective tier collection
    let tierModel;
    switch(Number(selectedTier)) {
        case 1: tierModel = tier1_schedModel; break;
        case 2: tierModel = tier2_schedModel; break;
        case 3: tierModel = tier3_schedModel; break;
    }

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
          console.log("In deleteReservation - " + message);
          reserve_failed(resp,"Deletion Failed",message);
      } else {
        console.log('User found');
        console.log(user_data);
        let reserver = user_data._id;
        // step 2: check if the selected slots are unavailable
        tierModel.find({
          seats: seat,
          day: day,
          year: year,
          month: month,
          taken: true,
          cancelled_by: null,
          time_start: { $in: timeArray }
        }).lean().then(function(reservations) {
          if (reservations.length != timeArray.length) {
            let message = 'Selected slots are not unavailable';
            console.log("In deleteReservation - " + message + " - " + reservations.length + " != " + timeArray.length);
            reserve_failed(resp,"Deletion Failed",message);
          } else {
            // step 3: cancel reservation document

            let updateQuery = {
              seats: seat,
              day: day,
              year: year,
              month: month,
              taken: true,
              cancelled_by: null,
              time_start: { $in: timeArray }
            };

            let updateValues = {
              $set: {
                cancelled_by: reserver,
              }
            };

            tierModel.updateMany(updateQuery, updateValues).then(function(reservations) {
              //create new documents for the cancelled slots
              let newReserveInstances = timeArray.map(time_start => {
              let endTime = time_start % 100 === 0 ? time_start + 30 : time_start + 70;
              return {
                  seats: seat,
                  reservation_id: null, //objectID type
                  cancelled_by: null,
                  time_start: time_start,
                  time_end: endTime,
                  assigned_to: null,
                  email: null,
                  taken: false,
                  month: month,
                  day: day,
                  year: year
                  };
              });
              
              tierModel.insertMany(newReserveInstances).then(() => {
                  console.log('New reservations created successfully');
                  reserve_success(resp,"Deletion Successful","");
              }).catch(errorFn);
              
            }).catch(errorFn);
          }
        }).catch(errorFn);
      }
    }).catch(errorFn);
  }

  function editReservation(req,resp) {
    const selectedTier = req.body.selectedTier;
    const selectedDay = req.body.selectedDay; // in the form of "2024-03-09"
    let time = req.body.time.trim();  // in the form of "02:00 02:30 08:30"
    const seat = req.body.seat;
    let name = req.body.name;
    let email = req.body.email;
    const isManager = req.body.reserveManager == 'true';
    const reserverName = req.body.reserverName; //not needed
    const reserverEmail = req.body.reserverEmail; // not needed

    if (!isManager) { // bad request resp
      let message = 'Invalid Request';
      console.log("In editReservation() - " + message);
      reserve_failed(resp,"Edit Failed",message);
    }

    const hour = Number(time.split(':')[0]);
    const minute = Number(time.split(':')[1]);
    time = hour * 100 + minute;

    // show all variables
    console.log("Selected Tier: "+selectedTier);
    console.log("Selected Day: "+selectedDay);
    // day month year
    console.log("day: " + Number(selectedDay.split('-')[2]));
    console.log("month: " + Number(selectedDay.split('-')[1]));
    console.log("year: " + Number(selectedDay.split('-')[0]));
    console.log("Time: "+time);
    console.log("Seat: "+seat);
    console.log("Name: "+name);
    console.log("Email: "+email);
    console.log("Is Manager: "+isManager);


    let searchQuery = {
      seats: seat,
      day: Number(selectedDay.split('-')[2]),
      year: Number(selectedDay.split('-')[0]),
      month: Number(selectedDay.split('-')[1]),
      taken: true,
      cancelled_by: null,
      time_start: time,
      assigned_to: name,
      email: email
    }

    console.log("Searching for Tier"+selectedTier+": "+ JSON.stringify(searchQuery));

    // select tier model
    let tierModel;
    switch(Number(selectedTier)) {
      case 1: tierModel = tier1_schedModel; break;
      case 2: tierModel = tier2_schedModel; break;
      case 3: tierModel = tier3_schedModel; break;
    }

    // getting reservation_id
    tierModel.findOne(searchQuery).lean().then(async function(reservation) {
      if (reservation == null) {
        let message = 'Reservation not found';
        console.log("In editReservation() - " + message);
        reserve_failed(resp,"Edit Failed",message);
      } else {
        let reservation_id = reservation.reservation_id;
        console.log('Reservation found');
        console.log(reservation);
        // find reservation_id given the information
        let respdata = await manageReservation(reservation_id,resp);
        renderManage(resp,respdata);
      }
    }).catch(errorFn);

    
  }

  // server post request for manage
  server.post('/edit-reservation', function(req, resp) {
    const isEdit = req.body.submitType == 'edit';
    if (isEdit) {
      editReservation(req,resp);
    }
  });

  server.post('/search-slots-request', function(req, resp) {

    console.log('--- search post request received ---');
    let searchResults = [];
    let tierModel;

    //if manager, get all slots given parameters
    //if user, get all available (taken: false) slots given parameters

    let searchQuery = {};

    //if seat is != 'none', add seat to searchQuery
    if (req.body.seats != 'none') searchQuery.seats = Number(req.body.seats);
    
    //if date is != 'none', add date to searchQuery
    if (req.body.date != 'none') {
      searchQuery.day = Number(req.body.date.split('-')[2]), //day has to add one since in function it is subtracted by 1
      searchQuery.year = Number(req.body.date.split('-')[0]),
      searchQuery.month = Number(req.body.date.split('-')[1])
    }

    //if time_start is != 'none', add time_start to searchQuery
    if (req.body.time_start != 'none') searchQuery.time_start = Number(req.body.time_start);

    //if isManager is false, then only include the available seats
    if (req.body.isManager == 'false') {
      searchQuery.taken = false;
    }
    
    console.log(searchQuery);

    if (req.body.tier == 'none') {
      let promises = [];

      for(let i = 1; i <= 3; i++) {
        switch(i) {
          case 1: tierModel = tier1_schedModel; break;
          case 2: tierModel = tier2_schedModel; break;
          case 3: tierModel = tier3_schedModel; break;
        }

        //append the results of each tier to the searchResults array
        let promise = tierModel.find(searchQuery).lean().then(function(vals){
          console.log('List successful');
          console.log(vals.length);
          vals = vals.map(slot => {
            slot.tier = i;
            return slot;
          });
          //return the promised vals to the promise of specific tier
          return vals;
        }).catch(errorFn);

        //add the promise to the promises array so eventually promises array would have to wait for all promises to complete.
        promises.push(promise);
      }

      Promise.all(promises).then(function(allVals) {
        allVals.forEach(val => {
          searchResults = searchResults.concat(val);
        });
        console.log("Search results:", searchResults[0]);
        console.log("Search results:", searchResults[1]);
        console.log("Search results:", searchResults[2]);
        console.log("Search results length:" + searchResults.length);

        resp.send({slots: searchResults});
      });
      
    }
    else { // if selected tier is specific
      let number_tier = Number(req.body.tier);

      switch(number_tier) {
        case 1: tierModel = tier1_schedModel; break;
        case 2: tierModel = tier2_schedModel; break;
        case 3: tierModel = tier3_schedModel; break;
      }

      //append the results of each tier to the searchResults array
      tierModel.find(searchQuery).lean().then(function(vals){
        console.log('List successful');
        console.log(vals.length);

        vals = vals.map(slot => {
          slot.tier = number_tier;
          return slot;
        });
        console.log(vals);
        searchResults = searchResults.concat(vals);

        console.log("Search results:" + searchResults);
        console.log("Search results length:" + searchResults.length);
        //send the searchResults array to the client
        resp.send({slots: searchResults});
      }).catch(errorFn);
    }

  });

  // reservation post request (from search) based on reservation_id and tier
  server.post('/add-reservation', async function(req, resp) {
    let reservation_id = req.body.reservation_id;
    let respdata = await manageReservation(reservation_id,resp);
    renderManage(resp,respdata);
  });

  // Reservation Form post request (reserving a slot given variables)
  server.post('/reserve-form', function(req, resp) {
    console.log('--- Reserve form post request received ---');
    const isDelete = req.body.submitType == 'delete';
    
    if (isDelete) {
      deleteReservation(req,resp);
    } else {
      const selectedTier = req.body.selectedTier;
      const selectedDay = req.body.selectedDay; // in the form of "2024-03-09"
      const times = req.body.time.trim();  // in the form of "02:00 02:30 08:30"
      const seat = req.body.seat;
      let name = req.body.name;
      let email = req.body.email;
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
        reserve_failed(resp,"Reservation Failed",message);
      }

      // Get tier model for the respective tier collection
      let tierModel;
      switch(Number(selectedTier)) {
          case 1: tierModel = tier1_schedModel; break;
          case 2: tierModel = tier2_schedModel; break;
          case 3: tierModel = tier3_schedModel; break;
      }

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
            reserve_failed(resp,"Reservation Failed",message);
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
            cancelled_by: null,
            time_start: { $in: timeArray }
          }).lean().then(async function(reservations) {
            if (reservations.length != timeArray.length) {
              let message = 'Selected slots are not available';
              console.log("In server.post('/reserve-form') - " + message);
              reserve_failed(resp,"Reservation Failed",message);
            } else {
              // step 3: create a user_reservation document (if email is an empty string, then walk_in is TRUE), and get the _id of the user_reservation
              const walk_in = email == '';

              let reserved_for = null
              if (!walk_in) {
                const reserved_for_user = await userModel.findOne({ username: name, email: email }).lean();
                reserved_for = reserved_for_user._id;
              }
              
              let userReservation = {
                  reserve_time: new Date(),
                  tier: selectedTier,
                  reserver: reserver,
                  walk_in: walk_in,
                  slots: timeArray.length,
                  reserved_for: reserved_for
              };

              // step 4: if not walk-in, check if the reservation user exists (name and email)
              let user_data;
              if (!walk_in) {
                user_data = await userModel.findOne({ username: name, email: email }).lean();
                if (user_data == null) {
                    let message = 'Reservation user not found';
                    console.log("In server.post('/reserve-form') - " + message);
                    reserve_failed(resp,"Reservation Failed",message);
                } else {
                    console.log('Reservation user found');
                    console.log(user_data);
                }
              }

              if ((user_data == null && walk_in) || (user_data != null && !walk_in)) {
                userReservationModel.create(userReservation).then(function(user_reservation) {
                  console.log('User reservation created');
                  console.log(user_reservation);

                  // step 5: reserve the selected slots (editing the documents)
                  let reservation_id = user_reservation._id;

                  let updateQuery = {
                    seats: seat,
                    time_start: { $in: timeArray },
                    cancelled_by: null,
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
                      taken: true,
                      assigned_to: name,
                      email: email
                    }
                  };

                  tierModel.updateMany(updateQuery, updateValues).then(function(reservations) {
                    console.log('Reservation successful');
                    reserve_success(resp,"Reservation Successful","Your reservation ID is: " + String(reservation_id));
                  }).catch(errorFn);

                }).catch(errorFn);
              }
            }
          }).catch(errorFn);
        }
      }).catch(errorFn);
    }

  });

  function reserve_failed(resp,failed,message){
    resp.render('reserve_fail',{
      layout: 'index',
      title: 'TechLite - '+failed,
      failed: failed,
      message: message
    });
  }

  function reserve_success(resp,success,message){
    resp.render('reserve_success',{
      layout: 'index',
      title: 'TechLite - '+ success,
      success: success,
      message: message
    });
  }

  async function manageReservation(reservation_id,resp) {
    console.log('Manage reservation post request received');
    console.log("reservation_id: " + reservation_id);
    let respdata = {};

    // step 1(1): find the user_reservation document given the reservation_id (Model: userReservationModel)
    respdata = await userReservationModel.findOne({ _id: reservation_id }).lean().then(async function(user_reservation) {
      console.log('User reservation found');
      console.log(user_reservation);
      let tier = user_reservation.tier;

      // step 1(2): get user information from the user_info collection (Model: userModel)
      return await userModel.findOne({ _id: user_reservation.reserver }).lean().then(async function(user) {
        console.log('User found');
        console.log(user);
        let isManager = user.is_manager;
        let reserver = user.username;
        let reserver_email = user.email;

        // step 2: find all the reservations given reservation_id in the tier collection (Model: tier1_schedModel, tier2_schedModel, tier3_schedModel)
        let tierModel;
        switch(tier) {
          case 1: tierModel = tier1_schedModel; break;
          case 2: tierModel = tier2_schedModel; break;
          case 3: tierModel = tier3_schedModel; break;
        }

        return await tierModel.find({ reservation_id: reservation_id }).lean().then(function(reservations) {
          console.log('Reservations found');
          console.log(reservations);
          let date = reservations[0].month + '/' + reservations[0].day + '/' + reservations[0].year;
          // if reserver and reserver_email is null, it means the account is deleted
          if (!reserver || !reserver_email) {
            reserver = '**Deleted**';
            reserver_email = '**Deleted**';
          }
          respdata = {
            reservation_id: reservation_id,
            reserver: reserver,
            reserver_email: reserver_email,
            username: reservations[0].assigned_to,
            email: reservations[0].email,
            isManager: isManager,
            date: date,
            tier: tier,
            layout: 'index',
            title: 'TechLite - Manage Reservations'
          };

          return respdata;
        }).catch(errorFn);
      }).catch(errorFn);
    }).catch(errorFn);
    
    return respdata;
  }

  function renderManage(resp,respdata) {
    resp.render('manage',respdata);
  }

  // Manage reservation post request based on reservation_id
  server.post('/manage-reservation', async function(req, resp) {
    let reservation_id = req.body.reservation_id;
    let respdata = await manageReservation(reservation_id,resp);
    renderManage(resp,respdata);
  });

  server.post('/manage-prompt', function(req, resp) {
    
    console.log('Manage reservation post request received');
    reservation_id = req.body.reservation_id;
    console.log("reservation_id: " + reservation_id);

    // step 1(1): find the user_reservation document given the reservation_id (Model: userReservationModel)
    let user_reservation = userReservationModel.findOne({ _id: reservation_id }).lean().then(function(user_reservation) {
      console.log('User reservation found');
      console.log(user_reservation);
      let tier = user_reservation.tier;

      // step 1(2): get user information from the user_info collection (Model: userModel)
      userModel.findOne({ _id: user_reservation.reserver }).lean().then(function(user) {
        console.log('User found');
        console.log(user);
        let reserver = user.username;
        let reserver_email = user.email;

        // step 2: find all the reservations given reservation_id in the tier collection (Model: tier1_schedModel, tier2_schedModel, tier3_schedModel)
        let tierModel;
        switch(tier) {
          case 1: tierModel = tier1_schedModel; break;
          case 2: tierModel = tier2_schedModel; break;
          case 3: tierModel = tier3_schedModel; break;
        }

        tierModel.find({ reservation_id: reservation_id }).lean().then(function(reservations) {
          console.log('Reservations found');
          console.log(reservations);
          resp.send({ user_reservation: user_reservation, reserver: reserver, reserver_email: reserver_email, reservations: reservations });
          resp.render('manage',{
            layout: 'index',
            title: 'TechLite - Manage Reservations',
            
          });
        }).catch(errorFn);

      }).catch(errorFn);
    }).catch(errorFn);

    // step 1(2): get user information from the user_info collection (Model: userModel)
    // step 2: find all the reservations given reservation_id in the tier collection (Model: tier1_schedModel, tier2_schedModel, tier3_schedModel)
    
  });

  // ajax post request of obtain-reservations given reservation_id
  server.post('/obtain-reservations', function(req, resp) {
    console.log('Obtain reservations post request received');

    const reservation_id = req.body.reservation_id;
    console.log("reservation_id: " + reservation_id);

    // get tier model
    const tier = Number(req.body.tier);
    console.log("tier: " + tier);
    let tierModel;
    switch(tier) {
      case 1: tierModel = tier1_schedModel; break;
      case 2: tierModel = tier2_schedModel; break;
      case 3: tierModel = tier3_schedModel; break;
    }

    if (tier != 0) {
      // find all reservation instance in the tier model given the reservation_id
      tierModel.find({ reservation_id: reservation_id }).lean().then(function(reservations) {
        if (reservations.length == 0) {
          console.log('No reservations found');
          resp.send({ reservations: [] });
        } else {
          console.log('Reservations found');
          // sort reservations in ascending order of time_start
          reservations.sort((a, b) => a.time_start - b.time_start);

          console.log(reservations);

          resp.send({ reservations: reservations });
        }
      }).catch(errorFn);
    } else {
      resp.redirect('/');
    }

  });

  function manageResponse(resp,heading,message){
    resp.render('manage_response',{
      layout: 'index',
      title: 'TechLite - '+ heading,
      heading: heading,
      message: message
    });
  }

  // manage and editing the reservations (update)
  server.post('/update-reservation', function(req, resp) {
    const reservation_id = req.body.reservationId;
    const selectedTier = Number(req.body.tier);
    const selectedDay = req.body.date; // in the form of "MM/DD/YYYY"
    const times = req.body.userSelectedTime.trim();  // in the form of "02:00 02:30 08:30"
    const newTimes = req.body.userNewTime.trim();  // in the form of "02:00 02:30 08:30"
    const seat = req.body.seat;
    const name = req.body.userName;
    const email = req.body.userEmail;
    const isManager = req.body.manager == 'true';
    const reserverName = req.body.canceller;
    const reserverEmail = req.body.cancellerEmail;
    
    const year = Number(selectedDay.split('/')[2]);
    const month = Number(selectedDay.split('/')[0]);
    const day = Number(selectedDay.split('/')[1]);

    // Get array of time in military time in the form of "0200 0230 0830"
    const timeArray = times.split(' ').map(time => {
        const hour = Number(time.split(':')[0]);
        const minute = Number(time.split(':')[1]);
        return hour * 100 + minute;
    });

    const newTimeArray = newTimes.split(' ').map(time => {
        const hour = Number(time.split(':')[0]);
        const minute = Number(time.split(':')[1]);
        return hour * 100 + minute;
    });

    // Get tier model for the respective tier collection
    let tierModel;
    switch(Number(selectedTier)) {
        case 1: tierModel = tier1_schedModel; break;
        case 2: tierModel = tier2_schedModel; break;
        case 3: tierModel = tier3_schedModel; break;
    }

    //display all constants
    console.log("Selected Tier: "+selectedTier);
    console.log("Selected Day: "+selectedDay);
    console.log("Times: "+times);
    console.log("New Times: "+newTimes);
    console.log("Seat: "+seat);
    console.log("Name: "+name);
    console.log("Email: "+email);
    console.log("Is Manager: "+isManager);
    console.log("Year: "+year);
    console.log("Month: "+month);
    console.log("Day: "+day);
    console.log("Time Array: "+timeArray);
    console.log("New Time Array: "+newTimeArray);

    // step 1: check if user (the reserver) exists (name and email) and obtain the _id of the user document
    // step 1: check if the new selected slots are available
    tierModel.find({
      seats: seat,
      day: day,
      year: year,
      month: month,
      taken: false,
      cancelled_by: null,
      time_start: { $in: newTimeArray }
    }).lean().then(function(reservations) {
      if (reservations.length != newTimeArray.length) {
        let message = 'New selected slots are not available';
        console.log("In update-reservation - " + message);
        manageResponse(resp,"Update Failed",message);
      } else {
        console.log('New reservations found available');
        console.log(reservations);

        // step 2: check if the selected slots are unavailable
        tierModel.find({
          seats: seat,
          day: day,
          year: year,
          month: month,
          taken: true,
          cancelled_by: null,
          time_start: { $in: timeArray }
        }).lean().then(function(reservations) {
          if (reservations.length != timeArray.length) {
            let message = 'Selected slots are not unavailable';
            console.log("In update-reservation - " + message);
            manageResponse(resp,"Update Failed",message);
          } else {
            // step 3-4: update both reservations documents
            let updateQueryNew = {
              seats: seat,
              day: day,
              year: year,
              month: month,
              taken: false,
              cancelled_by: null,
              time_start: { $in: newTimeArray }
            };
            let updateValuesNew = {
              $set: {
                reservation_id: reservation_id,
                assigned_to: name,
                email: email,
                taken: true,
              }
            };


            let updateQuery = {
              seats: seat,
              day: day,
              year: year,
              month: month,
              taken: true,
              cancelled_by: null,
              time_start: { $in: timeArray }
            };

            let updateValues = {
              $set: {
                reservation_id: null,
                assigned_to: null,
                email: null,
                taken: false,
              }
            };

            // log update queries and values
            console.log("Update Query New: " + JSON.stringify(updateQueryNew));
            console.log("Update Values New: " + JSON.stringify(updateValuesNew));
            console.log("Update Query: " + JSON.stringify(updateQuery));
            console.log("Update Values: " + JSON.stringify(updateValues));

            tierModel.updateMany(updateQueryNew, updateValuesNew).then(function(reservations) {
              console.log('New reservations updated successfully');
              tierModel.updateMany(updateQuery, updateValues).then(function(reservations) {
                console.log('Old reservations updated successfully');
                manageResponse(resp,"Update Successful","");
              }).catch(errorFn);
            }).catch(errorFn);
          }
        }).catch(errorFn);
      }
    }).catch(errorFn);
  });

  // manage and editing the reservations (delete/cancel)
  server.post('/delete-reservation', function(req, resp) {
    const selectedTier = Number(req.body.tier);
    const selectedDay = req.body.date; // in the form of "MM/DD/YYYY"
    const times = req.body.userSelectedTime.trim();  // in the form of "02:00 02:30 08:30"
    const seat = req.body.seat;
    const name = req.body.userName;
    const email = req.body.userEmail;
    const isManager = req.body.manager == 'true';
    const reserverName = req.body.canceller;
    const reserverEmail = req.body.cancellerEmail;
    
    const year = Number(selectedDay.split('/')[2]);
    const month = Number(selectedDay.split('/')[0]);
    const day = Number(selectedDay.split('/')[1]);

    // Get array of time in military time in the form of "0200 0230 0830"
    const timeArray = times.split(' ').map(time => {
        const hour = Number(time.split(':')[0]);
        const minute = Number(time.split(':')[1]);
        return hour * 100 + minute;
    });

    // Get tier model for the respective tier collection
    let tierModel;
    switch(Number(selectedTier)) {
        case 1: tierModel = tier1_schedModel; break;
        case 2: tierModel = tier2_schedModel; break;
        case 3: tierModel = tier3_schedModel; break;
    }

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
          console.log("In deleteReservation - " + message);
          manageResponse(resp,"Deletion Failed",message);
      } else {
        console.log('User found');
        console.log(user_data);
        let reserver = user_data._id;
        // step 2: check if the selected slots are unavailable
        tierModel.find({
          seats: seat,
          day: day,
          year: year,
          month: month,
          taken: true,
          cancelled_by: null,
          time_start: { $in: timeArray }
        }).lean().then(function(reservations) {
          if (reservations.length != timeArray.length) {
            let message = 'Selected slots are not unavailable';
            console.log("In deleteReservation - " + message + " - " + reservations.length + " != " + timeArray.length);
            manageResponse(resp,"Deletion Failed",message);
          } else {
            // step 3: cancel reservation document

            let updateQuery = {
              seats: seat,
              day: day,
              year: year,
              month: month,
              taken: true,
              cancelled_by: null,
              time_start: { $in: timeArray }
            };

            let updateValues = {
              $set: {
                cancelled_by: reserver,
              }
            };

            tierModel.updateMany(updateQuery, updateValues).then(function(reservations) {
              //create new documents for the cancelled slots
              let newReserveInstances = timeArray.map(time_start => {
              let endTime = time_start % 100 === 0 ? time_start + 30 : time_start + 70;
              return {
                  seats: seat,
                  reservation_id: null, //objectID type
                  cancelled_by: null,
                  time_start: time_start,
                  time_end: endTime,
                  assigned_to: null,
                  email: null,
                  taken: false,
                  month: month,
                  day: day,
                  year: year
                  };
              });
              
              tierModel.insertMany(newReserveInstances).then(() => {
                  console.log('New reservations created successfully');
                  manageResponse(resp,"Deletion Successful","");
              }).catch(errorFn);
              
            }).catch(errorFn);
          }
        }).catch(errorFn);
      }
    }).catch(errorFn);
  });

  // view server post request of inactive reservations given reservation_id
  server.post('/view-reservation', async function(req, resp) {
    let respdata = await manageReservation(req.body.reservation_id,resp);
    respdata.layout = 'index';
    respdata.title = 'TechLite - View Reservation';
    console.log("respdata: " + respdata);
    resp.render('view_reservation',respdata);
  });
}


module.exports.add = add;