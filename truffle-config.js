require('babel-register');
require('babel-polyfill');

const path = require("path");

require('dotenv').config()
const HDWalletProvider = require("@truffle/hdwallet-provider");

const MNEMONIC = process.env.MNEMONIC
const ROPSTEN_URL = process.env.ROPSTEN_URL
const DEPLOYMENT_ACCOUNT = process.env.DEPLOYMENT_ACCOUNT

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(MNEMONIC, ROPSTEN_URL)
      },
      network_id: 3,
      gas: 4000000,
      gasPrice: 10000000000,
      from: DEPLOYMENT_ACCOUNT
    }
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      version: "0.8.7+commit.e28d00a7",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
  
}