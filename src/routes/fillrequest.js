'use strict';
const Web3 = require('web3');
const GasStation = require('ethereumgasstation/build/contracts/GasStation.json');
const ERC20 = require('ethereumgasstation/build/contracts/ERC20.json');

module.exports = (options) => {

	const tokenpricelib = require('ethereumgasstation/lib/tokenpricelib')(options);



	return (req, res) => {
		const web3 = new Web3(new Web3.providers.WebsocketProvider(options.web3hostws));
		const gasstationlib = require('ethereumgasstation/lib/gasstationlib.js')({
			currentProvider: web3.currentProvider
		});

		tokenpricelib.getPrice(req.body.tokenoffered).then((price) => {
			let ethprice = parseFloat(price.price_eth) * 100 / options.uplift;
			let gasRequested = new web3.utils.BN(req.body.gasrequested);
			let tokensRequired = Math.ceil(ethprice * gasRequested.toNumber(10));

			let tokenInfo = options.tokens.find(function(element) {
				return (element.ticker == req.body.tokenoffered);
			});

			let validuntil = 12345;

			let clientSig = gasstationlib.signGastankParameters(
				tokenInfo.address,
				options.contractaddress,
				tokensRequired,
				gasRequested,
				validuntil,
				options.privatekey);


			return res.status(200).json({
				gas: gasRequested.toString(10),
				tokens: tokensRequired.toString(10),
				validuntil: validuntil.toString(10),
				r: clientSig.r,
				s: clientSig.s,
				v: clientSig.v,
			});
		}).catch((e)=>{
			return res.status(500).json({
				message: e
			});
		});
	}
};
