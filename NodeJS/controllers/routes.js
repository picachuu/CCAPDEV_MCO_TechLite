//Routes
//const responder = require('../models/Responder'); //loads this model that is needed

const dbmodel = require('../models/dbmodel');
const T1 = "Tier1";
const T2 = "Tier2";
const T3 = "Tier3";
const MongoClient = dbmodel.mongoClient;
MongoClient.connect().then(function(con){
    const dbo = MongoClient.db('techlite');
    //Will create a collection if it has not yet been made
    dbo.createCollection(T1)
      .then(dbmodel.successFn).catch(dbmodel.errorFn);
  }).catch(dbmodel.errorFn);

function add(server){
  server.get('/', function(req, resp){
    
    resp.render('main',{
        layout: 'index',
        title: 'TechLite',
    });
  });

  server.get('/main', function(req, resp){
    resp.redirect('/');
  });

  server.get('/profile', function(req, resp){
      resp.render('profile',{
          layout: 'index',
          title: 'TechLite - Profile',
      });
  });

  server.get('/reserve', function(req, resp){
      resp.render('reserve',{
          layout: 'index',
          title: 'TechLite - Reserve Your Seat',
      });
  });

  server.post('/reserve', function(req, resp){

    console.log('Reserve post request received');
    const dbo = MongoClient.db(dbmodel.databaseName);
    let col;
    switch(Number(req.body.tier_num)){
        case 1: col = dbo.collection(T1); break;
        case 2: col = dbo.collection(T2); break;
        case 3: col = dbo.collection(T3); break;
    }

    const searchQuery = {
        Seats: Number(req.body.seat_num), 
        Taken: false
    };

    console.log(searchQuery);
    
    const cursor = col.find(searchQuery);
    cursor.toArray().then(function(vals) {
        console.log('List successful');
        /*resp.render('reserve', {
            layout: 'index',
            title:  'TechLite - Reserve Your Seat',
            seats: vals
        });*/
        console.log(vals);
        resp.send({seats: vals});
    }).catch(dbmodel.errorFn);

  });

  server.get('/search', function(req, resp){
      
      resp.render('search',{
          layout: 'index',
          title: 'TechLite - Search',
      });
  });

  server.get('/services', function(req, resp){
      
      resp.render('services',{
          layout: 'index',
          title: 'TechLite - Services',
      });
  });
}

module.exports.add = add;

//Note: There are other ways to declare routes. Another way is to
//      use a structure called router. It would look like this:
//      const router = express.Router()
