const DB_URI = "mongodb://localhost/arhivcek"

// Bring Mongoose into the app
var mongoose = require( 'mongoose' );

// Build the connection string


// Create the database connection
mongoose.connect(DB_URI);

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open to ' + DB_URI);
});

// If the connection throws an error
mongoose.connection.on('error',function (err) {
  console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected');
});

// When the connection is open
mongoose.connection.on('open', function () {
  console.log('Mongoose default connection is open');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});


module.exports = mongoose.connection;
