const mongoose = require('mongoose');

const dbmodel = require('../models/dbmodel');
// const tier1_schedModel = dbmodel.tier1_schedModel;
// const tier2_schedModel = dbmodel.tier2_schedModel;
// const tier3_schedModel = dbmodel.tier3_schedModel;
const userModel = dbmodel.userModel;
// const seatModel = dbmodel.seatModel;
const db_url = dbmodel.db_url;
const databaseName = dbmodel.databaseName;
const errorFn = dbmodel.errorFn;
const successFn = dbmodel.successFn;

let username = null;
let email = null;
let logged_status = false;
let display = null;
let is_manager = null;
let img_url = null;
let banner_url = null;
let bio_msg = null;

mongoose.connect(db_url+databaseName);

function add(server,bcrypt,saltRounds){

  // login post request for user log-in, returns user object
  server.post('/login-account', async function(req, resp){  //async function for asynchronous operations
    //Creating a new instance can be made this way.
    const searchQuery = { //searchQuery for username based log-in
      username: req.body.username,
      password: req.body.password
    };
  
    let user = null;  // user object for user information is default to null
  

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
      logged_status = true;
      username = user.username;
      email = user.email;
      display = user.display;
      is_manager = user.is_manager;
      img_url = user.img_url;
      banner_url = user.banner_url;
      bio_msg = user.bio_msg;
    } else {
      logged_status = false;
    }

    resp.send({valid: valid});
  });

  server.post('/obtain-credentials', async function(req, resp){  //async function for asynchronous operations
    let user = null;

    console.log("Obtaining credentials...");
    console.log("Logged Status: " + logged_status);
    console.log("Username: " + username);
    console.log("Email: " + email);
    console.log("Display: " + display);
    console.log("Is_Manager: " + is_manager);

    if (logged_status) {
      user = {
        username: username,
        email: email,
        display: display,
        is_manager: is_manager,
        img_url: img_url,
        banner_url: banner_url,
        bio_msg: bio_msg
      }
    } else {
      username = null;
      email = null;
      display = null;
      is_manager = null;
      img_url = null;
      banner_url = null;
      bio_msg = null;
    }

    if (user){
      console.log('Obtained Username: ' + user.username);
    } else {
      console.log('No User Found');
    }

    resp.send({logged: logged_status, user: user});
  });

  server.post('/log-out', async function(req, resp){
    // set all user credentials to null
    console.log('Logging out...');
    logged_status = false;
    username = null;
    email = null;
    display = null;
    is_manager = null;
    img_url = null;
    banner_url = null;
    bio_msg = null;

    console.log('Logged Status: ' + logged_status);
    
    

    if (logged_status){
      resp.redirect('/?success=false');
    } else {
      resp.redirect('/?success=true');
    }
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
//   async function createdUserDB(data) {
//     let username = data.username;
//     let email = data.email;
//     let display = data.display;
//     let password = data.password;
//     let is_manager = data.is_manager;
//     let reason = "Account creation error";
    
//     // check if username already exists
//     await userModel.findOne({username:username}).lean().then(async function(user_data){
//       if (user_data != null){
//         console.log('Create Account------Username already exists');
//         reason = "Username already exists";
//       } else {
//         // check if email already exists

//         await userModel.findOne({email:email}).lean().then(async function(user_data){
//           if (user_data != null){
//             reason = "Email already exists";
//           } else {
            

//             let encrypted_pass = "";

//             await bcrypt.hash(password, saltRounds, async function(err, hash) {
//                 encrypted_pass = hash;
//                 console.log("Password: "+ password);
//                 console.log("Encrypted pass: "+encrypted_pass);
            
//                 // create new user
//                 let newUser = new userModel({
//                     username: username,
//                     email: email,
//                     display: display,
//                     password: encrypted_pass,
//                     is_manager: is_manager
//                 });

//                 console.log('New User: ' + newUser);

//                 await newUser.save().catch(errorFn);
//                 reason = null;
//             });
//           }
//         }).catch(errorFn);
//       }
//     }).catch(errorFn);

//     return reason;
//   }// not used

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

}


module.exports.add = add;