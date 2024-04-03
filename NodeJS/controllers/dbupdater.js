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


    /* function checkDateTime() {
        const currentDateTime = new Date();
        console.log('Current date and time:', currentDateTime);
    
        // Check if current date and time meets certain condition
        if (currentDateTime.getHours() === 12 && currentDateTime.getMinutes() === 0) {
            console.log('It is noon!');
            // Execute your code here
        }
    }
    
    // Call checkDateTime every minute (60000 milliseconds)
    setInterval(checkDateTime, 60000); */
  
  }
  
  module.exports.add = add;