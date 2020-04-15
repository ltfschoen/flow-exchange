import { TokenInfo } from '../services/Api';
import create, { GetState, SetState, State } from './createState';
import { useAppApi } from './useApp';

export interface AccountState extends State {
  balances: Record<TokenInfo['name'], string>;
  setBalance(tokenId: TokenInfo['name'], value: string): void;
  updateBalances(address: string): Promise<void>;
}

export const [useAccount, useAccountApi] = create<AccountState>(
  (set: SetState<AccountState>, get: GetState<AccountState>): AccountState => ({
    balances: {},
    setBalance(tokenId, value) {
      set(state => {
        state.balances[tokenId] = value;
      });
    },
    async updateBalances(address) {
      const { api, tokens } = useAppApi.getState();
      const { setBalance } = get();
      if (api && address && tokens && setBalance) {
        await Promise.all(
          tokens.map(token => {
            return api.getBalance(address, token.id).then(result => {
              setBalance(token.id, result);
            });
          }),
        );
      }
    },
  }),
);
