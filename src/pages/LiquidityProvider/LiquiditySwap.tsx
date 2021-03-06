import React from 'react';
import { OraclePrice } from '../../components';
import { useApi, useBaseTokenInfo, useGetTokenInfo } from '../../hooks';
import useSyntheticPools, { useLoadPoolEntities } from '../../store/useSyntheticPools';
import { notificationHelper, toPrecision } from '../../utils';
import RenderPoolsCollapse from './RenderPoolsCollapse';

const LiquiditySwap: React.FC = () => {
  const api = useApi();

  useLoadPoolEntities();

  const syntheticPoolInfo = useSyntheticPools(state => state.poolEntities.byId);
  const baseToken = useBaseTokenInfo();
  const getTokenInfo = useGetTokenInfo();

  const data = Object.values(syntheticPoolInfo).map(item => ({
    poolId: item.poolId,
    detail: null,
    owner: item.owner,
    options: item.options.map(({ tokenId, askSpread, bidSpread }) => {
      const tokenInfo = getTokenInfo(tokenId);

      return {
        id: tokenInfo?.symbol || '',
        bidSpread:
          bidSpread && baseToken ? (
            <OraclePrice spread={bidSpread} baseTokenId={tokenId} quoteTokenId={baseToken.id} direction="short" />
          ) : null,
        askSpread:
          askSpread && baseToken ? (
            <OraclePrice spread={askSpread} baseTokenId={tokenId} quoteTokenId={baseToken.id} direction="long" />
          ) : null,
      };
    }),
  }));

  const handleDeposit = async (address: string, poolId: string, amount: string) => {
    await notificationHelper(api.asLaminar.synthetic.depositLiquidity(address, poolId, toPrecision(amount)));
  };

  const handleWithdraw = async (address: string, poolId: string, amount: string) => {
    await notificationHelper(api.asLaminar.synthetic.withdrawLiquidity(address, poolId, toPrecision(amount)));
  };

  return (
    <RenderPoolsCollapse data={data} handleWithdraw={handleWithdraw} handleDeposit={handleDeposit} type="synthetic" />
  );
};

export default LiquiditySwap;
