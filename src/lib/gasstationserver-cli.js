'use strict';

/**
 * the processor for the command line interface
 *
 */
class GasstationServerCli {
	/**
	 * construtor
	 *
	 */
	constructor() {
		this.stdout = process.stdout;
	}

	/**
	 * Creates the ipfsconsortium class
	 * Sets up the options from ENV, .ENV file or commandline
	 * Starts the Proxy.
	 *
	 * @param      {Object}  argv    command line parameter set
	 */
	go(argv) {
		// mixin the environment variables defined in .env
		require('dotenv').config({
			path: '.env',
		});

		const tool = require('command-line-tool');
		const cliData = require('./cli-data');
		const GasstationServer = require('../gasstationserver.js');

		const cli = tool.getCli(cliData.definitions, cliData.usageSections, argv);
		const options = cli.options;


		let instanceOptions = {
			web3hostws: options.web3hostws || process.env.WEB3HOSTWS,
			contractaddress: options.contractaddress || process.env.CONTRACTADDRESS,
			privatekey: options.privatekey || process.env.PRIVATEKEY,
			port: options.port || process.env.PORT,
		};

		if (
			!instanceOptions.web3hostws ||
			!instanceOptions.contractaddress ||
			!instanceOptions.privatekey ||
			!instanceOptions.port
		) {
			options.help = true;
		}

		if (options.help) {
			const os = require('os');
			this.stdout.write(cli.usage + os.EOL);
			return;
		}

		const server = new GasstationServer(instanceOptions);
		server.go();
	}
}

module.exports = GasstationServerCli;
