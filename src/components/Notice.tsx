import styled from 'styled-components';

import { theme } from '../styles';
import { Text } from './display';

const Notice = styled(Text)`
  background-color: ${theme.noticeForegroundColor};
  color: ${theme.alwaysWhiteForegroundColor};
  padding: 0.5rem;
  border-radius: 0.5rem;
  text-transform: uppercase;
`;

export default Notice;
