const mongoose = require('mongoose');

const dbmodel = require('../models/dbmodel');
const tier1_schedModel = dbmodel.tier1_schedModel;
const tier2_schedModel = dbmodel.tier2_schedModel;
const tier3_schedModel = dbmodel.tier3_schedModel;
const db_url = dbmodel.db_url;
const databaseName = dbmodel.databaseName;
const errorFn = dbmodel.errorFn;
const successFn = dbmodel.successFn;

mongoose.connect(db_url+databaseName);



// MongoClient.connect().then(function(con){
//     const dbo = MongoClient.db('techlite2');
//     //Will create a collection if it has not yet been made
//     dbo.createCollection(T1)
//       .then(dbmodel.successFn).catch(dbmodel.errorFn);
//   }).catch(dbmodel.errorFn);

function add(server){

  server.post('/reserve', function(req, resp){

    console.log('Reserve post request received');
    // const dbo = MongoClient.db(dbmodel.databaseName);
    // let col;
    // switch(Number(req.body.tier_num)){
    //     case 1: col = dbo.collection(T1); break;
    //     case 2: col = dbo.collection(T2); break;
    //     case 3: col = dbo.collection(T3); break;
    // }

    let tierModel;
    switch(Number(req.body.tier_num)){
        case 1: tierModel = tier1_schedModel; break;
        case 2: tierModel = tier2_schedModel; break;
        case 3: tierModel = tier3_schedModel; break;
    }

    const searchQuery = {
        seats: Number(req.body.seat_num), 
        taken: false
    };

    console.log("Searching for Tier"+req.body.tier_num+": "+ JSON.stringify(searchQuery));

    tierModel.find(searchQuery).lean().then(function(vals){
        console.log('List successful');
        console.log(vals.length);
        resp.send({seats: vals});
    }).catch(errorFn);

    // console.log(searchQuery);
    
    // const cursor = col.find(searchQuery);
    // cursor.toArray().then(function(vals) {
    //     console.log('List successful');
    //     /*resp.render('reserve', {
    //         layout: 'index',
    //         title:  'TechLite - Reserve Your Seat',
    //         seats: vals
    //     });*/
    //     console.log(vals);
    //     resp.send({seats: vals});
    // }).catch(dbmodel.errorFn);

  });
}

module.exports.add = add;