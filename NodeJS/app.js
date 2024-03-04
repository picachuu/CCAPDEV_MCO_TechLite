//

const express = require('express');
const server = express();

const bodyParser = require('body-parser');
server.use(express.json()); 
server.use(express.urlencoded({ extended: true }));

const handlebars = require('express-handlebars');
server.set('view engine', 'hbs');
server.engine('hbs', handlebars.engine({
    extname: 'hbs',
}));

server.use(express.static('public'));

//Use this function to turn the status of an day into
//a class that is consistent with the naming convention the
//css file use.

//Modify the code in this area


//const dateinfo = require('./DateInfo');


server.get('/', function(req, resp){
    
    resp.render('main',{
        layout: 'index',
        title: 'TechLite',
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


const port = process.env.PORT | 9090;
server.listen(port, function(){
    console.log('Listening at port '+port);
});
