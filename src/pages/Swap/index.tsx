import React from 'react';
import { useTranslation } from 'react-i18next';
import { createUseStyles } from 'react-jss';
import { Col, PoolName, Row, Text, Title, WebsiteTitle } from '../../components';
import { useLoadPoolEntities } from '../../store/useSyntheticPools';
import useSwap from './hooks/useSwap';
import RenderBalances from './RenderBalances';
import RenderExchange from './RenderExchange';
import RenderSyntheticPools from './RenderSyntheticPools';
import RenderTxRecords from './RenderTxRecords';

const Swap: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  useLoadPoolEntities();

  const selectPoolId = useSwap(state => state.selectPoolId);

  return (
    <div className={classes.root}>
      <WebsiteTitle value="Swap" />
      <Title type="page">{t('Swap')}</Title>
      <RenderExchange />
      <Text size="l">
        {t('Current Liquidity Provider')}: {selectPoolId ? <PoolName type="synthetic" value={selectPoolId} /> : '-'}
      </Text>
      <RenderSyntheticPools />
      <Row gutter={[24, 24]}>
        <Col span={16}>
          <RenderTxRecords />
        </Col>
        <Col span={8}>
          <RenderBalances />
        </Col>
      </Row>
    </div>
  );
};

const useStyles = createUseStyles(theme => ({
  root: {
    display: 'grid',
    'grid-gap': '1.5rem',
  },
}));

export default Swap;
