'use strict';
const Web3 = require('web3');
const GasStation = require('ethereumgasstation/build/contracts/GasStation.json');
//const ERC20 = require('ethereumgasstation/build/contracts/ERC20.json');

module.exports = (options) => {

	return (req, res) => {
		console.log('FILL');
		const web3 = new Web3(new Web3.providers.WebsocketProvider(options.web3hostws));
		const gasstationlib = require('ethereumgasstation/lib/gasstationlib.js')({
			currentProvider: web3.currentProvider
		});

		const gasStationInstance = new web3.eth.Contract(GasStation.abi, options.contractaddress);
		console.log(req.body);

		let tokenInfo = options.tokens.find(function(element) {
			return (element.ticker == req.body.tokenoffered);
		});

		gasstationlib.getPurchaseGastx(
			tokenInfo.address,
			req.body.address,
			req.body.validuntil,
			req.body.tokens,
			req.body.gas,
			options.contractaddress,
			req.body.clientsig.v,
			req.body.clientsig.r,
			req.body.clientsig.s,
			'0x7d4228bD31cE8c9675eeECcc45a269BABB6EF6B4',
			'aeb3fe04acb77028e63d256d2e9d37c6da441a2614eab55b0a4986a22ecf586b'
		).then((purchaseGasTx) => {
			// and throws it in the Tx pool
			// localWeb3.eth.sendSignedTransaction(purchaseGasTx.tx).on('receipt', (receipt) => {
			// 	console.log('purchase gas - tx sent', receipt);
			// 	assert.fail('this TX should throw..');
			// }).on('error', (err) => {
			// 	done();
			// });

			return res.status(200).json(purchaseGasTx);

		});



		// Promise.all([
		// 	tokenpricelib.getPrice(req.body.tokenoffered),
		// 	web3.eth.getBlockNumber(),
		// ]).then(([price, block]) => {

		// 	let ethprice = parseFloat(price.price_eth) * 100 / options.uplift;
		// 	let gasRequested = new web3.utils.BN(req.body.gasrequested);
		// 	let tokensRequired = Math.ceil(ethprice * gasRequested.toNumber(10));

		// 	let tokenInfo = options.tokens.find(function(element) {
		// 		return (element.ticker == req.body.tokenoffered);
		// 	});

		// 	let validuntil = block + options.validity;

		// 	let clientSig = gasstationlib.signGastankParameters(
		// 		tokenInfo.address,
		// 		options.contractaddress,
		// 		tokensRequired,
		// 		gasRequested,
		// 		validuntil,
		// 		options.privatekey);


		// 	return res.status(200).json({
		// 		gas: gasRequested.toString(10),
		// 		tokens: tokensRequired.toString(10),
		// 		validuntil: validuntil.toString(10),
		// 		serversig: {
		// 			r: clientSig.r,
		// 			s: clientSig.s,
		// 			v: clientSig.v,
		// 		}
		// 	});
		// }).catch((e) => {
		// 	return res.status(500).json({
		// 		message: e
		// 	});
		// });
	}
};
