import { useSubscription } from '@apollo/react-hooks';
import { Spinner, Text } from 'components';
import gql from 'graphql-tag';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import * as theme from 'theme';

import { useShallowEqualSelector } from '../../hooks';
import CloseTrade from './closeTrade';
import OpenTrade from './openTrade';

// ----------
// Style
// ----------

const Container = styled.div``;

const CenterContainer = styled.div`
  flex: 1;
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ListHeader = styled.div`
  color: ${theme.lightForegroundColor};
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  border-bottom: 1px solid ${theme.borderColor};
  padding-bottom: 1rem;

  ${theme.respondTo.sm`
    display: none;
  `};

  .column {
    font-weight: ${theme.boldWeight};
    text-transform: uppercase;
    width: 12.5%;
  }

  .profit {
    text-align: right;
  }
`;

const Filter = styled.div``;

// ----------
// Query
// ----------
const positionQuery = gql`
  subscription marginPositionEntities($owner: Bytes!) {
    marginPositionEntities(first: 25, orderBy: openTime, orderDirection: desc, where: { owner: $owner }) {
      positionId
      liquidityPool
      amount
      openPrice
      closeSpread
      liquidationFee
      closePrice
      liquidator
      closeOwnerAmount
      openTime
      closeTime
      openTxhash
      closeTxhash
      pair {
        id
      }
    }
  }
`;

// ----------
// Interface
// ----------

export type StateProps = {
  account: string;
};

// ----------

const TradeList: React.FC = () => {
  const account = useShallowEqualSelector<AppState, StateProps>(({ provider: { account } }: AppState) => account);

  // TODO: Fix type
  const { loading: isLoading, data } = useSubscription(positionQuery, {
    variables: {
      owner: account,
    },
  });

  const positions = useMemo(() => data?.marginPositionEntities.map((event: any) => ({ ...event })), [data]);

  // const [displayPosition, setDisplayPosition] = useState('open' as string);

  if (isLoading) {
    return (
      <CenterContainer>
        <Spinner />
      </CenterContainer>
    );
  }

  // TODO: Refactor

  if (!positions || (positions as Array<any>).length <= 0) {
    return (
      <CenterContainer>
        <Text light size="l">
          No Transaction
        </Text>
      </CenterContainer>
    );
  }

  return (
    <Container>
      <Filter>
        {/* <SegmentedControl
          defaultValue={displayPosition}
          buttonStyle="solid"
          value={displayPosition}
          onChange={(e) => {setDisplayPosition(e.target.value)}}
        >
          <SegmentedControlItem value="open">Open</SegmentedControlItem>
          <SegmentedControlItem value="closed">Closed</SegmentedControlItem>
        </SegmentedControl> */}
      </Filter>
      <ListHeader>
        <div className="column pair">Symbol</div>
        <div className="column amount">B/S</div>
        <div className="column leverage">Leverage</div>
        <div className="column amount">Amount</div>
        <div className="column openPrice">Open</div>
        <div className="column closePrice">Close</div>
        <div className="column profit">P&amp;L</div>
        <div className="column action">&nbsp;</div>
      </ListHeader>
      {positions.map((position: any) => {
        if (!position.closePrice) {
          return (
            <OpenTrade
              key={`${position.pair.id}-${position.positionId}`}
              positionId={position.positionId}
              openPrice={position.openPrice}
              liquidityPool={position.liquidityPool}
              amount={position.amount}
              closeSpread={position.closeSpread}
              liquidationFee={position.liquidationFee}
              pair={position.pair.id}
              openTxhash={position.openTxhash}
            />
          );
        }
        return (
          <CloseTrade
            key={`${position.pair.id}-${position.positionId}`}
            openPrice={position.openPrice}
            closePrice={position.closePrice}
            amount={position.amount}
            pair={position.pair.id}
            closeOwnerAmount={position.closeOwnerAmount}
            openTxhash={position.openTxhash}
            closeTxhash={position.closeTxhash}
          />
        );
      })}
    </Container>
  );
};

export default TradeList;
