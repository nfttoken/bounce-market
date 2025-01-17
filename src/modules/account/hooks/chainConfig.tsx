import { TokenSymbol } from 'modules/common/types/TokenSymbol';
import { ReactComponent as EthereumIcon } from '../assets/ethereum.svg';
import { ReactComponent as BinanceIcon } from '../assets/binance.svg';
import { ReactComponent as SolanaIcon } from '../assets/solana.svg';
import {
  BlockchainNetworkId,
  getBlockChainExplorerAddress,
} from 'modules/common/conts';
import { t } from 'modules/i18n/utils/intl';

export type ChainType = 1 | 4 | 56 | 1111;

export const getChainConfig = (tarChain: ChainType) => {
  const chainList: {
    [key in ChainType]: any;
  } = {
    1: {
      icon: <EthereumIcon />,
      title: t('header.select-chain.eth'),
      subTitle: '',
      chainConfig: {
        chainId: '0x1',
        chainName: 'Ethereum Chain Mainnet',
        nativeCurrency: {
          name: 'Ethereum',
          symbol: TokenSymbol.ETH,
          decimals: 18,
        },
        rpcUrls: [
          'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
        ],
        blockExplorerUrls: [
          getBlockChainExplorerAddress(BlockchainNetworkId.mainnet),
        ],
      },
    },
    4: {
      icon: <EthereumIcon />,
      title: 'Rinkeby',
      subTitle: '',
      chainConfig: {
        chainId: '0x4',
        chainName: 'Rinkeby',
        nativeCurrency: {
          name: 'Ethereum',
          symbol: TokenSymbol.ETH,
          decimals: 18,
        },
        rpcUrls: [
          'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
        ],
        blockExplorerUrls: [
          getBlockChainExplorerAddress(BlockchainNetworkId.rinkeby),
        ],
      },
    },
    56: {
      icon: <BinanceIcon />,
      title: t('header.select-chain.bnb'),
      subTitle: '',
      chainConfig: {
        chainId: '0x38',
        chainName: 'Binance Smart Chain Mainnet',
        nativeCurrency: {
          name: 'Binance',
          symbol: TokenSymbol.BNB,
          decimals: 18,
        },
        rpcUrls: ['https://bsc-dataseed4.binance.org'],
        blockExplorerUrls: [
          getBlockChainExplorerAddress(BlockchainNetworkId.smartchain),
        ],
      },
    },
    1111: {
      icon: <SolanaIcon />,
      title: t('header.select-chain.solana'),
      subTitle: '',
      chainConfig: {
        chainId: '0x1bf52', // 随便定的
        chainName: 'Solana Mainnet',
        nativeCurrency: {
          name: 'Solana',
          symbol: TokenSymbol.Solana,
          decimals: 18,
        },
        rpcUrls: ['https://api.mainnet-beta.solana.com'],
        blockExplorerUrls: ['https://explorer.solana.com/'],
      },
    },
  };

  return chainList[tarChain];
};
