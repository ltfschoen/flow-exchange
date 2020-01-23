import _ from 'lodash';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

import ERC20Detailed from 'flow-protocol/artifacts/abi/ERC20Detailed.json';
import FlowProtocol from 'flow-protocol/artifacts/abi/FlowProtocol.json';
import LiquidityPoolInterface from 'flow-protocol/artifacts/abi/LiquidityPoolInterface.json';
import MoneyMarket from 'flow-protocol/artifacts/abi/MoneyMarket.json';
import FlowMarginProtocol from 'flow-protocol/artifacts/abi/FlowMarginProtocol.json';
import FlowToken from 'flow-protocol/artifacts/abi/FlowToken.json';
import MarginTradingPair from 'flow-protocol/artifacts/abi/MarginTradingPair.json';
import PriceOracleInterface from 'flow-protocol/artifacts/abi/PriceOracleInterface.json';
import FaucetInterface from 'flow-protocol/artifacts/abi/FaucetInterface.json';

import deployment from 'flow-protocol/artifacts/deployment.json';

// TODO: setup pipeline for mainnet
export const network: keyof typeof deployment = process.env.REACT_APP_NETWORK || ('kovan' as any);

if (!deployment[network]) {
  throw new Error(`Invalid network: ${network}`);
}

export const addresses = deployment[network];
export const explorer = 'https://kovan.etherscan.io';

export const tokens: { [key in TokenSymbol]: Token } = {
  DAI: {
    name: 'DAI',
    displayName: 'DAI',
    address: addresses.baseToken,
    currencySymbol: '$',
    icon: 'dollar-sign' as IconProp,
    isBaseToken: true,
  },
  fEUR: {
    name: 'EUR',
    displayName: 'Euro',
    address: addresses.fEUR,
    currencySymbol: '€',
    icon: 'euro-sign' as IconProp,
    isBaseToken: false,
  },
  fJPY: {
    name: 'JPY',
    displayName: 'Yen',
    address: addresses.fJPY,
    currencySymbol: '¥',
    icon: 'yen-sign' as IconProp,
    isBaseToken: false,
  },
  fXAU: {
    name: 'XAU',
    displayName: 'Gold',
    address: addresses.fXAU,
    currencySymbol: '',
    icon: 'cubes' as IconProp,
    isBaseToken: false,
  },
  fAAPL: {
    name: 'AAPL',
    displayName: 'Apple',
    address: addresses.fAAPL,
    currencySymbol: '',
    icon: 'award' as IconProp,
    isBaseToken: false,
  },
};

// TODO: Refactor these

export const isTokenSymbol = (symbol: TokenSymbol): symbol is TokenSymbol => (tokens as any)[symbol] != null;
export const isBaseTokenSymbol = (symbol: TokenSymbol): symbol is TokenSymbol => {
  const token = (tokens as any)[symbol];
  if (token === null) {
    return false;
  }
  return token.isBaseToken;
};

export const tradingPairs: { [key in TradingPairSymbol]: TradingPair } = {
  l10USDEUR: {
    symbol: 'l10USDEUR',
    base: 'DAI' as TokenSymbol,
    quote: 'fEUR' as TokenSymbol,
    leverage: 10,
    address: addresses.l10USDEUR,
    name: 'USDEUR 10× Long',
  },
  s10USDEUR: {
    symbol: 's10USDEUR',
    base: 'DAI' as TokenSymbol,
    quote: 'fEUR' as TokenSymbol,
    leverage: -10,
    address: addresses.s10USDEUR,
    name: 'USDEUR 10× Short',
  },
  l20USDJPY: {
    symbol: 'l20USDJPY',
    base: 'DAI' as TokenSymbol,
    quote: 'fJPY' as TokenSymbol,
    leverage: 20,
    address: addresses.l20USDJPY,
    name: 'USDJPY 20× Long',
  },
  s20USDJPY: {
    symbol: 's20USDJPY',
    base: 'DAI' as TokenSymbol,
    quote: 'fJPY' as TokenSymbol,
    leverage: -20,
    address: addresses.s20USDJPY,
    name: 'USDJPY 20× Short',
  },
  l20USDXAU: {
    symbol: 'l20USDXAU',
    base: 'DAI' as TokenSymbol,
    quote: 'fXAU' as TokenSymbol,
    leverage: 20,
    address: addresses.l20USDXAU,
    name: 'XAUUSD 20× Long',
  },
  s20USDXAU: {
    symbol: 's20USDXAU',
    base: 'DAI' as TokenSymbol,
    quote: 'fXAU' as TokenSymbol,
    leverage: -20,
    address: addresses.s20USDXAU,
    name: 'XAUUSD 20× Short',
  },
  l5USDAPPL: {
    symbol: 'l5USDAPPL',
    base: 'DAI' as TokenSymbol,
    quote: 'fAAPL' as TokenSymbol,
    leverage: 5,
    address: addresses.l5USDAPPL,
    name: 'AAPL 20× Long',
  },
  s5USDAPPL: {
    symbol: 's5USDAPPL',
    base: 'DAI' as TokenSymbol,
    quote: 'fAAPL' as TokenSymbol,
    leverage: -5,
    address: addresses.s5USDAPPL,
    name: 'AAPL 20× Short',
  },
};

export const tradingSymbols: { [key in TradingSymbol]: Trading } = {
  EURUSD: {
    name: 'EURUSD',
    long: 'l10USDEUR',
    short: 's10USDEUR',
    chartSymbol: 'EURUSD',
    inverted: false,
    leverage: 10,
    precision: 4,
  },
  USDJPY: {
    name: 'USDJPY',
    long: 's20USDJPY',
    short: 'l20USDJPY',
    chartSymbol: 'USDJPY',
    inverted: true,
    leverage: 20,
    precision: 2,
  },
  XAUUSD: {
    name: 'XAUUSD',
    long: 'l20USDXAU',
    short: 's20USDXAU',
    chartSymbol: 'XAUUSD',
    inverted: false,
    leverage: 20,
    precision: 2,
  },
};

export const liquidityPools: { [key: string]: Pool } = {
  POOL1: {
    key: 'POOL1',
    address: addresses.pool,
    name: 'Laminar',
    spread: 0.003, // TODO: Read from contract
  },
  POOL2: {
    key: 'POOL2',
    address: addresses.pool2,
    name: 'ACME',
    spread: 0.0031, // TODO: Read from contract
  },
};

/**
 * Find trading pair by address
 * @param address trading pair address
 * @returns tradingPair or undefined
 */
export const findTradingPairByAddress = (address: Address): TradingPair | undefined => {
  const pairs = Object.values(tradingPairs);
  return pairs.find(pair => pair.address.toLocaleLowerCase() === address.toLocaleLowerCase());
};

/**
 * Find trading info by address
 * @param address trading pair address
 * @returns trading info or undefined
 */
export const findTradingInfoByPairAddress = (
  address: Address,
): { symbol: Trading; direction: 'long' | 'short' } | undefined => {
  const pair = findTradingPairByAddress(address);
  if (!pair) {
    return undefined;
  }

  const symbols = Object.values(tradingSymbols);
  const symbol = symbols.find(s => s.long === pair.symbol || s.short === pair.symbol);

  if (symbol) {
    return {
      symbol,
      direction: symbol.long === pair.symbol ? 'long' : 'short',
    };
  }

  return undefined;
};

/**
 * Find trading pair from symbol
 * @param symbol TradingSymbol
 * @returns trading pair or undefined
 */
export const getTradingPairFromTradingSymbol = (symbol: TradingSymbol): TradingPair | undefined => {
  const trading = _.get(tradingSymbols, symbol);
  return _.get(tradingPairs, trading.long) || _.get(tradingPairs, trading.short);
};

/**
 * Find quote token from trading symbol
 * @param symbol TradingSymbol
 * @returns quote token or undefined
 */
export const getQuoteTokenFromTradingSymbol = (symbol: TradingSymbol): Token | undefined => {
  const pair = getTradingPairFromTradingSymbol(symbol);
  if (!pair) return undefined;
  return _.get(tokens, `${pair.quote}`);
};

/**
 * Find base token from trading symbol
 * @param symbol TradingSymbol
 * @returns base token or undefined
 */
export const getBaseTokenFromTradingSymbol = (symbol: TradingSymbol): Token | undefined => {
  const pair = getTradingPairFromTradingSymbol(symbol);
  if (!pair) return undefined;
  return _.get(tokens, `${pair.base}`);
};

export const abi = {
  ERC20: ERC20Detailed as any,
  FlowProtocol: FlowProtocol as any,
  LiquidityPoolInterface: LiquidityPoolInterface as any,
  MoneyMarket: MoneyMarket as any,
  FlowMarginProtocol: FlowMarginProtocol as any,
  FlowToken: FlowToken as any,
  MarginTradingPair: MarginTradingPair as any,
  PriceOracleInterface: PriceOracleInterface as any,
  FaucetInterface: FaucetInterface as any,
};

// TODO: make this configurable
export const subgraphEndpoints = {
  http: 'https://api.thegraph.com/subgraphs/name/laminar-protocol/flow-protocol-subgraph',
  ws: 'wss://api.thegraph.com/subgraphs/name/laminar-protocol/flow-protocol-subgraph',
};
