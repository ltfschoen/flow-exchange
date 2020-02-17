import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';

import { PrimaryButton, Separator, Text } from '../../components';
import { useApp, useExchange, useExchangeApi, usePools, useTokens } from '../../hooks';
import AmountInput from './AmountInput';
import ExchangeRate from './ExchangeRate';
import { EthereumOraclePrice, PolkadotOraclePrice } from './OraclePrice';
import { ActionBar, Currency, Detail, Divider, Entry, ExchangeIcon, Label, SwapContainer } from './swap.style';

const Exchange: React.FC = () => {
  const provider = useApp(state => state.provider);
  const api = useApp(state => state.provider?.api);
  const currentAccount = useApp(state => state.currentAccount);

  const isSwapping = useExchange(state => state.isSwapping);
  const isRedeem = useExchange(state => state.isRedeem);
  const isValid = useExchange(state => state.isValid);
  const availableFromTokens = useExchange(state => (state.isRedeem ? state.flowTokens : state.baseTokens));
  const availableToTokens = useExchange(state => (state.isRedeem ? state.baseTokens : state.flowTokens));
  const fromToken = useExchange(state => state.fromToken);
  const toToken = useExchange(state => state.toToken);
  const fromAmount = useExchange(state => state.fromAmount);
  const toAmount = useExchange(state => state.toAmount);
  const onFromTokenChange = useExchange(state => state.onFromTokenChange);
  const onToTokenChange = useExchange(state => state.onToTokenChange);
  const onFromAmountChange = useExchange(state => state.onFromAmountChange);
  const onToAmountChange = useExchange(state => state.onToAmountChange);
  const onSwapToken = useExchange(state => state.onSwapToken);
  const baseTokens = useExchange(state => state.baseTokens);
  const onFetchLiquidityPoolSpread = useExchange(state => state.onFetchLiquidityPoolSpread);
  const pool = usePools(state => state.defaultPool);
  const setCurrencyData = usePools(state => state.setCurrencyData);
  const updateBalances = useTokens(state => state.updateBalances);
  const { askSpread, bidSpread }: { askSpread?: number; bidSpread?: number } = usePools(state => {
    if (pool && baseTokens?.[0]) {
      const token = baseTokens[0];
      return state.getCurrencyData(pool.id, token.id) || {};
    }
    return {};
  });

  const [isLoadingSpread, setIsLoadingSpread] = useState(false);
  const [{ loading: isLoadingRate, data: rate }, setRate] = useState<{
    loading: boolean;
    data?: number;
  }>({ loading: false });

  let spread: number | undefined;

  if (bidSpread !== undefined && askSpread !== undefined) {
    spread = isRedeem ? bidSpread : askSpread;
  }

  const onSwap = () => {
    if (currentAccount && api && toToken && fromToken && pool) {
      useExchangeApi.setState(state => (state.isSwapping = true));

      const request = isRedeem
        ? api.redeem(currentAccount.address, pool.id, fromToken.name, fromAmount)
        : api.mint(currentAccount.address, pool.id, toToken.name, fromAmount);

      request.finally(() => {
        useExchangeApi.setState(state => (state.isSwapping = false));
        updateBalances();
      });
    }
  };

  useEffect(() => {
    const token = baseTokens?.[0];
    if (api && pool && token) {
      setIsLoadingSpread(true);
      api
        .getCurrencyData(pool.id, token.id)
        .then(data => {
          setCurrencyData(pool.id, token.id, data);
        })
        .finally(() => {
          setIsLoadingSpread(false);
        });
    }
  }, [api, pool, baseTokens, setCurrencyData]);

  useEffect(() => {
    if (fromAmount && toAmount === undefined) {
      onFromAmountChange(fromAmount, rate, spread);
    }

    if (toAmount && fromAmount === undefined) {
      onToAmountChange(toAmount, rate, spread);
    }
  }, [onFromAmountChange, onToAmountChange, fromAmount, toAmount, spread, rate]);

  useEffect(() => {
    if (fromToken && toToken) {
      onFetchLiquidityPoolSpread(isRedeem ? fromToken : toToken);
    }
  }, [onFetchLiquidityPoolSpread, fromToken, toToken, isRedeem]);

  const isLoading = isLoadingSpread || isLoadingRate;

  if (!fromToken || !toToken || !availableFromTokens || !availableToTokens) {
    return <SwapContainer padding={2} />;
  }

  return (
    <SwapContainer padding={2}>
      {provider?.impl === 'polkadot' ? (
        <PolkadotOraclePrice set={setRate} fromToken={fromToken} toToken={toToken} />
      ) : (
        <EthereumOraclePrice set={setRate} fromToken={fromToken} toToken={toToken} />
      )}
      <Entry>
        <Currency>
          <Label>
            <Text weight="bold" size="s" light>
              Send
            </Text>
          </Label>
          <AmountInput
            tokens={availableFromTokens}
            selectedToken={fromToken}
            onCurrencyChange={onFromTokenChange}
            onAmountChange={x => onFromAmountChange(x, rate, spread)}
            disabled={isSwapping}
            value={fromAmount}
            requireAuthorization={!isRedeem}
          />
        </Currency>
        <Divider>
          <ExchangeIcon
            onClick={() => {
              onSwapToken(fromToken, toToken, fromAmount, toAmount);
            }}
          >
            <FontAwesomeIcon icon="chevron-right" className="normalIcon" />
            <FontAwesomeIcon icon="exchange-alt" className="swapIcon" />
          </ExchangeIcon>
        </Divider>
        <Currency>
          <Label>
            <Text weight="bold" size="s" light>
              Recieve
            </Text>
          </Label>
          <AmountInput
            tokens={availableToTokens}
            selectedToken={toToken}
            onCurrencyChange={onToTokenChange}
            onAmountChange={x => onToAmountChange(x, rate, spread)}
            disabled={isSwapping}
            value={toAmount}
          />
        </Currency>
      </Entry>
      <Separator />
      <ActionBar>
        <Detail>
          <ExchangeRate isLoading={isLoading} spread={spread} rate={rate} fromToken={fromToken} toToken={toToken} />
        </Detail>
        <PrimaryButton
          size="large"
          loading={isSwapping}
          onClick={() => {
            onSwap();
          }}
          disabled={!isValid || isSwapping}
        >
          Exchange
        </PrimaryButton>
      </ActionBar>
    </SwapContainer>
  );
};

export default Exchange;