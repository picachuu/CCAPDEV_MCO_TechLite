//These are some reusable functions used through-out the whole
//project.
function errorFn(err){
    console.log('Error found. Please trace!');
    console.error(err);
}

function successFn(res){
    console.log('Database query successful!');
}


//Note on the database URL. There are times that localhost is not
//recogized by the system. In that case, use 127.0.0.1 instead.

const databaseName = "Techlite";
const tier1_schedCollection = "tier1_sched";
const tier2_schedCollection = "tier2_sched";
const tier3_schedCollection = "tier3_sched";
const userInfoCollection = "user_info";
const seatCollection = "seat";
const db_url = "mongodb://127.0.0.1:27017/";


//Require a MongoDB connection using mongoose. Include the mongoose library
//and feed it the correct url to run MongoDB.
//URL is the database it connects to.
const mongoose = require('mongoose');
// mongoose.connect(db_url+databaseName);

// user-infos collection (contains user information)
const userSchema = new mongoose.Schema({
    username: { type: String },
    email: { type: String },
    display: { type: String, default: ""},
    password: { type: String },
    is_manager: { type: Boolean },
    img_url: { type: String, default: ""},
    banner_url: { type: String, default: ""},
    bio_msg: { type: String, default: ""}
  },{ versionKey: false });

const userModel = mongoose.model(userInfoCollection, userSchema);

// Schema for Schedules of different tier levels
const scheduleSchema = new mongoose.Schema({
    seats: { type: BigInt },
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
const tier1_schedModel = mongoose.model(tier1_schedCollection, scheduleSchema);
// tier2_scheds collection (contains schedule for tier 2 seats)
const tier2_schedModel = mongoose.model(tier2_schedCollection, scheduleSchema);
// tier3_scheds collection (contains schedule for tier 3 seats)
const tier3_schedModel = mongoose.model(tier3_schedCollection, scheduleSchema);

// seats collection (contains seat information)
const seatSchema = new mongoose.Schema({
    seats: { type: BigInt },
    tier: { type: BigInt }
  },{ versionKey: false });
  
const seatModel = mongoose.model(seatCollection, seatSchema);



//to be used in controller
module.exports.db_url = db_url; 
module.exports.databaseName = databaseName; 
module.exports.errorFn = errorFn; 
module.exports.successFn = successFn; 
// module.exports.tier1_schedCollection = tier1_schedCollection; 
// module.exports.userInfoCollection = userInfoCollection; 
// module.exports.seatCollection = seatCollection; 
module.exports.tier1_schedModel = tier1_schedModel; 
module.exports.tier2_schedModel = tier2_schedModel; 
module.exports.tier3_schedModel = tier3_schedModel; 
module.exports.userModel = userModel; 
module.exports.seatModel = seatModel; 