let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../lib/gasstationserver.js');
let should = chai.should();

chai.use(chaiHttp);

describe('', () => {
	let serverInstance;
	beforeEach((done) => {
		serverInstance = new GasstationServer({
			web3hostws: "wss://mainnet.infura.io/ws",
			contractaddress: "0x0000",
			privatekey: "0x0000",
			port: 7777
		});
		serverInstance.go();
	});

	describe('GET /tokens', () => {
		it('it should GET all the tokens', (done) => {
			chai.request(server)
				.get('/tokens')
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.length.should.be.eql(0);
					done();
				});
		});
	});
});
