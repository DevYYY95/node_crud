var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');
var session = require('express-session');

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// homepage route
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/login.html');
});


var dbConn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'node_test'
});

// connect to database
dbConn.connect();

//check user login

app.post('/', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		dbConn.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/home', function(req, res) {
	if (req.session.loggedin) {
		res.send('Welcome back, ' + req.session.username + '!');
	} else {
		res.send('Please login to view this page!');
	}
	res.end();
});

// add a new user
app.post('/user', function (req, res) {
if (req.session.loggedin) {
	let address = req.body.address;
    let username = req.body.username;
    let password = req.body.password;
	let port = req.body.port;

    
    // validation
    if (!address || !username || !password || !port)
        return res.status(400).send({ error:true, message: 'Please provide all fields' });

    // insert to db
    dbConn.query("INSERT INTO users (address, username, password , port) VALUES (?, ? ,?, ?)", [address, username, password, port ], function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'User successfully added' });
    });
	}else {res.send('Please login to view this page!');}
});

// retrieve all users
app.get('/users', function (req, res) {
if (req.session.loggedin) {
	    dbConn.query('SELECT * FROM users', function (error, results, fields) {
	        if (error) throw error;

	        // check has data or not
	        let message = "";
	        if (results === undefined || results.length == 0)
	            message = "Users table is empty";
	        else
	            message = "Successfully retrived all users";

	        return res.send({ error: false, data: results, message: message });
	    });
	}else {res.send('Please login to view this page!');}
});

// retrieve user by id
app.get('/user/:id', function (req, res) {
if (req.session.loggedin) {
    let id = req.params.id;

    if (!id) {
        return res.status(400).send({ error: true, message: 'Please provide user id' });
    }

    dbConn.query('SELECT * FROM users where id=?', id, function (error, results, fields) {
        if (error) throw error;

        // check has data or not
        let message = "";
        if (results === undefined || results.length == 0)
            message = "User not found";
        else
            message = "Successfully retrived user data";

        return res.send({ error: false, data: results[0], message: message });
    });
}else {res.send('Please login to view this page!');}

});

// update book with id
app.put('/user', function (req, res) {
if (req.session.loggedin) {
    let id = req.body.id;
    let address = req.body.address;
    let username = req.body.username;
    let password = req.body.password;
	let port = req.body.port;

    // validation
    if (!id ||!address || !username || !password || !port) {
        return res.status(400).send({ error: true, message: 'Please provide all fields' });
    }

    dbConn.query("UPDATE users SET address = ?,username = ?,password = ?,port = ? WHERE id = ?", [address, username, password,port,id], function (error, results, fields) {
        if (error) throw error;

        // check data updated or not
        let message = "";
        if (results.changedRows === 0)
            message = "User not found";
        else
            message = "User successfully updated";

        return res.send({ error: false, data: results.id, message: message });
    });
}else {res.send('Please login to view this page!');}
});


// delete user by id
app.delete('/user', function (req, res) {
if (req.session.loggedin) {
    let id = req.body.id;

    if (!id) {
        return res.status(400).send({ error: true, message: 'Please provide user id' });
    }
    dbConn.query('DELETE FROM users WHERE id = ?', [id], function (error, results, fields) {
        if (error) throw error;

        // check data updated or not
        let message = "";
        if (results.affectedRows === 0)
            message = "user not found";
        else
            message = "user successfully deleted";

        return res.send({ error: false, data: results, message: message });
    });
}else {res.send('Please login to view this page!');}
});

// set port
app.listen(3000, function () {
    console.log('Node app is running on port 3000');
});

module.exports = app;



