import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createUseStyles } from 'react-jss';

import {} from '../../components';
import { useApi } from '../../hooks';

const LiquidityMargin: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const api = useApi();

  return <div></div>;
};

const useStyles = createUseStyles(theme => ({
  root: {},
}));

export default LiquidityMargin;