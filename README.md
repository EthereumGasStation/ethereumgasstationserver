# Ethereum Gasstation Server

This is the server component of a GasStation

# Installation

`npm install ethereumgasstationserver`

## Configuration

### Option 1 : Environment variables

You can set a number of environment variables to configure the script:

```
WEB3HOSTWS="ws://localhost:8546"
CONTRACTADDRESS="0x7433c7c768be4025ab791fb7b2942c3d9e309f3e"
PRIVATEKEY="11223344"
PORT=8899
```

### Option 2 : .ENV file

Check / modify the settings in the enclosed .env-dist file

The Ethereum node connects through a websocket on `localhost` port `8546`

### Option 3 : command line parameters

```
ethereumgasstationserver --web3hostws "wss://ropsten.infura.io/ws" --port 8887 --contractaddress 0x0000 --privatekey abc
```

Type `ethereumgasstationserver -h` for more info about the available parameters.

## Running

just type `ethereumgasstationserver` to start it up.

# API

## Endpoint
`GET /info`

Returns the supported tokens by this gasstation. + generic gasstation info.

## Request parameters
none

## Response format

```
{
 uplift : 10,
 netid: 1,
 gasstationaddress: '0x.....',
 maxgas: 1000000000,
 availablegas: '1000000000000000',
 tokens: {
   'swarm-city': {
    'address':'0xb9e7f8568e08d5659f5d29c4997173d84cdf2607',
    }
   ...
 }
}
```


## Endpoint
`GET /fillinfo/<address>`

Returns the configuration of this gasstation & the tokens that you could use this gasstation API with. It checks if the address fits the criteria, and has a balance of the given token.
It returns all the neccesary info to start using the gasstation with this token.

## Request parameters
* `address` : (String) the pubkey you want to get info for.

## Response format
```
{
 uplift : 10,
 netid: 1,
 gasstationaddress: '0x.....',
 availablegas: '10000',
 maxgas: 1000000000, 
 tokens : {
   'swarm-city': {
     tokenaddress: '0xb9e7f8568e08d5659f5d29c4997173d84cdf2607',
     balance : '2233001'
    }
    ...
  }
}
```
* `uplift` : (Number)  The uplift in percent that this gasstation takes on the market price
* `netid` : (Number> the network ID this gasstation is connected to
* `gasstationaddress` : (String) the address of the accompanying gasstation smart contract
* `availablegas` : (String) The amount of gas still present in this gassttion
* `maxgas` : the max amount of gas you can request in a request to fill up your account
* `tokens` : A an object containing the ticker + Ethereum token => address pairs that this gasstation accepts.


### On Error
```
{
 errorcode : 1
}
```

* `errorcode` :
	* 1 :'ACCOUNT_IS_CONTRACT'
	* 2: 'ACCOUNT_IS_NOT_EMPTY' 	
	* 3: 'ACCOUNT_IS_NOT_UNUSED' 



## Endpoint 
`POST /fillrequest`

Request a quote from the gasstation to exchange your token for gas. The service will reply with an offer that is cryptographically signed by the gasstation maintainer.

## Request parameters
```
{
 'address' : '0x1234.......5678',
 'gasrequested' : '100000000000',
 'tokenoffered' : 'swarm-city'
}
```

* `address` : (String) The address you want gas for
* `gasrequested` : (String) The amount of gas you want to receive
* `tokenoffered` : (String) a ticker of a token you want to send in return.

## Response format
```
{
 'gas' : '100000000000',
 'tokens' : '4455666',
 'validuntil' : 2304556,
 'r' : '0x...',
 's' : '0x...'
 'v' : 12,
}
```
* `gas` : (String) The amount of gas you will receive
* `tokens` : (String) The amount of tokens that this will cost
* `validuntil` : blocknumber until when this offer remains valid  
* `r` `s` `v` : Signature needed to  

## Endpoint
`POST /fill`

Executes the fillup.

## Parameters

```
{
 'allowancetx' : '0x.... ....',
 'address' : '0x1234.......5678',
 'token' : 'swarm-city'
 'gas' : '100000000000',
 'tokens' : '445566',
 'validuntil' : 2304556,
 'r' : '0x...',
 's' : '0x...'
 'v' : 12,
}
```
* `allowancetx` : a signed transaction giving an allowance to the gasstation for `tokensoffered` tokens.
* `address` : the address requesting gas
* `gas` `tokens` `validuntil` `r` `s` `v` : the response from your previous `/fillrequest` query.

# Get in touch

- Talk to us in Riot: https://riot.im/app/#/room/#ethereumgasstation:matrix.org


