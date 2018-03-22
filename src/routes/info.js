'use strict';
const Web3 = require('web3');
const GasStation = require('ethereumgasstation/build/contracts/GasStation.json');
const ERC20 = require('ethereumgasstation/build/contracts/ERC20.json');

module.exports = (options) => {
	return (req, res) => {
		const web3 = new Web3(new Web3.providers.WebsocketProvider(options.web3hostws));
		const gasStationInstance = new web3.eth.Contract(GasStation.abi, options.contractaddress);

		const gasstationlib = require('ethereumgasstation/lib/gasstationlib.js')({
			currentProvider: web3.currentProvider
		});
		Promise.all([
			web3.eth.net.getId(),
			gasStationInstance.methods.maxGas().call(),
			web3.eth.getBalance(options.contractaddress),
		]).then(([netid, maxgas, availableGas]) => {
			// start with basic info 
			let info = {
				uplift: options.uplift,
				netid: netid,
				gasstationaddress: options.contractaddress,
				maxgas: maxgas.toString(10),
				availablegas: availableGas.toString(10),
			};
			if (req.params && req.params.address) {
				gasstationlib.checkPrerequisites(req.params.address)
					.then((r) => {
						// okay - this account seems fine.
						// get its balances of tokens
						let balancesPromises = [];
						Object.keys(options.tokens).map((item) => {
							const tokenInstance = new web3.eth.Contract(ERC20.abi, options.tokens[item].address);
							balancesPromises.push(
								new Promise((resolve, reject) => {
									tokenInstance.methods.balanceOf(req.params.address).call()
										.then((balance) => {
											return (resolve(Object.assign({},
												options.tokens[item], {
													balance: balance
												})));
										}).catch((e) => {
											reject(e);
										});
								}));
						});

						Promise.all(balancesPromises).then((balances) => {
								// filter out empty balances.
								let tokens = [];
								balances.map((item) => {
									if (item.balance != '0') {
										tokens.push(item);
									}
								});
								return res.status(200).json(Object.assign({}, info, {
									tokens: tokens,
								}));
							})
							.catch((e) => {
								console.log('ERR', e);
								return res.status(500).json({
									error: e
								});
							});
					})
					.catch((e) => {
						// this pubkey is not good to use at the gasstation
						web3.eth.getBalance(req.params.address).then((balance) => {
							return res.status(403).json(Object.assign({}, info, {
								accountbalance: balance,
								error: e
							}));

						});
					});
			} else {
				res.status(200).json(
					Object.assign({},
						info, {
							tokens: options.tokens
						}));
				res.end();
			}
		});
	}
}
