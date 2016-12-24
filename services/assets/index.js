'use strict';

var nconf = require('nconf');
nconf
	.argv()
	.env()
	.file({file: './defaults.json'});

var express = require('express');

var app = express();

app.use(express.static(nconf.get('publicDir')));

app.listen(nconf.get('port'));
