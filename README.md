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

Just type `ethereumgasstationserver` to start it up.

It will start a REST server that implements the following API:


# REST API

## Endpoint
`GET /info/<address>`

Returns the configuration of this gasstation & the tokens that you could use this gasstation API with. It checks if the address fits the criteria, and has a balance of the given token.
It returns all the neccesary info to start using the gasstation with this token.

If you want to get generic info on the gasstation - don't provide the `address` parameter 

## Request parameters
* `address` : (String) the pubkey you want to get info for.

## Response format

### Without parameter
`GET /info`

Response code : `200`

```
{
  "uplift": 66,
  "netid": 3,
  "gasstationaddress": "0x5f0f9749192eee39978f14a0fef0e960cce45f50",
  "maxgas": "100000000",
  "availablegas": "1000000000000000000",
  "tokens": [
    {
      "ticker": "swarm-city",
      "address": "0x7932236cc4e5dbd840d9a52b009fed3582d4bf4f"
    }
  ]
}
```
* `uplift` : (Number)  The uplift in percent that this gasstation takes on the market price
* `netid` : (Number> the network ID this gasstation is connected to
* `gasstationaddress` : (String) the address of the accompanying gasstation smart contract
* `availablegas` : (String) The amount of gas still present in this gassttion
* `maxgas` : the max amount of gas you can request in a request to fill up your account
* `tokens` : An array containing the ticker + Ethereum token => address pairs that this gasstation accepts.

### With parameter - OK
Example: `GET /info/0x702029796b00f50BcFCE9b0Bb0C402bc453595D8`

Response code : `200`

```
{
	"uplift": 66,
	"netid": 3,
	"gasstationaddress": "0x5f0f9749192eee39978f14a0fef0e960cce45f50",
	"maxgas": "100000000",
	"availablegas": "1000000000000000000",
	"tokens": [{
		"ticker": "swarm-city",
		"address": "0x7932236cc4e5dbd840d9a52b009fed3582d4bf4f",
		"balance": "1000000000100000000"
	}]
}
```

In the case that the address is good for using the gasstation, the tokens array will be decorated with the token balance of the specific address.

### With parameter - error

Example: `GET /info/0x5f0f9749192eee39978f14a0fef0e960cce45f50`

Response code : `403`

```
{
	"uplift": 66,
	"netid": 3,
	"gasstationaddress": "0x5f0f9749192eee39978f14a0fef0e960cce45f50",
	"maxgas": "100000000",
	"availablegas": "1000000000000000000",
	"accountbalance": "1000000000000000000",
	"error": {
		"code": 1,
		"message": "account is a contract"
	}
}
```

`error.code` can be one of the following:

* `1 : ACCOUNT_IS_CONTRACT` The given account is a smart contract. This hinders the correct calculation of the cas cost to do the exchange - so the gasstation does not allow smart contracts to be filled-up.
* `2 : ACCOUNT_IS_NOT_EMPTY` The given account already has an ETH balance. It does not need gas.
* `3 : ACCOUNT_IS_NOT_UNUSED` The nonce of the account must be 1



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
 'serversig' : {
   'r' : '0x...',
   's' : '0x...'
   'v' : 12,
 }
}
```
* `gas` : (String) The amount of gas you will receive
* `tokens` : (String) The amount of tokens that this will cost
* `validuntil` : blocknumber until when this offer remains valid  
* `serversig` : The gastank parameters , signed by the gastank signer account  

## Endpoint
`POST /fill`

Executes the fillup.

## Parameters

```
{
 'allowancetx' : '0x.... ....',
 'address' : '0x1234.......5678',
 'tokenoffered' : 'swarm-city'
 'gas' : '100000000000',
 'tokens' : '445566',
 'validuntil' : 2304556,
 'serversig' : {
   'r' : '0x...',
   's' : '0x...'
   'v' : 12,
 },
 'clientsig' : {
   'r' : '0x...',
   's' : '0x...'
   'v' : 12,
 }
}
```
* `allowancetx` : a signed transaction giving an allowance to the gasstation for `tokensoffered` tokens.
* `address` : the address requesting gas
* `tokenoffered` : ticker of token offered
* `gas` `tokens` `validuntil` : the response from your previous `/fillrequest` query.
* `serversig` : The gastank parameters , signed by the gastank signer account - as received from your previous `/fillrequest` query.
* `serversig` : The gastank parameters , signed by the client (you) to allow the server to execute the exchange through the smart contract.  

# Get in touch

- Talk to us in Riot: https://riot.im/app/#/room/#ethereumgasstation:matrix.org


