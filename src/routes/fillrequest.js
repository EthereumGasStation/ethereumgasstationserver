'use strict';
const Web3 = require('web3');

module.exports = (options) => {
	const tokenpricelib = require('ethereumgasstation/lib/tokenpricelib')(options);

	return (req, res) => {
		
		const web3 = new Web3(new Web3.providers.WebsocketProvider(options.web3hostws));
		const gasstationlib = require('ethereumgasstation/lib/gasstationlib.js')({
			currentProvider: web3.currentProvider
		});

		Promise.all([
			tokenpricelib.getPrice(req.body.tokenoffered),
			web3.eth.getBlockNumber(),
			gasstationlib.estimateGasRequirement(),
		]).then(([price, block,extraGasNeeded]) => {


			console.log('Extra gas needed',extraGasNeeded);

			let ethprice = parseFloat(price.price_eth) * 100 / options.uplift;
			let gasRequested = (new web3.utils.BN(req.body.gasrequested)).add(new web3.utils.BN(extraGasNeeded));

				console.log('gasRequested',gasRequested);

			let tokensRequired = Math.ceil(ethprice * gasRequested.toNumber(10));

			let tokenInfo = options.tokens.find(function(element) {
				return (element.ticker == req.body.tokenoffered);
			});

			let validuntil = block + options.validity;

			let requestHash = gasstationlib.makeGastankParametersHash(
				tokenInfo.address,
				options.contractaddress,
				tokensRequired,
				gasRequested,
				validuntil);


			let clientSig = gasstationlib.signHash(
				requestHash,
				options.signerprivatekey);


			return res.status(200).json({
				gas: gasRequested.toString(10),
				tokens: tokensRequired.toString(10),
				validuntil: validuntil.toString(10),
				requesthash: requestHash,
				serversig: {
					r: clientSig.r,
					s: clientSig.s,
					v: clientSig.v,
				}
			});
		}).catch((e) => {
			return res.status(500).json({
				message: e
			});
		});
	}
};
