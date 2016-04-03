
var express = require('express'),
    fs = require('fs'),
    http = require('http'),
    Canvas = require('canvas'),
    GeoPattern = require('geopattern'),
    pkg = require('./package'),
    s3Thing = require('./lib/s3Thing'),
    exec = require('child_process').execSync,
    app = express(),
    server = http.Server(app);

app.set('port', process.env.PORT || 3000);
app.disable('x-powered-by');

app.get('/create/:name', function(req, res) {
    var Image = Canvas.Image,
        canvas = new Canvas(1400, 1400),
        ctx = canvas.getContext('2d'),
        img = new Image,
        imgPattern = new Image,
        namedFile = '/tmp/tmp' + req.params.name + '.svg',
        namedPng = '/tmp/tmp' + req.params.name + '.png',
        namedFinal = '/tmp/' + req.params.name + '.png',
        out,
        file,
        pattern,
        canvasPattern,
        stream;

    out = fs.createWriteStream(namedFinal);
    pattern = GeoPattern.generate(req.params.name, { color: '#ffffff' });
    fs.appendFileSync(namedFile, pattern.toString());
    exec('convert ' + namedFile + ' ' + namedPng);
    imgPattern.src = fs.readFileSync(namedPng);
    img.src = fs.readFileSync(__dirname + '/public/narro.png');
    console.info('draw start');
    canvasPattern = ctx.createPattern(imgPattern, 'repeat');
    ctx.fillStyle = canvasPattern;
    ctx.fillRect(0, 0, 1400, 1400);
    ctx.drawImage(img, 0, 0, 1400, 1400);
    stream = canvas.pngStream();
    console.info('stream start');
    stream.on('data', function(chunk){
        out.write(chunk);
    });
    stream.on('end', function(){
        console.info('stream end');
        s3Thing(namedFinal, req.params.name + '.png', 'narro-images',
        function(err, data, location) {
            console.info('upload end');
            res.setStatus(201);
            res.jsonp({location: location});
        });
    });
});

server.listen(app.get('port'), function() {
    console.log(pkg.name, 'listening');
});
