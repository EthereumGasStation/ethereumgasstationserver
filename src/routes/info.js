const Web3 = require('web3');
const GasStation = require('ethereumgasstation/build/contracts/GasStation.json');

module.exports = (options) => {
	return (req, res) => {
		const web3 = new Web3(new Web3.providers.WebsocketProvider(options.web3hostws));
		const gasStationInstance = new web3.eth.Contract(GasStation.abi, options.contractaddress);
		Promise.all([
			web3.eth.net.getId(),
			gasStationInstance.methods.maxGas().call(),
			web3.eth.getBalance(options.contractaddress),
		]).then(([netid,maxgas,balance]) => {
			res.status(200).json({
				uplift: options.uplift,
				netid: netid,
				gasstationaddress: options.contractaddress,
				maxgas: maxgas.toString(10),
				availablegas: balance.toString(10),
				tokens : options.tokens,
			});
		});
	}
}
