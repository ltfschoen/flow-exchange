import React from 'react';
import { Redirect, Route, Switch } from 'react-router';

import Margin from '../../_app/margin/margin';
import { useApp } from '../../hooks/useApp';
import Dashboard from '../Dashboard';
import Lending from '../Deposit';
import Home from '../Home';
import Layout from '../Layout';
import Liquidity from '../Liquidity';
import LiquidityCreate from '../Liquidity/LiquidityCreate';
import PoolDetail from '../Liquidity/PoolDetail';
import Swap from '../Swap';

const Routes: React.FC = () => {
  const api = useApp(state => state.api);

  return (
    <Switch>
      <Route exact path="/">
        <Home />
      </Route>
      <Route path="/dashboard">
        <Layout loading={!api}>
          <Dashboard />
        </Layout>
      </Route>
      <Route path="/lending">
        <Layout loading={!api}>
          <Lending />
        </Layout>
      </Route>
      <Route exact path="/margin">
        <Redirect to="/margin/POOL1/EURUSD" />
      </Route>
      <Route path="/margin/:pool/:tradingSymbol">
        <Margin />
      </Route>
      <Route exact path="/liquidity">
        <Layout loading={!api}>
          <Liquidity />
        </Layout>
      </Route>
      <Route path="/liquidity/new">
        <Layout loading={!api}>
          <LiquidityCreate />
        </Layout>
      </Route>
      <Route path="/liquidity/:poolId">
        <Layout loading={!api}>
          <PoolDetail />
        </Layout>
      </Route>
      <Route path="/swap">
        <Layout loading={!api}>
          <Swap />
        </Layout>
      </Route>
    </Switch>
  );
};

export default Routes;
