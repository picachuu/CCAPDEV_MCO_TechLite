function add(server,modules){
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

  // login post request for user log-in, returns user object
  server.post('/login-account', async function(req, resp){  //async function for asynchronous operations
    //Creating a new instance can be made this way.
    const searchQuery = { //searchQuery for username based log-in
      username: req.body.username,
      password: req.body.password
    };
  
    let user = null;  // user object for user information is default to null
  

    user = await checkLoginDB(searchQuery); // wait for the function to finish before proceeding

    let valid = false;
    if (user) {
      valid = true;
    }

    user = {
      _id : user._id,
      username: user.username,
      email: user.email,
      display: user.display,
      is_manager: user.is_manager,
      img_url: user.img_url,
      banner_url: user.banner_url,
      bio_msg: user.bio_msg
    }

    // below is a placeholder
    if (valid){
      req.session.user = user; // session checkpoint, session start
      resp.redirect('/?login=success'); //redirect to home page with success message
    } else {
      resp.redirect('/?login=failed'); //redirect to home page with failure message
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

  async function refreshCredentials(username, email) {
    const searchQuery = { //searchQuery for username based log-in
      username: username,
      email: email
    };

    let user = await userModel.findOne(searchQuery).lean(); // wait for the function to finish before proceeding

    if (user != null){
      console.log('Obtained Username: ' + user.username);
    } else {
      console.log('No User Found');
    }

    return user;
  }

  server.post('/obtain-credentials', async function(req, resp){  //async function for asynchronous operations
    let user = req.session.user;

    if (user) {
      user = await refreshCredentials(user.username, user.email);
    }

    console.log("Obtaining credentials...");
    console.log("User: " + JSON.stringify(user));

    if (user) {
      user = {
        username: user.username,
        email: user.email,
        display: user.display,
        is_manager: user.is_manager,
        img_url: user.img_url,
        banner_url: user.banner_url,
        bio_msg: user.bio_msg
      }
    }

    if (user){
      console.log('Obtained Username: ' + user.username);
    } else {
      console.log('No User Found');
    }

    resp.send({user: user});
  });

  server.post('/log-out', function(req, resp){
    console.log('Logging out...');
    console.log('Session: ' + req.session.user);
    req.session.destroy(function(err) {
      console.log('Session Destroyed');
    });
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

    async function checkLoginUsername(searchQuery) {
        let user = null;

        console.log('Checking Credentials: Username');

        // Search for user with the provided username
        await userModel.findOne({ username: searchQuery.username }).lean().then(async function(user_data){
            if (user_data != null){
                // Compare the provided password with the hashed password in the database
                const match = await bcrypt.compare(searchQuery.password, user_data.password);
                if (match) {
                    // If the passwords match, assign the user data to `user`
                    user = user_data;
                }
            }
        }).catch(errorFn);

        return user;
    }
    
    async function checkLoginEmail(searchQuery) {
        let user = null;

        console.log('Checking Credentials: Email');
        // Search for user with the provided email
        await userModel.findOne({ email: searchQuery.username }).lean().then(async function(user_data){
            if (user_data != null){
                // Compare the provided password with the hashed password in the database
                const match = await bcrypt.compare(searchQuery.password, user_data.password);
                if (match) {
                    // If the passwords match, assign the user data to `user`
                    user = user_data;
                }
            }
        }).catch(errorFn);

        return user;
    }


    async function createUserDB(data) {
        let username = data.username;
        let email = data.email;
        let password = data.password;
        let display = data.display;
        let is_manager = data.is_manager;
        let reason = "Account creation error";
        
        // check if username already exists
        let user_data = await userModel.findOne({username:username}).lean();
        if (user_data != null){
            console.log('Create Account------Username already exists');
            return "Username already exists";
        }
    
        // check if email already exists
        user_data = await userModel.findOne({email:email}).lean();
        if (user_data != null){
            return "Email already exists";
        }
    
        // hash the password
        let encrypted_pass = await new Promise((resolve, reject) => {
            bcrypt.hash(password, saltRounds, function(err, hash) {
                if (err) reject(err);
                else resolve(hash);
            });
        });
    
        // create new user
        let newUser = new userModel({
            username: username,
            email: email,
            display: display,
            password: encrypted_pass,
            is_manager: is_manager
        });
    
        try {
            await newUser.save();
            reason = null;
        } catch (error) {
            errorFn(error);
        }
    
        return reason;
    }

    //test (not used)
  async function createdUserDB(data) {
    let username = data.username;
    let email = data.email;
    let display = data.display;
    let password = data.password;
    let is_manager = data.is_manager;
    let reason = "Account creation error";
    
    // check if username already exists
    await userModel.findOne({username:username}).lean().then(async function(user_data){
      if (user_data != null){
        console.log('Create Account------Username already exists');
        reason = "Username already exists";
      } else {
        // check if email already exists

        await userModel.findOne({email:email}).lean().then(async function(user_data){
          if (user_data != null){
            reason = "Email already exists";
          } else {
            

            let encrypted_pass = "";

            await bcrypt.hash(password, saltRounds, async function(err, hash) {
                encrypted_pass = hash;
                console.log("Password: "+ password);
                console.log("Encrypted pass: "+encrypted_pass);
            
                // create new user
                let newUser = new userModel({
                    username: username,
                    email: email,
                    display: display,
                    password: encrypted_pass,
                    is_manager: is_manager
                });

                console.log('New User: ' + newUser);

                await newUser.save().catch(errorFn);
                reason = null;
            });
          }
        }).catch(errorFn);
      }
    }).catch(errorFn);

    return reason;
  }// not used

  /* let data = {
    username: username,
    email: email,
    display: displayname,
    password: password,
    confirmPassword: confirmPassword,
    is_manager: is_manager
}; */
  // check creation of new account
  server.post('/create-account', async function(req, resp){  //async function for asynchronous operations
    // trim whitespaces in every element in the data object
    let data = req.body;
    data = {
        username: data.username.trim(),
        email: data.email.trim(),
        display: data.display.trim(),
        password: data.password.trim(),
        confirmPassword: data.confirmPassword.trim(),
        is_manager: data.is_manager
    }

    let reason = validateCreateUserDB(data);
    console.log('create-account Reason: ' + reason);
    if (!reason) {
      reason = await createUserDB(data); // wait for the function to finish before proceeding
      console.log('create-account Reason: ' + reason);
      if (!reason) {
        resp.send({valid: true, reason: "Account creation successful"});
      } else {
        resp.send({valid: false, reason: "Error: " + reason});
      }
    } else {

      resp.send({valid: false, reason: "Error: " + reason});
    }
  });

  // returns a string to validate if there is an error in account creation
  function validateCreateUserDB(data) {
    let username = data.username;
    let email = data.email;
    let password = data.password;
    let confirmPassword = data.confirmPassword;

    // Validate form values
    if (username == "" || email == "" || password == "" || confirmPassword == "") {
        return "All fields must be filled out";
    }

    // Username validation
    let usernameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    if (!usernameRegex.test(username)) {
        return "Username must only contain letters, numbers, and underscores, and must start with a letter or underscore.";
    }

    if (password != confirmPassword) {
      return "Passwords do not match";
    }

    // Password validation
    let passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return "Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 numeric, and 1 special character.";
  
    }

    // If all validation passes, return null to allow the form to continue submitting
    return null;  // reason
  }

  //delete-account from profile
  server.post('/delete-account', async function(req, resp){
    let valid = false;
    if (req.session.user.username == req.body.username) {
      //Creating a new instance can be made this way.
      const searchQuery = { //searchQuery for username based log-in
        username: req.body.username,
        password: req.body.password
      };
    
      let user = null;  // user object for user information is default to null
    

      user = await checkLoginDB(searchQuery); // wait for the function to finish before proceeding

      
      if (user) {
        valid = true;
      }


      if (valid){  // if not null, delete the account
        req.session.destroy(function(err) {
          deleteAccountDB(user);
          deleteActiveReservations(user);
          resp.render('account_delete',{
            layout: 'index',
            title: 'TechLite - Delete Account',
            prompt: 'Successful',
            message: 'Your account with TechLite has been successfully deleted. Thanks for having us!'
          });
        });
      }
    } 
    
    if (!valid){
      resp.render('account_delete',{
        layout: 'index',
        title: 'TechLite - Delete Account',
        prompt: 'Failed',
        message: 'Invalid credentials'
      });
    }
    
  });

  async function findusername(user_username) { //async function for asynchronous operations
    userModel.findOne({
      $or: [
        { email: user_username },
        { username: user_username }
      ]
    }).lean().then(function(user_data){

      if (user_data != null){
        console.log('Obtained Username: ' + user_data.username);
      } else {
        console.log('No User Found');
      }
      return user_data;
    });
  }

  server.post('/delete-account-search', async function(req, resp){
  
    let searchQuery = { $or: [
      { username: req.body.username },
      { email: req.body.username }
    ]};

    userModel.findOne(searchQuery).lean().then(function(user) {
      if (user == null) {
        resp.redirect('/search');
        return;
      }
      
        //if account in session is the same as the account to be deleted, destroy the session
        if (req.session.user.username == user.username) {
          req.session.destroy(function(err) {
            deleteAccountDB(user);
            deleteActiveReservations(user);
            resp.render('account_delete',{
              layout: 'index',
              title: 'TechLite - Delete Account',
              prompt: 'Successful',
              message: 'Your account with TechLite has been successfully deleted. Thanks for having us!'
            });
          });
        }

        //if account in session is not the same as the account to be deleted, delete the account without destroying the session
        else {
          deleteAccountDB(user);
          deleteActiveReservations(user);
          resp.redirect('/search');
        }
 
    }).catch(errorFn);
   
  });

  function deleteAccountDB(user) {
    // delete user account from database
    // by making all fields null aside from _id and is_manager
    const user_id = user._id;
      userModel.findOneAndUpdate(
        { _id: user_id }, 
        { $set: 
          { username: null, 
            email: null, 
            display: null, 
            password: null, 
            img_url: null, 
            banner_url: null, 
            bio_msg: null 
          } 
        }
      ).catch(errorFn);
  }

  function deleteActiveReservations(user) {
    /* 
    through all tiers

    User Assigned Reservations (parameters needed):
    find
    - assigned_to = user.username
    - email = user.email
    - taken = true
    - cancelled_by = null

    Then filter by date is greater than datetime now using parameters:
    - year
    - month
    - day
    - time_start (hour, minute)

    User Assigned Reservations Edit
    - cancelled_by = user._id;

    Recreate the slots (paramters needed): From User Assigned Reservations
    - seats
    - time_start (time_end)
    - month
    - day
    - year

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
    }; */
    let setDate = false;
    let dateYear = 2024;
    let dateMonth = 3;
    let dateDay = 9;
    let dateHour = 1;
    let dateMinute = 25;

    function getCurrentDateTime() {
        let currentDate;
        if (setDate) {
            currentDate = new Date(dateYear, dateMonth - 1, dateDay, dateHour, dateMinute);
        } else {
            currentDate = new Date();
        }
        return currentDate;
    }
    const name = user.username;
    const email = user.email;

    for (let i = 1; i <= 3; i++) {
      // Get tier model for the respective tier collection
      let tierModel;
      switch(i) {
          case 1: tierModel = tier1_schedModel; break;
          case 2: tierModel = tier2_schedModel; break;
          case 3: tierModel = tier3_schedModel; break;
      }

      // step 1: get all reservations slots made by the user
      tierModel.find({
        assigned_to: name,
        email: email,
        taken: true,
        cancelled_by: null
      }).lean().then(async function(reservations) {
        // step 2: filter the reservations to only include those that are in the future
        let now = getCurrentDateTime();
        let futureReservations = reservations.filter(reservation => {
          let year = reservation.year;
          let month = reservation.month;
          let day = reservation.day;
          let time_start = reservation.time_start;
          let date = new Date(year, month - 1, day, time_start / 100, time_start % 100);
          return date > now;
        });

        // step 3: cancel the future reservations
        for (let i = 0; i < futureReservations.length; i++) {
          let reservation = futureReservations[i];
          let updateQuery = {
            seats: reservation.seats,
            day: reservation.day,
            year: reservation.year,
            month: reservation.month,
            taken: true,
            cancelled_by: null,
            time_start: reservation.time_start
          };

          let updateValues = {
            $set: {
              cancelled_by: user._id,
            }
          };

          // cancel the reservation
          await tierModel.updateOne(updateQuery, updateValues).then(function(reservation) {
            console.log('Reservation cancelled successfully');
          }).catch(errorFn);

          // step 4: create new documents for the cancelled slots
          let newReserveInstance = {
            seats: reservation.seats,
            reservation_id: null, //objectID type
            cancelled_by: null,
            time_start: reservation.time_start,
            time_end: reservation.time_end,
            assigned_to: null,
            email: null,
            taken: false,
            month: reservation.month,
            day: reservation.day,
            year: reservation.year
          };

          await tierModel.create(newReserveInstance).then(function() {
            console.log('New reservation created successfully');
          }).catch(errorFn);
        }
      }).catch(errorFn);
    }
  }


  server.post('/change-password', async function(req, resp) {
    console.log('Changing password...');

    const username = req.session.user.username;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
      return resp.send({valid: false, reason: "New passwords do not match."});
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return resp.send({
        valid: false,
        reason: "Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 numeric, and 1 special character."
      });
    }

    try {
      const user = await userModel.findOne({ username: username }).lean();

      if (!user) {
        console.log(`No user found with username: ${username}`);
        return resp.send({ valid: false, reason: "User not found." });
      }

      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) {
        console.log('Current password is incorrect.');
        return resp.send({ valid: false, reason: "Current password is incorrect." });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      await userModel.updateOne({ username: username }, { $set: { password: hashedNewPassword } });
      
      console.log('Password updated successfully for user:', username);
      resp.send({ valid: true, reason: "Password changed successfully." });

    } catch (error) {
      console.error("Error in changing password:", error);
      resp.send({ valid: false, reason: "An error occurred while changing the password." });
    }
  });

  // post request for toggle-role
  server.post('/toggle-role', function(req, resp) {
    // elements passed: username
    let searchQuery = { $or: [
      { username: req.body.username },
      { email: req.body.username }
    ]};

    userModel.findOne(searchQuery).lean().then(function(user) {
      if (user == null) {
        resp.redirect('/search');
        return;
      }
      let useris_manager = user.is_manager;
      userModel.updateOne( searchQuery, { is_manager: !useris_manager }).then(function() {
        console.log('Role toggled');
        // redirect to search
        resp.redirect('/search');
      }).catch(errorFn);
    }).catch(errorFn);

  });

}

module.exports.add = add;