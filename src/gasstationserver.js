'use strict';

/**
 * GasstationServer
 *
 */

const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const ethUtil = require('ethereumjs-util');

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
		options.logger = this.logger;
		this.options = options;


		// derive the signer's public key from the private key.
		this.options.signerpublickey = ethUtil.bufferToHex(ethUtil.privateToAddress(ethUtil.toBuffer(ethUtil.addHexPrefix(this.options.signerprivatekey))));

		this.logger.info('signer pubkey %s', this.options.signerpublickey);


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

		const routes = {
			info: require('./routes/info')(this.options),
			fillrequest: require('./routes/fillrequest')(this.options),
			fill: require('./routes/fill')(this.options),
		};

		app.get('/info/:address?', routes.info);
		app.put('/fillrequest', routes.fillrequest);
		app.put('/fill', routes.fill);
	}

	app() {
		return app;
	}

	/**
	 * Bootstrap the server
	 *
	 */
	go() {
		return new Promise((resolve, reject) => {
			// start webserver...
			app.listen(this.options.port, () => {
				this.logger.info('server listening on port %d', this.options.port);
				resolve();
			});
		});
	}
}
module.exports = GasstationServer;
