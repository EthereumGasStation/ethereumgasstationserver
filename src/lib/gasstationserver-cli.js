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
			uplift: options.uplift || process.env.UPLIFT,
			validity: options.validity || process.env.VALIDITY,
			tokens: options.tokens || process.env.TOKENS,
		};

		if (!instanceOptions.web3hostws ||
			!instanceOptions.contractaddress ||
			!instanceOptions.privatekey ||
			!instanceOptions.port ||
			!instanceOptions.uplift ||
			!instanceOptions.validity ||
			!instanceOptions.tokens
		) {
			options.help = true;
		}

		if (options.help) {
			const os = require('os');
			this.stdout.write(cli.usage + os.EOL);
			return;
		}

		let acceptedTokens = [];
		options.tokens.split(',').forEach((item) => {
			const parts = item.split('|');
			if (parts.length === 2) {
				acceptedTokens.push({
					ticker: parts[0],
					address: parts[1],
				});
			}
		});
		instanceOptions.tokens = acceptedTokens;

		const server = new GasstationServer(instanceOptions);
		server.go();
	}
}

module.exports = GasstationServerCli;
