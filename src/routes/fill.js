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
			web3.eth.getBalance(txSigner),
		]).then(([netId, nonce, balance]) => {
			// the Tx should be on the right network
			if (txNetId !== netId) {
				return reject('allowance Tx NetId does not match my network Id');
			}
			// the nonce of the requesting account should be 0
			if (nonce !== 0) {
				return reject('allowance Tx sender\'s getTransactionCount is not 0');
			}
			// the balance in ETH of the requesting account should be 0
			if (!(new ethUtil.BN(balance)).isZero()) {
				return reject('Tx sender\'s ETH balance is not 0');
			}

			return resolve({
				allowance: {
					hash: verifyHash,
					signer: txSigner,
					cost: (new ethUtil.BN(tx.gasPrice)).toNumber(10) * (new ethUtil.BN(tx.gasLimit)).toNumber(10)
				}
			});
		});
	});
}

function sendAndWait(signedTx, requestHash, options, web3) {
	return new Promise((resolve, reject) => {
		web3.eth.sendSignedTransaction(ethUtil.addHexPrefix(signedTx))
			.on('confirmation', (confirmationNumber, receipt) => {
				if (confirmationNumber < 1) {
					options.logger.info('%s : received confirmation number=%d', requestHash, confirmationNumber);
				} else {
					return resolve(receipt);
				}
			})
			.on('transactionHash', function(hash) {
				options.logger.info('%s : received Txhash %s', requestHash, hash);
			})
			.on('error', (e, receipt) => {
				return reject(e, receipt);
			});
	});
}


module.exports = (options) => {
	return (req, res) => {
		console.log(req.body);
		const web3 = new Web3(new Web3.providers.WebsocketProvider(options.web3hostws));
		const gasstationlib = require('ethereumgasstation/lib/gasstationlib.js')({
			currentProvider: web3.currentProvider
		});

		verifySignatures(req, options, gasstationlib, web3)
			.then((signatureInfo) => {

				options.logger.info('%s : starting cycle. Send %d wei to %s', signatureInfo.allowance.hash, signatureInfo.allowance.cost, signatureInfo.allowance.signer);

				const gasStationInstance = new web3.eth.Contract(GasStation.abi, options.contractaddress);

				let tokenInfo = options.tokens.find(function(element) {
					return (element.ticker == req.body.tokenoffered);
				});

				// create upfront gas Tx
				gasstationlib.getGasTx(signatureInfo.allowance.signer, signatureInfo.allowance.cost, options.signerpublickey, options.signerprivatekey).then((gasTx) => {

					options.logger.info('%s : executing getGas Tx - ', signatureInfo.allowance.hash);
					sendAndWait(gasTx.tx, signatureInfo.allowance.hash, options, web3).then((gasTxRes) => {
						options.logger.info('%s : getGas Tx mined in block %d ', signatureInfo.allowance.hash, gasTxRes.blockNumber);
						options.logger.info('%s : sending allowance Tx ', signatureInfo.allowance.hash);

						sendAndWait(req.body.allowancetx, signatureInfo.allowance.hash, options, web3).then((allowanceTxRes) => {
							options.logger.info('%s : allowance Tx mined in block %d ', signatureInfo.allowance.hash, allowanceTxRes.blockNumber);

							// create purchaseTx
							gasstationlib.getPurchaseGasTx(
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
								options.logger.info('%s : sending getPurchaseGas Tx ', signatureInfo.allowance.hash);
								sendAndWait(purchaseGasTx.tx, signatureInfo.allowance.hash, options, web3).then((purchaseGasTxRes) => {
									options.logger.info('%s : purchaseGas Tx mined in block %d ', signatureInfo.allowance.hash, purchaseGasTxRes.blockNumber);
									return res.status(200).json(purchaseGasTxRes);
								});
							});
						});
					});
				});
			}).catch((e) => {
				return res.status(500).json({
					message: e
				});
			})
	}
};
