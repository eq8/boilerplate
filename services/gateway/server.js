'use strict';

var nconf = require('nconf');
nconf
	.argv()
	.env()
	.file({file: './defaults.json'});

var express = require('express');

// TODO: add nconf for other JWT options
var api = require('eq8')({jwt: {secret: nconf.get('secret')}});
var app = express();

app.use(express.static(nconf.get('public')));

app.use('/api', api.syncware);

app.listen(nconf.get('port'));

