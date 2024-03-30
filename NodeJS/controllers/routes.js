
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
  
  // redirect to toggle login pop-up
  server.get('/create-account-success', function(req, resp){
    resp.redirect('/?create_account=success');
  });

  server.get('/manage', function(req, resp){
    
    resp.render('manage',{
        layout: 'index',
        title: 'TechLite - Manage Reservations',
    });
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
