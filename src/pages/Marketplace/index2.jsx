import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useHistory, useParams } from 'react-router'
import Search from '../component/Other/Search'
import { CardItem } from './CardItem'
import { PullRadioBox } from '@components/UI-kit'

import nav_audio from '@assets/images/icon/nav_audio.svg'
import nav_game from '@assets/images/icon/nav_game.svg'
import nav_image from '@assets/images/icon/nav_image.svg'
import nav_other from '@assets/images/icon/nav_other.svg'
import nav_video from '@assets/images/icon/nav_video.svg'
import icon_arts from '@assets/images/icon/image.svg'
import icon_comics from '@assets/images/icon/comics.svg'
import icon_sport from '@assets/images/icon/sport.svg'

import useAxios from '@/utils/useAxios'
import { Controller } from '@/utils/controller'
import { useQuery } from '@apollo/client'
import { QueryTradePools } from '@/utils/apollo'
import { useActiveWeb3React } from '@/web3'
import { SkeletonNFTCards } from '../component/Skeleton/NFTCard'
import { AUCTION_TYPE, NFT_CATEGORY } from '@/utils/const'
import Button from '@/components/UI-kit/Button/Button'
// import { History } from '@material-ui/icons'

const MarketplaceStyled = styled.div`
    width: 1100px;
    margin: 0 auto;
    margin-bottom: 30px;

    .nav_wrapper{
      
        width: 1100px;
        margin: 0 auto;
        margin-top: 50px;
        display: flex;
        padding-bottom: 16px;
        border-bottom: 2px solid rgba(0,0,0,.1);
        position: relative;
        li{
            padding: 7px 20px;
            height: 48px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            user-select: none;
            opacity: .4;
            img{
                margin-right: 7.15px;
            }

            &.active{
                background-color: rgba(0,0,0,.1);
                opacity: 1;
            }
        }
      .link {
        position: absolute;
        right: -20px;
      }
    }

    .filterBox{
        margin-top: 32px;
        /* margin-bottom: 50px; */
        display: flex;
        justify-content: space-between;
    }

    .list_wrapper{
        width: 1100px;
        margin: 0 auto;
        display: flex;
        flex-wrap: wrap;

        li{
            margin-top: 32px;
            margin-right: 17px;

            &:nth-child(4n){
                margin-right: 0;
            }
        }

        &.Video{
            li{
                margin-top: 32px;
                margin-right: 18px;

                &:nth-child(2n){
                    margin-right: 0;
                }
            }
        }
    }
`

const nav_list = [{
  name: 'Images',
  icon: nav_image,
  route: 'Images'
}, {
  name: 'Video',
  icon: nav_video,
  route: 'Video'
}, {
  name: 'Audios',
  icon: nav_audio,
  route: 'Audio'
}, {
  name: 'Game',
  icon: nav_game,
  route: 'Games'
}, {
  name: 'Others',
  icon: nav_other,
  route: 'Others'
}]

export default function Marketplace() {
  let { channel } = useParams()
  const history = useHistory()
  const { active } = useActiveWeb3React()
  // const { exportErc20Info } = useToken()

  
  const NavList = [
    {
      title: "Fine Arts",
      route: "FineArts",
      channelRequestParam: "Fine Arts",
    },
    {
      title: "Sports",
      route: "Sports",
      channelRequestParam: "Sports",
    },
    {
      title: "Comic Books",
      route: "Comics",
      channelRequestParam: "Conicbooks",
    },
  ]

  const { data } = useQuery(QueryTradePools)
  const { sign_Axios } = useAxios();
  const [tokenList, setTokenList] = useState([]);
  const [filterList, setFilterList] = useState([]);
  const [channelRequestParam, setChannelRequestParam] = useState(
    channel === NavList[0].route ? NavList[0].channelRequestParam :
    channel === NavList[1].route ? NavList[1].channelRequestParam :
    NavList[2].channelRequestParam);


  const [loading, setLoding] = useState(true)

  const [length, setLength] = useState(4);

  let type = 'Image'

  useEffect(() => {
    if (!active) return

    /* console.log("channelRequestParam", channelRequestParam) */

    if (data) {
      const tradePools = data.tradePools.map(item => ({
        ...item,
        poolType: AUCTION_TYPE.FixedSwap
      })).filter(item => item.state !== 1)
      const tradeAuctions = data.tradeAuctions.map(item => ({
        ...item,
        price: item.lastestBidAmount !== '0' ? item.lastestBidAmount : item.amountMin1,
        poolType: AUCTION_TYPE.EnglishAuction
      })).filter(item => item.state !== 1)
      // console.log(tradeAuctions)
      const pools = tradePools.concat(tradeAuctions);
      const list = pools.map(item => item.tokenId);
      // console.log(list)

      setLength(list.length);
      setLoding(true)
      // console.log(channel)
      /* const channel_2 = channel === 'Comic Books' ? 'Conicbooks' : channel */
      sign_Axios.post(Controller.items.getitemsbyfilter, {
        ids: list,
        category: type,
        channel: channelRequestParam
      })
        .then(res => {
          if (res.status === 200 && res.data.code === 1) {
            const list = res.data.data.map((item, index) => {
              const poolInfo = pools.find(pool => pool.tokenId === item.id);

              return {
                ...item,
                poolType: poolInfo.poolType,
                poolId: poolInfo.poolId,
                price: poolInfo.price,
                createTime: poolInfo.createTime,
                token1: poolInfo.token1
              }
            })
            .sort((a, b) => b.createTime - a.createTime);
            setTokenList(list);
            setFilterList(list);
            setLoding(false)
          }
        })
        .catch(() => { })
    }
    // eslint-disable-next-line
  }, [active, data, type, channelRequestParam, channel])

  const handleChange = (filterSearch) => {
    const list = tokenList.filter(item => item.itemname.toLowerCase().indexOf(filterSearch) > -1
      || item.owneraddress.toLowerCase().indexOf(filterSearch) > -1);
    setFilterList(list);
  }

  const renderListByType = (type) => {
    switch (type) {
      case 'Image':
        return <ul className={`list_wrapper ${type}`}>
          {filterList.map((item, index) => {
            return <li key={index}>
              <CardItem
                cover={item.fileurl}
                name={item.itemname}
                cardId={item.poolId}
                nftId={item.id}
                price={item.price}
                token1={item.token1}
                poolType={item.poolType}
              />
            </li>
          })}
        </ul>

      default:
        return <ul className={`list_wrapper ${type}`}>
          {filterList.map((item, index) => {
            return <li key={index}>
              <CardItem
                cover={item.fileurl}
                name={item.itemname}
                cardId={item.id}
                price={item.price}
                token1={item.token1}
                poolType={item.poolType}
              />
            </li>
          })}
        </ul>
    }
  }


  return (
    <MarketplaceStyled>
      {false && <ul className="nav_wrapper">
        {nav_list.map((item) => {
          return <li key={item.name} className={type === item.route ? 'active' : ''} onClick={() => {
            history.push(`/Marketplace/${item.route}`)
          }}>
            <img src={item.icon} alt="" />
            <p>{item.name}</p>
          </li>
        })}
      </ul>}

      <ul className="nav_wrapper">
        {/* {'Fine Arts、Sports、Comic Books'.split('、').map(e => ({ name: e })).map((item) => { */}
        {NavList.map( nav =>  {
          return <li key={nav.title} className={channel === nav.route ? 'active' : ''} onClick={
            () => {
              setChannelRequestParam(nav.channelRequestParam)
              history.push('/Marketplace/'+nav.route)
            // setChannelRequestParam(item.name)
          }}>
            <p className="flex flex-center-y"><img src={
              nav.title === NFT_CATEGORY.FineArts ? icon_arts :
              nav.title === NFT_CATEGORY.Sports ? icon_sport :
              nav.title === NFT_CATEGORY.ComicBooks ? icon_comics :
                    ''
            } alt="" />{nav.title}</p>
          </li>
        })}
        <li className="link"><Button onClick={() => {history.push('/MyMarket/Image')}}>My Market</Button></li>
      </ul>
      <div className="filterBox">
        <Search placeholder={'Search Items and Accounts'} onChange={handleChange} />

        <PullRadioBox prefix={'Category:'} width={'205px'} options={[{ value: 'Image' }]} defaultValue='Image' onChange={(item) => {
          // console.log(item)
        }} />

        <PullRadioBox prefix={'Currency:'} width={'205px'} options={[{ value: 'ETH' }]} defaultValue='ETH' onChange={(item) => {
          // console.log(item)
        }} />

        <PullRadioBox prefix={'Sort by:'} width={'204px'} options={[{ value: 'New' }, { value: 'Popular' }]} defaultValue='New' onChange={(item) => {
          // console.log(item)
        }} />
      </div>

      {loading && <SkeletonNFTCards n={length} ></SkeletonNFTCards>}
      {renderListByType(type)}

      {/* <PagingControls /> */}
    </MarketplaceStyled>
  )
}


