'use strict';

/**
 * GasstationServer
 *
 */

var express = require('express');
var bodyparser = require('body-parser');
var app = express();

//var Web3 = require('web3');

class GasstationServer {
	/**
	 * constructor
	 *
	 * @param      {object}  options  The options
	 */
	constructor(options) {
		const {
			createLogger,
			format,
			transports,
		} = require('winston');
		this.logger = createLogger({
			level: 'info',
			format: format.combine(
				format.colorize(),
				format.splat(),
				format.simple()
			),
			transports: [new transports.Console()],
		});
		this.options = options;
	}

	/**
	 * Bootstrap the server
	 *
	 */
	go() {

		const Web3 = require('web3');

		const web3 = new Web3(new Web3.providers.WebsocketProvider(this.options.web3hostws));

		var ethereumgasstationlib = require('ethereumgasstation/lib/gasstationlib')({
			currentProvider: web3.currentProvider
		});
		var tokenpricelib = require('ethereumgasstation/lib/tokenpricelib')();

		var allowCrossDomain = function(req, res, next) {
			res.header('Access-Control-Allow-Origin', '*');
			res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
			res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

			// intercept OPTIONS method
			if ('OPTIONS' == req.method) {
				res.sendStatus(200);
			} else {
				next();
			}
		};
		app.use(allowCrossDomain);
		app.use(bodyparser.json());


		// start webserver...
		app.listen(this.options.port, () => {
			this.logger.info('server listening on port %d', this.options.port);
		});


	}
}
module.exports = GasstationServer;
