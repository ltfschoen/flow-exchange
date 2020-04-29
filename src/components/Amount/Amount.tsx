import BN from 'bn.js';
import React from 'react';

import { useTokenInfo } from '../../hooks';
import { TokenInfo } from '../../services/Api';
import { fromPrecision, getCurrencySymbol, getValueFromHex } from '../../utils';
import { Spinner } from '../Spinner';
import { BaseProps } from '../../types';

function numberToAmount(
  number: BN,
  {
    postfix = '',
    prefix = '',
    minDigits = 3,
    precision = 0,
    useGrouping = true,
  }: {
    postfix?: string;
    prefix?: string;
    precision?: number;
    useGrouping?: boolean;
    minDigits?: number;
  } = {},
) {
  const value = fromPrecision(number, precision, { pad: true, minDigits, commify: useGrouping });

  return `${prefix}${value}${postfix ? ' ' : ''}${postfix}`;
}

function Amount(
  props: {
    value: BN | string | number;
    tokenId?: TokenInfo['id'];
    minDigits?: number;
    useGrouping?: boolean;
    hasPostfix?: boolean;
    hasPrefix?: boolean;
    loading?: boolean;
  } & BaseProps,
) {
  const {
    value,
    tokenId,
    minDigits = 3,
    useGrouping = true,
    hasPostfix = false,
    hasPrefix = false,
    loading = false,
    component: Component = 'span',
    ...other
  } = props;

  const token = useTokenInfo(tokenId);

  if (loading) return <Spinner />;

  const options: any = {
    useGrouping,
    minDigits,
    precision: 18,
  };

  if (token) {
    options.precision = token.precision;
    if (hasPostfix) options.postfix = token.name;
    if (hasPrefix) options.prefix = getCurrencySymbol(token.id);
  }

  const number = BN.isBN(value) ? value : new BN(getValueFromHex(value));

  return <Component {...other}>{numberToAmount(number, options)}</Component>;
}

export default Amount;