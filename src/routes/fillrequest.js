'use strict';
const Web3 = require('web3');
const GasStation = require('ethereumgasstation/build/contracts/GasStation.json');
const ERC20 = require('ethereumgasstation/build/contracts/ERC20.json');

module.exports = (options) => {
	return (req, res) => {
		console.log('kaja',options);
		return res.status(200).json({
			quaak: 1
		});
	}
};
