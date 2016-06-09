var startTime = Date.now();
import fs = require('fs');
import parameters = require('./core/parameters');

if (!fs.existsSync(__dirname+'/logs/')) fs.mkdirSync(__dirname+'/logs/');
if (!fs.existsSync(__dirname+'/logs/logs/')) fs.mkdirSync(__dirname+'/logs/logs/');
if (!fs.existsSync(__dirname+'/logs/access/')) fs.mkdirSync(__dirname+'/logs/access/');

var colors = require('colors/safe');
var numeral = require('numeral');
var cluster = require('cluster');


var clusterEnabled = parameters.getParameter('cluster');
var cpus = require('os').cpus().length;



if (!clusterEnabled || cluster.isMaster) {
    console.log(colors.yellow("          ____            _        _ _____ ____  "));
    console.log(colors.yellow("         |  _ \\ ___  _ __| |_ __ _| |_   _/ ___| "));
    console.log(colors.yellow("         | |_) / _ \\| '__| __/ _` | | | | \\___ \\ "));
    console.log(colors.yellow("         |  __/ (_) | |  | || (_| | | | |  ___) | "));
    console.log(colors.yellow("         |_|   \\___/|_|   \\__\\__,_|_| |_| |____/ "));
    console.log("\n");
    console.log(colors.bgRed(colors.white('                                                         ')));
    console.log(colors.bgRed(colors.white('                Loading required modules...              ')));
    console.log(colors.bgRed(colors.white('                                                         ')));
    console.log('\n');
}

import express = require('express');
import cookieParser = require('cookie-parser');
import bodyParser = require('body-parser');
import loader = require('./core/loader');

var portNumber = parameters.getParameter('port', 8080);
var server = express();


server.set('view engine', 'ejs');
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(cookieParser());
loader.Loader.init(server, __dirname);


export var onReadyCallback;

if (clusterEnabled && cluster.isMaster) {
    if (clusterEnabled!='auto' && clusterEnabled!==false && clusterEnabled!==true) {
        cpus = Number(clusterEnabled);
    }
    var s = "Starting in cluster mode ("+cpus+" processes)";
    console.log(colors.black(colors.bgWhite(s)));
    for (var i = 0; i < cpus; i++) {
        cluster.fork();
    }
}
else {
    server.listen(portNumber, () => {
        var endTime = Date.now();
        var elapsedTime = (endTime - startTime)/1000;
        var t = numeral(elapsedTime).format('0.00');
        console.log('\n');
        console.log(colors.bgGreen(colors.white('                                                         ')));
        console.log(colors.bgGreen(colors.white('           Startup completead in ' + t + ' seconds.           ')));
        console.log(colors.bgGreen(colors.white('                                                         ')));
        console.log('\n');
        console.log("Your application is in "+colors.green(server.get('env'))+" mode on port "+colors.green(portNumber));
        if (onReadyCallback) onReadyCallback();
    });
}
