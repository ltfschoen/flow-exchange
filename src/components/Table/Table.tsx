import React from 'react';
import { Table as AntdTable } from 'antd';
import { createUseStyles } from 'react-jss';
import clsx from 'clsx';

type TableProps = React.ComponentProps<typeof AntdTable>;

const Comp: React.FC<TableProps> = ({ className, ...other }) => {
  const classes = useStyles();

  return <AntdTable scroll={{ x: true }} className={clsx(className, classes.root)} pagination={false} {...other} />;
};

const useStyles = createUseStyles(theme => ({
  root: {
    '& .ant-table thead > tr > th': {
      background: theme.lightBackgroundColor,
      padding: '1rem 1rem',
      'font-size': '1rem',
      'border-top': `solid 1px ${theme.keyColorGrey}`,
      'border-bottom': `solid 1px ${theme.keyColorGrey}`,
    },
    '& .ant-table tbody > tr > td': {
      color: theme.textColor.greyColor3,
      padding: '1rem 1rem',
      'font-size': '1rem',
    },
  },
}));

export default Comp;
