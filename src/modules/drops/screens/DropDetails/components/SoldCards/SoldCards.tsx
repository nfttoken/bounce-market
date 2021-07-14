import { Box, Typography } from '@material-ui/core';
import { useQuery } from '@redux-requests/react';
import {
  DropsDetailPoolState,
  IDropDetails,
} from 'modules/api/getOneDropsDetail';
import { BuyNFTRoutesConfig } from 'modules/buyNFT/BuyNFTRoutes';
import {
  ProductCard,
  ProductCardSkeleton,
} from 'modules/common/components/ProductCard';
import { getDropDetails } from 'modules/drops/actions/getDropDetails';
import { t } from 'modules/i18n/utils/intl';
import React from 'react';
import { uid } from 'react-uid';
import { CardsList } from '../CardsList';

const SKELETONS_COUNT = 2;

export const SoldCards = () => {
  const { data, loading } = useQuery<IDropDetails | null>({
    type: getDropDetails.toString(),
  });

  const soldNfts = (data?.poolsInfo || []).filter(
    poolInfo => poolInfo.state === DropsDetailPoolState.Closed,
  );

  const renderedCards = soldNfts.map(item => (
    <ProductCard
      isOnSale
      key={uid(item)}
      title={item.name}
      priceType="BNB"
      price={item.price}
      MediaProps={{
        category: 'image',
        src: item.fileUrl,
      }}
      href={BuyNFTRoutesConfig.DetailsNFT.generatePath(
        item.poolId,
        item.poolType,
      )}
      // todo: id is needed to do likes
      id={0}
      poolId={item.poolId}
    />
  ));

  const renderedSkeletons = Array(SKELETONS_COUNT)
    .fill(0)
    .map((_, i) => <ProductCardSkeleton key={uid(i)} />);

  if (!loading && !soldNfts.length) {
    return null;
  }

  return (
    <Box mb={5}>
      <Box mb={5}>
        <Typography variant="h2">{t('drop-details.sold')}</Typography>
      </Box>

      <CardsList>{loading ? renderedSkeletons : renderedCards}</CardsList>
    </Box>
  );
};