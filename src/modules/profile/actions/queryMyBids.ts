import { DispatchRequest, getQuery, RequestAction } from '@redux-requests/core';
import BigNumber from 'bignumber.js';
import {
  ISetAccountData,
  setAccount,
} from 'modules/account/store/actions/setAccount';
import {
  fetchItemsByFilter,
  IItemByFilter,
  ItemsChannel,
} from 'modules/overview/actions/fetchItemsByFilter';
import { AuctionType } from 'modules/overview/api/auctionType';
import { Store } from 'redux';
import { createAction } from 'redux-smart-actions';
import { RootState } from 'store';
import Web3 from 'web3';
import { IRecords } from '../api/records';
import { getRecords } from './getRecords';

export interface IMyBid extends IItemByFilter {
  poolType: AuctionType;
  poolId: number;
  price: BigNumber;
  token1: string;
  createTime: number;
}

export interface IQueryMyBids {
  claimList: IMyBid[];
  soldList: IMyBid[];
}

interface IQueryMyBidsArgs {
  channel: ItemsChannel;
}

export const queryMyBids = createAction<
  RequestAction<any, IQueryMyBids>,
  [IQueryMyBidsArgs]
>('queryMyBids', params => ({
  request: {
    promise: (async function () {})(),
  },
  meta: {
    getData: data => data,
    onRequest: (
      request: { promise: Promise<any> },
      action: RequestAction,
      store: Store<RootState> & { dispatchRequest: DispatchRequest },
    ) => ({
      promise: (async () => {
        const {
          data: { address },
        } = getQuery<ISetAccountData>(store.getState(), {
          type: setAccount.toString(),
        });

        const { data: records } = getQuery<IRecords | null>(store.getState(), {
          type: getRecords.toString(),
        });

        if (!records) {
          return [];
        }

        const tradeAuctions = records.tradeAuctions.map(item => ({
          ...item,
          price:
            item.lastestBidAmount !== '0'
              ? item.lastestBidAmount
              : item.amountMin1,
          poolType: AuctionType.EnglishAuction,
        }));

        const { data: itemsByFilter } = await store.dispatchRequest(
          fetchItemsByFilter({
            ids: tradeAuctions.map(item => item.tokenId),
            cts: tradeAuctions.map(item => item.token0),
            channel: params.channel,
          }),
        );

        if (!itemsByFilter) {
          return [];
        }

        const claimTradeAuctions = tradeAuctions
          .filter(item => {
            if (address.toLowerCase() === item.creator.toLowerCase()) {
              return !item.creatorClaimed;
            } else {
              return !item.bidderClaimed;
            }
          })
          .filter(item => item.lastestBidAmount !== item.amountMax1);

        const soldTradeAuctions = tradeAuctions.filter(
          item => !claimTradeAuctions.includes(item),
        );

        const claimList = claimTradeAuctions
          .map(pool => {
            const item = itemsByFilter.find(r => r.id === pool.tokenId);

            return {
              ...item,
              poolType: pool.poolType,
              poolId: pool.poolId,
              price: new BigNumber(Web3.utils.fromWei(pool.price)),
              token1: pool.token1,
              createTime: pool.createTime,
            } as IMyBid;
          })
          .filter(item => item.fileurl)
          .sort((a, b) => b.createTime - a.createTime);

        const soldList = soldTradeAuctions
          .map(pool => {
            const item = itemsByFilter.find(r => r.id === pool.tokenId);

            return {
              ...item,
              poolType: pool.poolType,
              poolId: pool.poolId,
              price: new BigNumber(Web3.utils.fromWei(pool.price)),
              token1: pool.token1,
              createTime: pool.createTime,
            } as IMyBid;
          })
          .sort((a, b) => b.createTime - a.createTime);

        return {
          claimList,
          soldList,
        } as IQueryMyBids;
      })(),
    }),
  },
}));