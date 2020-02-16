import React from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { FormatBalance, Spinner } from '../../components';
import { theme } from '../../styles';

interface RowProps {
  highlight?: boolean;
}

const PoolRow = styled.div<RowProps>`
  color: ${theme.foregroundColor};
  background-color: ${props => (props.highlight ? theme.backgroundColor : 'transparent')};

  border-bottom: 1px solid ${theme.borderColor};

  padding-bottom: 1rem;
  padding-top: 1rem;
  font-size: ${theme.textNormalSize};

  display: flex;
  flex-direction: row;
  justify-content: space-between;

  .pool {
    width: 65%;
  }

  .available {
    width: 35%;
    text-align: right;
    font-variant-numeric: tabular-nums;
    font-weight: ${theme.boldWeight};
  }
`;

// ----------
// Interface
// ----------

interface Props {
  symbol: string;
  poolId: string;
  poolName: string;
  poolAvailability?: StateWithId<string>;
}

// ----------

const LiquidityPool: React.FC<Props> = ({ symbol, poolId, poolName, poolAvailability }) => {
  const { pool: selectedPool } = useParams();

  return (
    <Link to={`/margin/${poolId}/${symbol}`} key={poolId}>
      <PoolRow highlight={poolId === selectedPool}>
        <div className="symbol">{poolName}</div>
        <div className="ask">
          {poolAvailability && !poolAvailability.loading ? (
            <FormatBalance value={poolAvailability.value} options={{ currencySymbol: '$', output: 'currency' }} />
          ) : (
            <Spinner loading />
          )}
        </div>
      </PoolRow>
    </Link>
  );
};

export default LiquidityPool;
