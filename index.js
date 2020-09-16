/*
* Primary file for API
*
*/

// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder'). StringDecoder;
var config = require('./lib/config');
var fs = require('fs');
var handlers = require('./lib/handlers');
var helpers = require('./lib/helpers');


// Instantiating the http server
var httpServer = http.createServer(function(req, res){
	unifiedServer(req, res);


});

// Start the http server
httpServer.listen(config.httpPort, function(){
	console.log('The HTTP server is listening on port '+config.httpPort);
});
// instantiate the HTTPS server

var httpsServerOptions = {
	'key' : fs.readFileSync('./https/key.pem'), 
	'cert': fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions,function(req, res){
	unifiedServer(req, res);
})


// Start the HTTPS server
httpsServer.listen(config.httpsPort, function(){
	console.log('The HTTPS server is listening on port '+config.httpsPort);
});

// ll the server logic for both http and https server
var unifiedServer = function(req, res) {

	// Get the url and parse it
 var parsedUrl = url.parse(req.url, true);

	// Get the path
	var path = parsedUrl.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g,'');

	// Get the query string as an object
	var queryStringObject = parsedUrl.query;

	
// Get the http Method
var method = req.method.toLowerCase();

//Get the headers as an object
var headers = req.headers;

//Get the payload, if any
var decoder = new StringDecoder('utf-8');
var buffer = '';
req.on('data', function(data){
	buffer += decoder.write(data);
});
req.on('end', function(){
	buffer += decoder.end();

		// Choose the handler this request should go to. If one is not find use the nonFound handler
     var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;


	// Send the response
res.end('Hello World\n');

// Construct the data object to send to the handler
var data = {
	'trimmedPath': trimmedPath,
	'queryStringObject': queryStringObject,
	'method' : method,
	'headers' : headers,
	'payload' : helpers.parseJsonToObject(buffer)

};
// route the request to the header specified in the router
chosenHandler(data, function(statusCode, payload){
	//Use the status code called back by the handler, or default to 
	statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

	// Use the payload
	payload = typeof(payload) == 'object' ? payload : {};

	// Convert the payload to a string

	var payloadString = JSON.stringify(payload);

	// Return the response
	res.setHeader('Content-Type', 'application/json');
	res.writeHead(statusCode);
	res.end(payloadString);
	console.log(trimmedPath,statusCode);

     });
  });
};
// Define a request router
var router = {
	'ping': handlers.ping,
	'users': handlers.users
};

