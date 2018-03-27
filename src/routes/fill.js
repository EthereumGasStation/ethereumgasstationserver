'use strict';
const Web3 = require('web3');
const GasStation = require('ethereumgasstation/build/contracts/GasStation.json');
const ethUtil = require('ethereumjs-util');
const EthereumTx = require('ethereumjs-tx');

function verifySignatures(req, options, gasstationlib, web3) {
	return new Promise((resolve, reject) => {

		// get the token info based on the ticker in the request
		let tokenInfo = options.tokens.find(function(element) {
			return (element.ticker == req.body.tokenoffered);
		});

		if (!tokenInfo || !tokenInfo.address) {
			return reject('token not found', req.body.tokenoffered);
		}

		// extract signer address (pubkey) from allowance transaction
		let tx = new EthereumTx(req.body.allowancetx);
		let txSigner = ethUtil.addHexPrefix(tx.getSenderAddress().toString('hex'));
		let txNetId = tx.getChainId();

		if (!txSigner) {
			return reject('cannot extract signer address from allowance Tx');
		}

		// re-calculate parameter hash
		const verifyHash = gasstationlib.makeGastankParametersHash(
			tokenInfo.address,
			options.contractaddress,
			req.body.tokens,
			req.body.gas,
			req.body.validuntil,
		);

		// extract the signer address from the server signature
		const verifyServerAddress = ethUtil.bufferToHex(ethUtil.pubToAddress(ethUtil.ecrecover(ethUtil.toBuffer(ethUtil.addHexPrefix(verifyHash)), req.body.serversig.v, req.body.serversig.r, req.body.serversig.s)));
		if (!verifyServerAddress) {
			return reject('cannot extract address from server signature');
		}
		if (verifyServerAddress !== options.signerpublickey) {
			return reject('server signature does not match signer\'s address');
		}

		// extract the signer address from the client signature
		const verifyClientAddress = ethUtil.bufferToHex(ethUtil.pubToAddress(ethUtil.ecrecover(ethUtil.toBuffer(ethUtil.addHexPrefix(verifyHash)), req.body.clientsig.v, req.body.clientsig.r, req.body.clientsig.s)));
		if (!verifyClientAddress) {
			return reject('cannot extract address from server signature');
		}
		if (verifyClientAddress !== txSigner) {
			return reject('client signature does not match signer of allowance tx');
		}

		Promise.all([
			web3.eth.net.getId(),
			web3.eth.getTransactionCount(txSigner),
		]).then(([netId, nonce]) => {
			if (txNetId !== netId) {
				return reject('allowance Tx NetId does not match my network Id');
			}
			if (nonce !== 0) {
				return reject('allowance Tx sender\'s getTransactionCount is not 0');
			}
			return resolve({
				allowance: {
					signer: txSigner,
					cost: (new ethUtil.BN(tx.gasPrice)).toNumber(10) * (new ethUtil.BN(tx.gasLimit)).toNumber(10)
				}
			});
		});
	});
}


module.exports = (options) => {
	return (req, res) => {
		const web3 = new Web3(new Web3.providers.WebsocketProvider(options.web3hostws));
		const gasstationlib = require('ethereumgasstation/lib/gasstationlib.js')({
			currentProvider: web3.currentProvider
		});

		verifySignatures(req, options, gasstationlib, web3)
			.then((signatureInfo) => {
				const gasStationInstance = new web3.eth.Contract(GasStation.abi, options.contractaddress);

				let tokenInfo = options.tokens.find(function(element) {
					return (element.ticker == req.body.tokenoffered);
				});
debugger;
				// send gas Tx
				gasstationlib.getGasTx(signatureInfo.allowance.signer, signatureInfo.allowance.cost).then((res) => {

					debugger;

					// create purchaseTx
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
						options.signerpublickey,
						options.signerprivatekey
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
				});

			}).catch((e) => {
				return res.status(500).json({
					message: e
				});
			})
	}
};
