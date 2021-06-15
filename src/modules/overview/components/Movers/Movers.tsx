import { useQuery } from '@redux-requests/react';
import { BuyNFTRoutesConfig } from 'modules/buyNFT/BuyNFTRoutes';
import { ProductCard } from 'modules/common/components/ProductCard';
import { SwiperPreloader } from 'modules/common/components/SwiperPreloader';
import { fetchOverview } from 'modules/overview/actions/fetchOverview';
import { IItem } from 'modules/overview/api/getItems';
import { PROMO_ITEMS_COUNT } from 'modules/overview/const';
import { ISectionProps } from 'modules/uiKit/Section';
import React, { useMemo } from 'react';
import { uid } from 'react-uid';
import { MoversComponent } from './MoversComponent';
import { t } from 'modules/i18n/utils/intl';

export const Movers = (sectionProps: ISectionProps) => {
  const overviewQuery = useQuery<IItem[] | null>({
    type: fetchOverview.toString(),
  });

  const slicedItems = useMemo(
    () =>
      overviewQuery.data
        ? overviewQuery.data.slice(PROMO_ITEMS_COUNT, overviewQuery.data.length)
        : [],
    [overviewQuery.data],
  );

  const renderedItems = slicedItems.map(item => (
    <ProductCard
      key={uid(item)}
      id={item.id}
      poolId={item.poolId || 0}
      auctionType={item.poolType}
      isOnSale
      title={item.itemName || ''}
      price={item.price}
      priceType="BNB"
      endDate={item.closeAt}
      copies={item.supply}
      //TODO: https://fangible.atlassian.net/browse/FAN-124
      likes={undefined}
      href={
        item.poolId && item.poolType
          ? BuyNFTRoutesConfig.DetailsNFT.generatePath(
              item.poolId,
              item.poolType,
            )
          : ''
      }
      imgPreloader={<SwiperPreloader />}
      MediaProps={{
        category: 'image',
        src: item.fileUrl || '',
        imgClassName: 'swiper-lazy',
        isNativeLazyLoading: false,
        objectFit: 'contain',
      }}
      ProfileInfoProps={{
        subTitle: t('product-card.owner'),
        title: `${item.ownerAddress ?? ''}`,
        users: [
          {
            name: 'name',
            avatar: 'https://via.placeholder.com/32',
          },
        ],
      }}
    />
  ));

  return (
    <MoversComponent
      {...sectionProps}
      isLoading={overviewQuery.loading}
      itemCount={overviewQuery.data ? overviewQuery.data.length : 0}
    >
      {renderedItems}
    </MoversComponent>
  );
};
