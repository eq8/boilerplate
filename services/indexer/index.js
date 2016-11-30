'use strict';

var nconf = require('nconf');
nconf
	.argv()
	.env()
	.file({file: './defaults.json'});

// var api = require('eq8-api')();

// var seneca = require('seneca')();
