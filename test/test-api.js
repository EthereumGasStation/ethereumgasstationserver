let chai = require('chai');
let chaiHttp = require('chai-http');
let GasstationServer = require('../src/gasstationserver.js');
let should = chai.should();

chai.use(chaiHttp);

describe('', () => {
	let serverInstance;
	const randomPort = Math.floor(1000 + Math.random() * 9000);
	before((done) => {
		serverInstance = new GasstationServer({
			web3hostws: "wss://ropsten.infura.io/ws",
			contractaddress: "0x5f0f9749192eee39978f14a0fef0e960cce45f50",
			privatekey: "aeb3fe04acb77028e63d256d2e9d37c6da441a2614eab55b0a4986a22ecf586b",
			port: randomPort,
			uplift: 66,
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
				.get('/info/0xbb1ea3be053e7bd0bf4c8d6c7616aea7170b027d')
				.end((err, res) => {
					res.should.have.status(403);
					// res.body.should.be.a('object');
					// res.body.should.have.property('uplift').with.value(66);
					done();
				});
		});
	});

	describe('POST /fillrequest', () => {
		it('it should GET the gasstation info', (done) => {
			chai.request(serverInstance.app())
				.put('/fillrequest')
				.send({
					'address': '0xbb1ea3be053e7bd0bf4c8d6c7616aea7170b027d',
					'gasrequested': '100000000000000',
					'tokenoffered': 'swarm-city'
				})
				.end(function(err, res) {
					res.body.should.be.a('object');
					//err.should.be.null;
					//res.should.have.status(200);
					console.log(res.body);
					done();
				});

		});
	});

});
