
var express = require('express'),
    fs = require('fs'),
    http = require('http'),
    pkg = require('./package'),
    app = express(),
    server = http.Server(app);

app.set('port', process.env.PORT || 3000);
app.disable('x-powered-by');

server.listen(app.get('port'), function() {
    console.log(pkg.name, 'listening');
});
