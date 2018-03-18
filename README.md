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
`GET /tokens`

## Request parameters
none

## Response format
``
{
'swarm-city':'0xb9e7f8568e08d5659f5d29c4997173d84cdf2607'
}
``

The response is an object containing the ticker + Ethereum token => address pairs that this gasstation accepts.

# Get in touch

- Talk to us in Riot: https://riot.im/app/#/room/#ethereumgasstation:matrix.org


