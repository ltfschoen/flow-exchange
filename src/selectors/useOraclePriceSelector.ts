import { useMemo } from 'react';

import { TokenId } from '../services';
import useOracleValueSelector from './useOracleValueSelector';
import { fromPrecision } from '../utils';

export const useOraclePriceSelector = (
  baseTokenId: TokenId | null,
  quoteTokenId: TokenId | null,
  spread: number | null,
  direction: 'ask' | 'bid',
) => {
  const baseOracleValue = useOracleValueSelector(baseTokenId as any);
  const quoteOracleValue = useOracleValueSelector(quoteTokenId as any);

  return useMemo(() => {
    if (!baseOracleValue || !quoteOracleValue || !spread || !direction) return null;

    return (
      ((direction === 'ask' ? 1 + spread : 1 - spread) * Number(fromPrecision(baseOracleValue.value, 18))) /
      Number(fromPrecision(quoteOracleValue.value, 18))
    );
  }, [baseOracleValue, quoteOracleValue, spread, direction]);
};

export default useOraclePriceSelector;
