import React from 'react';
import { BaseProps } from '../../types';
import { createUseStyles } from 'react-jss';
import clsx from 'clsx';
import { Tooltip } from '../Tooltip';
import { NumberFormat } from '../NumberFormat';

type ThresholdProps = {
  low: number;
  high: number;
  value: number;
} & BaseProps;

const Threshold: React.FC<ThresholdProps> = ({ component: Component = 'span', low, high, value, ...other }) => {
  const classes = useStyles();

  let level = '';

  if (value > high) {
    level = 'S';
  } else if (value <= high && value > low) {
    level = 'MC';
  } else {
    level = 'FC';
  }

  return (
    <Component
      className={clsx({
        [classes.safe]: level === 'S',
        [classes.warning]: level === 'MC',
        [classes.danger]: level === 'FC',
      })}
      {...other}
    >
      <span className={classes.circel} />
      <Tooltip title={<NumberFormat value={value} options={{ mantissa: 2 }} percent />}>
        <span className={classes.tag}>{level}</span>
      </Tooltip>
    </Component>
  );
};

const useStyles = createUseStyles(theme => ({
  root: {},
  circel: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    display: 'inline-block',
    background: 'rgb(102, 102, 102)',
  },
  tag: {
    height: 16,
    'border-radius': 2,
    'background-color': 'rgb(102, 102, 102)',
    color: theme.alwaysWhiteForegroundColor,
    'font-size': 12,
    'margin-left': 4,
    padding: '2px 4px',
  },
  safe: {
    '& $circel, & $tag': {
      background: '#8fce65',
    },
  },
  warning: {
    '& $circel, & $tag': {
      background: '#f7b500',
    },
  },
  danger: {
    '& $circel, & $tag': {
      background: '#fa0000',
    },
  },
}));

export default Threshold;