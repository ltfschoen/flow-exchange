import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Form, InputNumber, Select, Table, Button } from 'antd';

import { AppState } from 'reducers';
import { actions } from 'types';
import { Panel, SolidButton } from 'components';
import { tradingPairs, deployment } from 'config';
import { ColumnProps } from 'antd/lib/table';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

interface OwnProps {
  name: string;
}

// where: {
//   owner: $owner: Bytes!
//   pair: $pair: Bytes!
// }

interface Props extends OwnProps {
  account: string;
  pairAddress: string;
  base: string;
  quote: string;
  leverage: number;
  isLong: boolean;
  liuqidationFee: number;
  liquidityPools: { address: string; name: string; spread: string; availability: number }[];
  isSending: boolean;

  onOpenPosition: (amount?: number, pool?: string) => void;
  onClosePosition: (id: string) => void;
}

const Container = styled(Panel)`
`;

const positionQuery = gql`
  {
    marginPositionEntities {
      positionId
      liquidityPool
      amount
      openPrice
      bidSpread
      liquidationFee
      closePrice
      liquidator
      closeOwnerAmount
    }
  }
`;

const positionsTableColumns: ColumnProps<any>[] = [
  {
    title: 'ID',
    dataIndex: 'positionId',
  }, {
    title: 'Liquidity Pool',
    dataIndex: 'liquidityPool',
  }, {
    title: 'Amount (DAI)',
    dataIndex: 'amount',
  }, {
    title: 'Open Price',
    dataIndex: 'openPrice',
  }, {
    title: 'Bid Spread (%)',
    dataIndex: 'bidSpread',
  }, {
    title: 'Liquidation Fee (DAI)',
    dataIndex: 'liquidationFee',
  }, {
    title: 'Close Price',
    dataIndex: 'closePrice',
  }, {
    title: 'Closed By',
    dataIndex: 'liquidator',
  }, {
    title: 'Closed Amount',
    dataIndex: 'closeOwnerAmount',
  }, {
    title: 'Profit / Lost (DAI)',
    dataIndex: 'profit',
  }, {
    render: (_text, record) => record.closePrice == null && <Button loading={record.isSending} onClick={record.onClose}>Close Position</Button>,
  },
];

const TradingPair: React.FC<Props> = ({
  account, pairAddress, base, quote, leverage, isLong, liuqidationFee, liquidityPools, isSending,
  onOpenPosition, onClosePosition,
}) => {
  const [amount, setAmount] = useState(20 as number | undefined);
  const [pool, setPool] = useState(liquidityPools[0].address as string | undefined);
  const { loading, error, data } = useQuery(positionQuery, {
    variables: {
      owner: account,
      pair: pairAddress,
    },
  });
  const positions = useMemo(() => data && data.marginPositionEntities.map((x: any) => ({
    ...x,
    amount: Number(x.amount).toFixed(2), // TODO: improve this
    liquidationFee: Number(x.liquidationFee).toFixed(2), // TODO: improve this
    closeOwnerAmount: Number(x.closeOwnerAmount).toFixed(2), // TODO: improve this
    profit: x.closePrice != null && Number(x.closeOwnerAmount - x.amount).toFixed(2), // TODO: improve this
    onClose: () => onClosePosition(x.positionId),
    isSending,
    liquidityPool: x.liquidityPool.substring(0, 8), // TODO: improve this
    liquidator: x.liquidator && x.liquidator.substring(0, 8), // TODO: improve this
  })), [data, onClosePosition, isSending]);
  return (
    <Container>
      <Form labelCol={{ span: 3 }}>
        <Form.Item label="Tradingi Pair">
          <span className="ant-form-text">{base} {quote}</span>
        </Form.Item>
        <Form.Item label="Leverage">
          <span className="ant-form-text">x{leverage} {isLong ? 'Long' : 'Short'}</span>
        </Form.Item>
        <Form.Item label="Liquidation Fee">
          <span className="ant-form-text">{liuqidationFee} DAI</span>
        </Form.Item>
        <Form.Item label="Amount (DAI)">
          <InputNumber min={liuqidationFee + 1} value={amount} onChange={setAmount} />
            &nbsp; = {amount && amount - 5} margin + { liuqidationFee } liquidation fee
        </Form.Item>
        <Form.Item label="Liquidity Pool">
          <Select placeholder="Please choose a liquidity pool" value={pool} onChange={setPool}>
            {
              liquidityPools.map(({ address, name, spread, availability }) =>
                <Select.Option value={address} key="address">{name}: Spread: {spread}, Availability: {availability} ({address})</Select.Option>)
            }
          </Select>
        </Form.Item>
        <Form.Item>
          <SolidButton disabled={!amount || !pool} loading={isSending} onClick={() => onOpenPosition(amount, pool)}>Open Position</SolidButton>
        </Form.Item>
      </Form>
      <Table columns={positionsTableColumns} loading={loading} dataSource={positions} rowKey="positionId" />
      { error && <div>Error: {error.message}</div> }
    </Container>
  );
};

const mapStateToProps = ({ margin: { openPosition, closePosition }, ethereum: { account } }: AppState, { name }: OwnProps) => {
  const pair = tradingPairs[name as keyof typeof tradingPairs]; // TODO: improve this
  return {
    account,
    pairAddress: deployment.kovan[name as keyof typeof deployment['kovan']], // TODO: improve this
    base: pair.base,
    quote: pair.quote,
    leverage: Math.abs(pair.leverage),
    isLong: pair.leverage > 0,
    liuqidationFee: 5, // TODO: read this value from contract
    liquidityPools: [ // TODO: read this from reducer
      {
        address: deployment.kovan.pool,
        name: 'Laminar',
        spread: '0.2%',
        availability: 100,
      },
      {
        address: deployment.kovan.pool2,
        name: 'Partner',
        spread: '0.3%',
        availability: 200,
      },
    ],
    isSending: openPosition.loading || closePosition.loading,
  };
};

const mapDispatchToProps = (dispatch: Dispatch, { name }: OwnProps) => ({
  onOpenPosition: (amount?: number, pool?: string) => {
    if (amount === undefined || pool === undefined) {
      return;
    }
    dispatch(actions.margin.openPosition.requested({ params: { name, amount, pool } }));
  },
  onClosePosition: (id: string) => {
    dispatch(actions.margin.closePosition.requested({ params: { name, id } }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(TradingPair);
