//This is a mock database. Your MySQL or MongoDB code will fall
//into here.

//Require a MongoDB connection. This will create a client
//to connect to the specified mongoDB. The last part of the
//URL is the database it connects to.
const { MongoClient } = require('mongodb');
const databaseURL = "mongodb://127.0.0.1:27017/";
const mongoClient = new MongoClient(databaseURL);

//Note on the database URL. There are times that localhost is not
//recogized by the system. In that case, use 127.0.0.1 instead.

const databaseName = "techlite";
const Tier1collection = "Tier1";

//These are some reusable functions used through-out the whole
//project.
function errorFn(err){
    console.log('Error found. Please trace!');
    console.error(err);
}

function successFn(res){
    console.log('Database query successful!');
}

//To interact with the mongo database, a client needs to be made
//and then the client should connect to the database.
mongoClient.connect().then(function(con){
  console.log("Attempt to create!");
  const dbo = mongoClient.db(databaseName);
  //Will create a collection if it has not yet been made
  dbo.createCollection(Tier1collection)
    .then(successFn).catch(errorFn);
}).catch(errorFn);

module.exports.mongoClient = mongoClient; //to be used in controller
module.exports.databaseName = databaseName; //to be used in controller
module.exports.errorFn = errorFn; //to be used in controller
module.exports.successFn = successFn; //to be used in controller

// <-- functions section-->

const greetings = [
    "Hi!",
    "Hello!",
    "Howdy!",
    "Greetings!"
];
const genericResponses = [
    "I see. Tell me more?",
    "Really? How so?",
    "Is that so?",
    "I didn't know that. Go on."
];

function getResponse(message){
    if(message.includes("Hello") || message.includes("Howdy") ||
            message.includes("Greetings") || message.includes("Hi"))
        return greetings[Math.floor(Math.random()*greetings.length)];
    else
        return genericResponses[Math.floor(Math.random()*genericResponses.length)];
}

module.exports.getResponse = getResponse;

