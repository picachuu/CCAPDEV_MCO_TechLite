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


const dateinfo = require('./DateInfo');


server.get('/', function(req, resp){
    let data = dateinfo.getData();
    for (let i = 0; i< data.length; i++) {
        data[i]['status'] = formatStatusToClass(String(data[i]['status']));
        
    }
    resp.render('main',{
        layout: 'index',
        title: 'Chore Calendar!',
        data: data
    });
});


const port = process.env.PORT | 9090;
server.listen(port, function(){
    console.log('Listening at port '+port);
});
