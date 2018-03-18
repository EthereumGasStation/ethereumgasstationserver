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
