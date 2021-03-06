import React from 'react';
import { useSubscription } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useLayoutEffect } from 'react';
import { useCurrentAccount, useGetTokenInfo } from '../../../hooks';
import { getLeverage, getValueFromHex } from '../../../utils';
import useMargin from '../hooks/useMargin';
import Swap from './Swap';
import Pl from './Pl';

const positionsOpenQuery = gql`
  subscription positionsSubscription($signer: String!) {
    Events(
      order_by: { blockNumber: desc }
      where: {
        method: { _eq: "PositionOpened" }
        extrinsic: { result: { _eq: "ExtrinsicSuccess" }, signer: { _eq: $signer } }
      }
    ) {
      args
      block {
        timestamp
      }
      extrinsic {
        hash
      }
    }
  }
`;

const positionsCloseQuery = gql`
  subscription positionsSubscription($signer: String!) {
    Events(
      order_by: { blockNumber: desc }
      where: {
        method: { _eq: "PositionClosed" }
        extrinsic: { result: { _eq: "ExtrinsicSuccess" }, signer: { _eq: $signer } }
      }
    ) {
      args
      block {
        timestamp
      }
      extrinsic {
        hash
      }
    }
  }
`;

const LaminarPositions = () => {
  const { address } = useCurrentAccount();
  const setState = useMargin(state => state.setState);
  const getTokenInfo = useGetTokenInfo();

  const { data: openedList } = useSubscription(positionsOpenQuery, {
    variables: {
      signer: address,
    },
  });

  const { data: closedList } = useSubscription(positionsCloseQuery, {
    variables: {
      signer: address,
    },
  });

  useLayoutEffect(() => {
    if (openedList && closedList) {
      console.log(openedList.Events)
      const list = openedList.Events.map((data: any) => {
        const positionId = `${data.args[1]}`;

        const closed = !!closedList.Events.find((data: any) => {
          return `${data.args[1]}` === positionId;
        });

        const pair = data.args[3];
        const [direction, leverage] = getLeverage(data.args[4]);

        const baseToken = getTokenInfo(pair.base);
        const quoteToken = getTokenInfo(pair.quote);

        const poolId = `${data.args[2]}`;
        const pairId = `${baseToken?.name}${quoteToken?.name}`;

        const openPrice = getValueFromHex(data.args[6]);
        const amt = getValueFromHex(data.args[5]);

        return {
          positionId,
          hash: data.extrinsic.hash,
          openedTime: data.block.timestamp,
          isClosed: !!closed,
          amt: getValueFromHex(data.args[5]),
          openPrice,
          pair,
          poolId,
          pairId,
          leverage,
          direction,
          swap: () => (
            <Swap
              key={data.extrinsic.hash}
              positionId={positionId}
              direction={direction === 'long' ? 'short' : 'long'}
              poolId={poolId}
              pairId={pairId}
            />
          ),
          pl: () => (
            <Pl
              held={amt}
              pair={pair}
              openPrice={openPrice}
              positionId={positionId}
              direction={direction === 'long' ? 'short' : 'long'}
              poolId={poolId}
              pairId={pairId}
            />
          ),
        };
      });

      setState(state => {
        state.positions = list;
      });

      return () => {};
    }

    return () => {};
  }, [openedList, closedList, setState, getTokenInfo]);

  return null;
};

export default LaminarPositions;
