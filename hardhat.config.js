/** @type import('hardhat/config').HardhatUserConfig */
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require('@openzeppelin/hardhat-upgrades');
module.exports = {
  solidity: "0.8.9",
  etherscan:{
    apiKey:etherScanVerifyKey
  },
  networks:{
    rinkeby:{
      url:"https://rinkeby.infura.io/v3/",
      accounts:[metamask_private_key],
    }
  }
};
