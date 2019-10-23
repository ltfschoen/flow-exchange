import types from 'types';
import validate from 'validate.js';
import { isEmpty, pathOr } from 'ramda';

import { parseRate } from 'reducers/spotRate.reducer';
import { fromWei } from 'helpers/unitHelper';


const INITIAL_STATE = {
  fromSymbol: 'DAI',
  toSymbol: 'EUR',
  fromAmount: 0,
  toAmount: 0,

  symbols: {},
  rate: {},
  isRedeem: false,

  isSwapping: false,
  isValid: true,
  validationErrors: {},
};

export const caculateRate = (rate, isRedeem) => {
  if (isEmpty(rate)) {
    return null;
  }
  if (isRedeem) {
    return (1 / fromWei(rate.bidPrice));
  }
  return (1 / fromWei(rate.askPrice));
};

const parseExchangeRate = (rate, fromSymbol, toSymbol) => {
  const { symbol } = rate;
  if ((fromSymbol === symbol) || (toSymbol === symbol)) {
    return parseRate(rate);
  }
  return {};
};

const parseRedeem = (symbols, fromToken) => {
  const isBase = pathOr(false, [fromToken, 'isBase'], symbols);
  if (isBase) {
    return false;
  }
  return true;
};

const valdiationResult = (state) => {
  const {
    fromAmount,
    toAmount,
  } = state;
  const attributes = { fromAmount, toAmount };
  const constraints = {
    fromAmount: {
      presence: true,
      numericality: {
        greaterThan: 0,
      },
    },
    toAmount: {
      presence: {
        allowEmpty: true,
      },
      numericality: {
        greaterThanOrEqualTo: 0,
      },
    },
  };
  const result = validate(attributes, constraints);
  if (result) {
    return {
      isValid: false,
      validationErrors: result,
    };
  }
  return {
    isValid: true,
    validationErrors: {},
  };
};

const reducer = (state = INITIAL_STATE, { type, payload }) => {
  switch (type) {
    case types.swapFromSymbol.changed:
      return {
        ...state,
        rate: {},
        isRedeem: parseRedeem(state.symbols, payload),
        fromSymbol: payload,
      };
    case types.swapToSymbol.changed:
      return {
        ...state,
        rate: {},
        toSymbol: payload,
      };
    case types.swapFromAmount.changed:
      return {
        ...state,
        fromAmount: payload,
      };
    case types.swapToAmount.changed:
      return {
        ...state,
        toAmount: payload,
      };

    case types.swapMint.requested:
    case types.swapRedeem.requested:
      return {
        ...state,
        isSwapping: true,
      };

    case types.swapMint.failed:
    case types.swapRedeem.failed:
      return {
        ...state,
        isSwapping: false,
      };

    case types.swapMint.completed:
    case types.swapRedeem.completed:
      return {
        ...state,
        isSwapping: false,
      };

    case types.swapValidation.changed:
      return {
        ...state,
        ...valdiationResult(state),
      };

    case types.marketSymbols.changed:
      return {
        ...state,
        symbols: payload,
      };

    case types.spotRate.completed:
      return {
        ...state,
        rate: parseExchangeRate(payload, state.fromSymbol, state.toSymbol),
      };

    default:
      return state;
  }
};

export default reducer;
