import Web3 from 'web3';

import ERC20_ABI from 'abi/erc20.json';
import FLOW_ABI from 'abi/flow.json';
import ORACLE_ABI from 'abi/oracle.json';
import MONEY_MARKET_ABI from 'abi/moneyMarket.json';
import POOL_ABI from 'abi/lp.json';

class Ethereum {
  constructor() {
    this.ethWeb3 = window.ethereum;
    this.ethProvider = new Web3(window.ethereum);
  }

  prepareBaseContract(addresses) {
    if (addresses !== null) {
      this.flowContract = new this.ethProvider.eth.Contract(FLOW_ABI, addresses.flow);
      this.poolContract = new this.ethProvider.eth.Contract(POOL_ABI, addresses.fallbackPool);
    } else {
      this.flowContract = null;
      this.poolContract = null;
    }
  }

  prepareTokenContract(addresses) {
    if (addresses !== null) {
      this.daiContract = new this.ethProvider.eth.Contract(ERC20_ABI, addresses.dai.contract);
      this.eurContract = new this.ethProvider.eth.Contract(ERC20_ABI, addresses.eur.contract);
      this.jpyContract = new this.ethProvider.eth.Contract(ERC20_ABI, addresses.jpy.contract);

      this.tokenContracts = {
        dai: this.daiContract,
        eur: this.eurContract,
        jpy: this.jpyContract,
      };
    } else {
      this.daiContract = null;
      this.eurContract = null;
      this.jpyContract = null;
      this.tokenContracts = null;
    }
  }

  prepareOracleContract(address) {
    if (address) {
      this.oracleContract = new this.ethProvider.eth.Contract(ORACLE_ABI, address);
    } else {
      this.oracleContract = null;
    }
  }

  prepareMoneyMarketContract(address) {
    if (address) {
      this.moneyMarketContract = new this.ethProvider.eth.Contract(MONEY_MARKET_ABI, address);
    } else {
      this.moneyMarketContract = null;
    }
  }
}

const ethereum = new Ethereum();
export default ethereum;
