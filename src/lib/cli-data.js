'use strict';

exports.definitions = [
  {
    name: 'web3hostws',
    type: String,
    description: 'the URL of your local Ethereum node WS. ex. "ws://localhost:8546"',
  },
  {
    name: 'contractaddress',
    type: String,
    description: 'your deployed gasstation contract address. ex. "0x..."',
  },
  {
    name: 'privatekey',
    type: String,
    description: 'private key of your gasstation signer',
  },
  {
    name: 'port',
    type: Number,
    description: 'HTTP port to listen to',
  },  
  {
    name: 'uplift',
    type: Number,
    description: 'uplift in % of token marketprice ( ex. 5 )',
  },  
  {
    name: 'validity',
    type: Number,
    description: 'amount of blocks to keep price quotes valid ( ex. 10 )',
  },  
  {
    name: 'tokens',
    type: String,
    description: 'list of accepted tokens. ticker|address. ex. swarm-city|0x000345,token2|0x0000123',
  },  
  {
    name: 'help',
    type: Boolean,
    alias: 'h',
    description: 'Show usage',
  },
];

exports.usageSections = [
  {
    header: 'ethereumgasstationserver',
    content: 'gasstation API server',
  },
  {
    header: 'Synopsis',
    content: '$ ethereumgasstationserver <options>',
  },
  {
    header: 'Options',
    optionList: exports.definitions,
  },
];
