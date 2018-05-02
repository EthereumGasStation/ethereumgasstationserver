const chai = require('chai');
const chaiHttp = require('chai-http');
const GasstationServer = require('../src/gasstationserver.js');
const should = chai.should();
const Web3 = require('web3');

chai.use(chaiHttp);

describe('', () => {

	const gasstationCustomer = { private: '2eba3fcf73bd48e1898aa922898a97b0c8a6ab0f052db2920243e99ee19cd6ff',
  public: '0x57b5a464e656e8438e89167fb39ce798a5ceffb5' }

	let serverInstance;
	const randomPort = Math.floor(1000 + Math.random() * 9000);
	before((done) => {
		serverInstance = new GasstationServer({
			web3hostws: "wss://ropsten.infura.io/ws",
			contractaddress: "0x5f0f9749192eee39978f14a0fef0e960cce45f50",
			signerprivatekey: "aeb3fe04acb77028e63d256d2e9d37c6da441a2614eab55b0a4986a22ecf586b",
			port: randomPort,
			uplift: 66,
			validity: 20,
			tokens: [{
				ticker: 'swarm-city',
				address: '0x7932236CC4E5dBD840D9A52b009Fed3582d4Bf4f'
			}]
		});
		serverInstance.go().then(done);
	});

	describe('GET /info', () => {
		it('it should GET the gasstation info', (done) => {
			chai.request(serverInstance.app())
				.get('/info')
				.end((err, res) => {
					res.should.have.status(200);
					//res.body.should.be.a('object');
					//res.body.should.have.property('uplift').with.value(66);
					done();
				});
		});
		it('it should GET gasstation info for 1 address', (done) => {
			chai.request(serverInstance.app())
				.get('/info/' + gasstationCustomer.public)
				.end((err, res) => {
					res.should.have.status(403);
					// res.body.should.be.a('object');
					// res.body.should.have.property('uplift').with.value(66);
					done();
				});
		});
	});

	let fillrequestResponse;

	describe('POST /fillrequest', () => {
		it('it should POST the fillrequest data', (done) => {
			chai.request(serverInstance.app())
				.put('/fillrequest')
				.send({
					'address': gasstationCustomer.public,
					'gasrequested': '100000000000000',
					'tokenoffered': 'swarm-city'
				})
				.end(function(err, res) {
					res.body.should.be.a('object');
					//err.should.be.null;
					//res.should.have.status(200);
					console.log(res.body);
					fillrequestResponse = res.body
					done();
				});
		});
	});


	describe('POST /fill', () => {
		it('it should POST the fill request', (done) => {

			const web3 = new Web3(new Web3.providers.WebsocketProvider(serverInstance.options.web3hostws));

			const gasstationlib = require('ethereumgasstation/lib/gasstationlib.js')({
				currentProvider: web3.currentProvider
			});


			let tokenInfo = serverInstance.options.tokens.find(function(element) {
				return (element.ticker == 'swarm-city');
			});

			// sign off on the parameters, giving the gasstation operator ('signer')
			// my required signature to execute the gas-exchange ONLY with the 
			// parameters i agree upon.
			let clientSig = gasstationlib.signGastankParameters(
				tokenInfo.address,
				serverInstance.options.contractaddress,
				fillrequestResponse.tokens,
				fillrequestResponse.gas,
				fillrequestResponse.validuntil,
				gasstationCustomer.private);

			// generate an approval transaction to allow the gasstation contract
			// to withdraw the agreed amount of tokens from my account.
			gasstationlib.getApprovalTx(
				gasstationCustomer.public,
				gasstationCustomer.private,
				tokenInfo.address,
				fillrequestResponse.tokens,
				serverInstance.options.contractaddress
			).then((approvalTx) => {

				// send everything through...
				chai.request(serverInstance.app())
					.put('/fill')
					.send({
						'allowancetx': approvalTx.tx,
						'address': gasstationCustomer.public,
						'tokenoffered': 'swarm-city',
						'gas': fillrequestResponse.gas,
						'tokens': fillrequestResponse.tokens,
						'validuntil': fillrequestResponse.validuntil,
						'serversig': fillrequestResponse.serversig,
						'clientsig': clientSig,
					})
					.end(function(err, res) {
						console.log('res', res.body);
						res.should.have.status(200);
						res.body.should.be.a('object');
						//err.should.be.null;
						//console.log(res.body);
						done();
					});
			});
		});
	});
});
