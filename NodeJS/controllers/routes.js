
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
  
  server.get('/', function(req, resp){
    
    resp.render('main',{
        layout: 'index',
        title: 'TechLite',
    });
  });

  server.get('/main', function(req, resp){
    resp.redirect('/');
  });
  
  // redirect to toggle login pop-up
  server.get('/create-account-success', function(req, resp){
    resp.redirect('/?create_account=success');
  });

  // redirect to toggle login pop-up
  server.get('/create-account-success-manager', function(req, resp){
    resp.redirect('/profile?create_account=success');
  });

  server.get('/manage', function(req, resp){
    
    resp.render('manage',{
        layout: 'index',
        title: 'TechLite - Manage Reservations',
    });
  });

  server.get('/profile', function(req, resp){
    if (req.session && req.session.user) {
      resp.render('profile',{
          layout: 'index',
          title: 'TechLite - Profile',
          isManager: req.session.user.is_manager == true,
      });
    } else {
        // Handle the case where there's no session
        resp.redirect('/');
    }
  });

  server.get('/reserve', function(req, resp){
      resp.render('reserve',{
          layout: 'index',
          title: 'TechLite - Reserve Your Seat',
      });
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
