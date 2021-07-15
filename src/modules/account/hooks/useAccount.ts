import { useQuery } from '@redux-requests/react';
import { getJWTToken } from 'modules/common/utils/localStorage';
import { IAddEthereumChain } from 'modules/layout/components/Header/components/SelectChainDialog';
import { useCallback } from 'react';
import { useAppDispatch } from 'store/useAppDispatch';
import { BlockchainNetworkId } from '../../common/conts';
import { changeNetworkToSupported } from '../store/actions/changeNetworkToSupported';
import { connect } from '../store/actions/connect';
import { ISetAccountData, setAccount } from '../store/actions/setAccount';
import { updateAccount } from '../store/actions/updateAccount';
import { useWeb3React } from './useWeb3React';

let run = false;
let initRemoteDataRun = false;
export const useAccount = () => {
  const dispatch = useAppDispatch();

  const { loading, data, error } = useQuery<ISetAccountData | null>({
    type: setAccount.toString(),
  });

  const web3Data = useWeb3React();
  const token = getJWTToken() ?? '';
  if (!web3Data.loading && !data && token && !run) {
    run = true;
    dispatch(
      setAccount({
        token,
        ...web3Data,
      }),
    );
  }

  const address = data?.address;
  const isConnected = !!address;

  if (!initRemoteDataRun && web3Data?.address && isConnected) {
    initRemoteDataRun = true;
    dispatch({
      type: connect().type,
      payload: web3Data,
    });
  }

  const chainId = parseInt((data?.chainId ?? 0).toString());

  const isChainSupported =
    chainId === BlockchainNetworkId.smartchain ||
    chainId === BlockchainNetworkId.mainnet ||
    chainId === BlockchainNetworkId.rinkeby ||
    chainId === BlockchainNetworkId.heco;

  const walletSupportNetworkChange = !!data?.web3?.givenProvider;

  const handleConnect = useCallback(() => {
    dispatch(connect());
  }, [dispatch]);

  const handleChangeNetworkToSupported = useCallback(
    (chainConfig?: IAddEthereumChain) => {
      dispatch(changeNetworkToSupported(chainConfig));
    },
    [dispatch],
  );

  const handleUpdate = useCallback(
    updatedData => {
      dispatch(updateAccount(updatedData));
    },
    [dispatch],
  );

  return {
    loading,
    isConnected,
    isChainSupported,
    walletSupportNetworkChange,
    address,
    error,
    handleConnect,
    handleChangeNetworkToSupported,
    handleUpdate,
    chainId,
  };
};
