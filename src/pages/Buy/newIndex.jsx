import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components'
import use_FS_Hook from './use_FS_Hook'
import use_EA_Hook from './use_EA_Hook'
import { OtherButton, Button } from '@components/UI-kit'
import { AutoStretchBaseWidthOrHeightImg } from "../component/Other/autoStretchBaseWidthOrHeightImg";
import BounceFixedSwapNFT from '@/web3/abi/BounceFixedSwapNFT.json'
import BounceEnglishAuctionNFT from '@/web3/abi/BounceEnglishAuctionNFT.json'
import { getContract, useActiveWeb3React } from "@/web3";
import useTransferModal from "@/web3/useTransferModal";
import ConfirmCancelModal from './components/ConfirmCancelModal'
import { getFixedSwapNFT, getEnglishAuctionNFT } from "@/web3/address_list/contract";
import NewPullDown from './components/NewPullDown'
import { NumberInput } from '@components/UI-kit'

import icon_altAvatar from './assets/icon_altAvatar.svg'
import icon_time from './assets/icon_time.svg'
import { numToWei, weiDiv, weiMul, weiToNum } from '@/utils/useBigNumber';
import TradingHistory from './components/TradingHistory';
import { useLazyQuery } from '@apollo/client';
import { QueryFixedSwapPool, QueryEnglishAuction } from '@/utils/apollo';
import { getEllipsisAddress } from '@/utils/utils';
import Web3 from 'web3';
import { formatDistanceToNow } from 'date-fns';
import { AUCTION_TYPE } from '@/utils/const';
import { ZERO_ADDRESS } from '@/web3/address_list/token';


const NewIndexStyled = styled.div`
    width: 1100px;
    margin: 0 auto;
    .crumbs{
        display: flex;
        margin-top: 24px;
        li{
            font-size: 12px;
            line-height: 14.32px;
            color: rgba(31,25,27,1,.8);
            cursor: pointer;
            &::after{
                content: '/';
                margin:0px 5px;
            }

            &:last-child::after{
                content: ''
            }

            &:last-child{
                color: rgba(31,25,27,.4);
            }
        }
    }

    .container{
        display: flex;
        justify-content: space-between;
        margin-top: 24px;
        .container_left{
            .btn_group{
                margin-top: 16px;
                button{
                    margin-right: 12px;
                }
            }
        }

        .container_right{
            width: 540px;
            .row1 {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .seller{
                display: flex;
                flex-direction: column;
                .info{
                    display: flex;
                    align-items: center;
                    margin-top: 15px;
                    img{
                        margin-right: 8px;
                    }
                    p{
                        font-size: 14px;
                        color: rgba(31,25,27,.4);
                        a{
                            color: rgba(18,78,235,.8);
                        }
                    }

                    .close_time{
                        display: flex;
                        align-items: center;
                        height: 28px;
                        box-sizing: border-box;
                        border: 1px solid rgba(0,0,0,.2);
                        padding: 0 12px;
                        font-size: 14px;
                        font-weight: 400;
                        color: rgba(31,25,27,.5);
                        margin-left: 16px;
                    }
                }

                .desc{
                    margin-top: 20px;
                    p{
                        font-size: 14px;
                        line-height: 16.7px;
                        color: rgba(31,25,27,.7);
                        font-weight: 400;
                        margin-bottom: 10px;
                    }
                    span{
                        color: rgba(0,117,255,1);
                        font-weight: 500;
                        cursor: pointer;
                    }
                }
            }

            .bidInfo{
                display: flex;
                justify-content: space-between;
                margin-top: 32px;
                div{
                    h5{
                        font-size: 13px;
                        color: rgba(0,0,0,.6);
                        font-weight: 700;
                        margin-bottom: 8px;
                    }

                    h3{
                        font-size: 30px;
                        span{
                            font-size: 16px;
                            font-weight: 500;
                            color: rgba(31,25,27,.4);
                        }
                    }
                }
            }

            .btn_group{
                display: flex;
                flex-wrap:wrap;
                justify-content: space-between;
                margin-top: 21px;
            }


            .Link_MakeOffer {
                margin-top: 15px;
            }

            .pullInfoBox{
                margin-top: 15px;
                margin-bottom: 80px;

                border-top: 1px solid rgba(0,0,0,0.1);
            }
        }
        
    }

    .token-info{
        >div{
            margin-bottom: 12px;
            font-size: 12px;
            >p{
                :first-child{
                    color: #000;
                }
                :last-child{
                    color: rgba(31,25,27,0.5);
                }
            }
        }
    }
`

export default function NewIndex() {
    const { library, account, chainId, active } = useActiveWeb3React()
    const { poolId, aucType } = useParams()
    const { showTransferByStatus } = useTransferModal()
    const { nftInfo, poolInfo } = aucType === AUCTION_TYPE.FixedSwap ? use_FS_Hook(poolId) : use_EA_Hook(poolId)
    const [isLoading, setIsLoading] = useState(false)
    const [btnText, setBtnText] = useState('Place a bid')
    const [amount, setAmount] = useState(1)
    const [bidPrice, setBidPrice] = useState()
    const [minPrice, setMinPrice] = useState(0)
    const [openModal, setOpenModal] = useState(false)

    useEffect(() => {

        console.log(nftInfo, poolInfo)
        if (!active || !nftInfo.contractaddress || !poolInfo.poolType) {
            setIsLoading(true)
            setBtnText('loading ...')
            return
        }

        if (poolInfo.status === 'Live') {
            setIsLoading(false)
            setBtnText('Place a bid')
        } else {
            setBtnText('Sold Out')
        }

        if (poolInfo.creatorCanceledP) {
            setBtnText('Seller Canceled')
            setIsLoading(true)
        }
        // eslint-disable-next-line
    }, [active, nftInfo, poolInfo])

    useEffect(() => {
        console.log(poolInfo)
        if (poolInfo.poolType === 'EA' && poolInfo.status === 'Live') {
            if (poolInfo.bidCountP === '0') {
                setMinPrice(weiToNum(poolInfo.amountMin1))
            } else {
                const price = weiMul(weiToNum(poolInfo.amountMin1), 1.05)
                setMinPrice(price)
            }
        }
        // eslint-disable-next-line
    }, [poolInfo])


    const handelBid = async () => {
        setIsLoading(true)
        if (poolInfo.nftType === '0') {
            const BounceFixedSwapNFT_CT = getContract(library, BounceFixedSwapNFT.abi, getFixedSwapNFT(chainId))

            BounceFixedSwapNFT_CT.methods.swap(poolId, poolInfo.amountTotal0)
                .send({ from: account, value: poolInfo.amountTotal1 })
                .on('transactionHash', hash => {
                    // setBidStatus(pendingStatus)
                    showTransferByStatus('pendingStatus')
                })
                .on('receipt', async (_, receipt) => {
                    // console.log('bid fixed swap receipt:', receipt)
                    // setBidStatus(successStatus)
                    showTransferByStatus('successStatus')
                })
                .on('error', (err, receipt) => {
                    // setBidStatus(errorStatus)
                    showTransferByStatus('errorStatus')
                })
        } else {
            const BounceFixedSwapNFT_CT = getContract(library, BounceFixedSwapNFT.abi, getFixedSwapNFT(chainId))

            const _amount0 = amount
            const _amount1 = numToWei(weiMul(weiDiv(weiToNum(poolInfo.amountTotal1, poolInfo.token1.decimals), poolInfo.amountTotal0), amount))

            // console.log(_amount0, _amount1)

            BounceFixedSwapNFT_CT.methods.swap(poolId, _amount0)
                .send({ from: account, value: _amount1 })
                .on('transactionHash', hash => {
                    // setBidStatus(pendingStatus)
                    showTransferByStatus('pendingStatus')
                })
                .on('receipt', async (_, receipt) => {
                    // console.log('bid fixed swap receipt:', receipt)
                    // setBidStatus(successStatus)
                    showTransferByStatus('successStatus')
                })
                .on('error', (err, receipt) => {
                    // setBidStatus(errorStatus)
                    showTransferByStatus('errorStatus')
                })
        }
    }


    const handelEnglishAuctionBid = async (amountMax1) => {
        setIsLoading(true)
        const BounceEnglishAuctionNFT_CT = getContract(library, BounceEnglishAuctionNFT.abi, getEnglishAuctionNFT(chainId))

        const _amount1 = amountMax1 || numToWei(bidPrice)
        console.log(_amount1)

        BounceEnglishAuctionNFT_CT.methods.bid(poolId, _amount1)
            .send({ from: account, value: _amount1 })
            .on('transactionHash', hash => {
                // setBidStatus(pendingStatus)
                showTransferByStatus('pendingStatus')
            })
            .on('receipt', async (_, receipt) => {
                // console.log('bid fixed swap receipt:', receipt)
                // setBidStatus(successStatus)
                showTransferByStatus('successStatus')
            })
            .on('error', (err, receipt) => {
                // setBidStatus(errorStatus)
                showTransferByStatus('errorStatus')
            })
    }

    const handelFixedSwapCancel = async () => {
        const BounceFixedSwapNFT_CT = getContract(library, BounceFixedSwapNFT.abi, getFixedSwapNFT(chainId))

        BounceFixedSwapNFT_CT.methods.cancel(poolId)
            .send({ from: account })
            .on('transactionHash', hash => {
                // setBidStatus(pendingStatus)
                showTransferByStatus('pendingStatus')
            })
            .on('receipt', async (_, receipt) => {
                // console.log('bid fixed swap receipt:', receipt)
                // setBidStatus(successStatus)
                showTransferByStatus('successStatus')
            })
            .on('error', (err, receipt) => {
                // setBidStatus(errorStatus)
                showTransferByStatus('errorStatus')
            })
    }

    const bidderClaim = async () => {
        const BounceEnglishAuctionNFT_CT = getContract(library, BounceEnglishAuctionNFT.abi, getEnglishAuctionNFT(chainId))
        BounceEnglishAuctionNFT_CT.methods.bidderClaim(poolId)
            .send({ from: account })
            .on('transactionHash', hash => {
                // setBidStatus(pendingStatus)
                showTransferByStatus('pendingStatus')
            })
            .on('receipt', async (_, receipt) => {
                // console.log('bid fixed swap receipt:', receipt)
                // setBidStatus(successStatus)
                showTransferByStatus('successStatus')
            })
            .on('error', (err, receipt) => {
                // setBidStatus(errorStatus)
                showTransferByStatus('errorStatus')
            })
    }

    const renderByAucType = () => {
        if (aucType === AUCTION_TYPE.FixedSwap) {
            return <>
                <NumberInput
                    className='input_amount'
                    title='Buy Amount'
                    width='100%'
                    isInteger={true}
                    maxVal={parseInt(poolInfo.amountTotal0) - parseInt(poolInfo.swappedAmount0P)}
                    minVal={1}
                    defaultValue={1}
                    onValChange={(val) => {
                        setAmount(val)
                    }}
                    disabled={poolInfo.nftType === '1' && false}
                />

                <div className="bidInfo">
                    <div>
                        <h5>Top Bid</h5>
                        <h3>{poolInfo.token1 && weiMul(weiDiv(weiToNum(poolInfo.amountTotal1, poolInfo.token1.decimals), poolInfo.amountTotal0), amount)} {poolInfo.token1 && poolInfo.token1.symbol}
                            <span>{poolInfo.token1 && ` ( $ ${weiMul(poolInfo.token1.price, weiMul(weiDiv(weiToNum(poolInfo.amountTotal1, poolInfo.token1.decimals), poolInfo.amountTotal0), amount))} ) `}</span></h3>
                    </div>

                    <div>
                        <h5>Amount</h5>
                        <h3>{(poolInfo.amountTotal0 && poolInfo.swappedAmount0P) ?
                            `${parseInt(poolInfo.amountTotal0) - parseInt(poolInfo.swappedAmount0P)} / ${poolInfo.amountTotal0}` : '0 / 0'}</h3>
                    </div>
                </div>


                <div className="btn_group">
                    <Button primary width='262px' height='48px' disabled={isLoading || poolInfo.status !== 'Live'}
                        onClick={handelBid}
                    >{btnText}</Button>
                </div>

                <div className="Link_MakeOffer">
                    <StyledLink to="#">Make Offer</StyledLink>
                </div>
                
            </>
        } else if (aucType === AUCTION_TYPE.EnglishAuction) {
            return <>


                <div className="bidInfo">
                    <div>
                        <h5>Asking price</h5>
                        <h3>{poolInfo.token1 && weiToNum(poolInfo.amountMin1, poolInfo.token1.decimals)} {poolInfo.token1 && poolInfo.token1.symbol}
                            <span>{poolInfo.token1 && ` ( $ ${weiMul(poolInfo.token1.price, weiToNum(poolInfo.amountMin1, poolInfo.token1.decimals))} ) `}</span></h3>
                    </div>

                    <div>
                        <h5>Total Amount</h5>
                        <h3>{poolInfo.tokenAmount0 && `${poolInfo.tokenAmount0}`}</h3>
                    </div>
                </div>

                <div className="bidInfo">
                    <div>
                        <h5>Current Price</h5>
                        <h3>{poolInfo.currentBidderAmount && weiToNum(poolInfo.currentBidderAmount, poolInfo.token1.decimals)} {poolInfo.token1 && poolInfo.token1.symbol}
                            <span>{poolInfo.token1 && ` ( $ ${weiMul(poolInfo.token1.price, weiToNum(poolInfo.currentBidderAmount, poolInfo.token1.decimals))} ) `}</span></h3>
                    </div>

                    <div>
                        <h5>Current Round</h5>
                        <h3>{poolInfo.bidCountP && `${poolInfo.bidCountP}`}</h3>
                    </div>
                </div>

                <NumberInput
                    className='input_amount'
                    title={`I'll make an offer`}
                    width='100%'
                    maxVal={poolInfo.token1 && poolInfo.token1.balance}
                    // minVal={minPrice}
                    defaultValue={minPrice}
                    onValChange={(val) => {
                        setBidPrice(val)
                    }}
                    afterFix={poolInfo.token1 && `Balance: ${poolInfo.token1.balance} ${poolInfo.token1.symbol}`}
                    disabled={isLoading || poolInfo.status !== 'Live'}
                />

                <div className="btn_group">
                    <Button primary width='262px' height='48px' disabled={isLoading || poolInfo.status !== 'Live'}
                        onClick={() => { handelEnglishAuctionBid() }}
                    >{btnText}</Button>
                    {poolInfo.amountMax1 && <Button width='262px' disabled={isLoading || poolInfo.status !== 'Live'} height='48px' onClick={() => {
                        handelEnglishAuctionBid(poolInfo.amountMax1)
                    }}>Buy now for {weiToNum(poolInfo.amountMax1)} ETH</Button>}
                    {poolInfo.status === 'Close' && poolInfo.currentBidderP === account && !poolInfo.myClaimedP &&
                        < Button onClick={() => {
                            bidderClaim()
                        }} width='100%' height='48px' primary marginTop={'12px'}>
                            Claim Bid NFT
                    </Button>}

                    {poolInfo.status === 'Close' && poolInfo.currentBidderP === account && poolInfo.myClaimedP &&
                        < Button onClick={() => {
                            bidderClaim()
                        }} width='100%' height='48px' primary marginTop={'12px'} disabled>
                            You have successfully bid and claimed
                    </Button>}

                    {poolInfo.status === 'Close' && poolInfo.creator === account && !poolInfo.creatorClaimedP &&
                        < Button onClick={() => {
                            bidderClaim()
                        }} width='100%' height='48px' primary marginTop={'12px'}>
                            Claim {poolInfo.currentBidderAmount && weiToNum(poolInfo.currentBidderAmount, poolInfo.token1.decimals)} {poolInfo.token1 && poolInfo.token1.symbol}
                        </Button>}

                    {poolInfo.status === 'Close' && poolInfo.creator === account && poolInfo.creatorClaimedP &&
                        < Button onClick={() => {
                            bidderClaim()
                        }} width='100%' height='48px' primary marginTop={'12px'} disabled>
                            You have successfully received {poolInfo.currentBidderAmount && weiToNum(poolInfo.currentBidderAmount, poolInfo.token1.decimals)} {poolInfo.token1 && poolInfo.token1.symbol}
                        </Button>}
                </div>
            </>
        }
    }

    const [offerList, setOfferList] = useState([]);
    const [history, setHistory] = useState([]);
    const handleSwap = (data) => {
        const tradePool = data.tradePools[0];
        const creator = tradePool.creator;
        const total = tradePool.amountTotal0;
        const price = Web3.utils.fromWei(tradePool.price);
        const offerList = data.poolSwaps.map(item => ({
            name: getEllipsisAddress(item.sender),
            time: new Date(item.timestamp * 1000).toLocaleString(),
            amount: item.swapAmount0,
            price: price,
        }));
        setOfferList(offerList);
        const createList = data.poolCreates.map(item => ({
            event: 'Created',
            quantity: total,
            price: price,
            from: getEllipsisAddress(ZERO_ADDRESS),
            to: getEllipsisAddress(creator),
            date: formatDistanceToNow(new Date(item.timestamp * 1000)),
            timestamp: item.timestamp,
        }));
        const swapList = data.poolSwaps.map(item => ({
            event: 'Transfer',
            quantity: item.swapAmount0,
            price: price,
            from: getEllipsisAddress(creator),
            to: getEllipsisAddress(item.sender),
            date: formatDistanceToNow(new Date(item.timestamp * 1000)),
            timestamp: item.timestamp,
        }));
        const cancelList = data.poolCancels.map(item => ({
            event: 'Cancel',
            price: price,
            quantity: item.unswappedAmount0,
            from: getEllipsisAddress(item.sender),
            to: '',
            date: formatDistanceToNow(new Date(item.timestamp * 1000)),
            timestamp: item.timestamp,
        }));
        const list = createList.concat(swapList).concat(cancelList)
            .sort((a, b) => b.timestamp - a.timestamp);
        setHistory(list);
    }

    const [queryPoolSwap, poolSwap] = useLazyQuery(QueryFixedSwapPool, {
        variables: { poolId: Number(poolId) },
        fetchPolicy:"network-only",
        onCompleted: () => {
            handleSwap(poolSwap.data);
        }
    });

    const handleAuction = (data) => {
        const tradePool = data.tradeAuctions[0];
        const creator = tradePool.creator;
        const total = tradePool.tokenAmount0;
        const offerLiist = data.auctionBids.map(item => ({
            name: getEllipsisAddress(item.sender),
            time: new Date(item.timestamp * 1000).toLocaleString(),
            amount: Web3.utils.fromWei(item.amount1),
            price: '',
        }))
        setOfferList(offerLiist);
        const createList = data.auctionCreates.map(item => ({
            event: 'Created',
            quantity: total,
            price: '',
            from: getEllipsisAddress(ZERO_ADDRESS),
            to: getEllipsisAddress(creator),
            date: formatDistanceToNow(new Date(item.timestamp * 1000)),
            timestamp: item.timestamp,
        }));
        const bidList = data.auctionBids.map(item => ({
            event: 'Bid',
            quantity: '',
            price: Web3.utils.fromWei(item.amount1),
            from: getEllipsisAddress(creator),
            to: getEllipsisAddress(item.sender),
            date: formatDistanceToNow(new Date(item.timestamp * 1000)),
            timestamp: item.timestamp,
        }))
        const claimList = data.auctionClaims.map(item => ({
            event: 'Claim',
            price: '',
            quantity: item.amount1,
            from: getEllipsisAddress(item.sender),
            to: '',
            date: formatDistanceToNow(new Date(item.timestamp * 1000)),
            timestamp: item.timestamp,
        }))
        const list = createList.concat(bidList).concat(claimList)
            .sort((a, b) => b.timestamp - a.timestamp);
        setHistory(list);
    }

    const [queryAuctionPool, auctionPool] = useLazyQuery(QueryEnglishAuction, {
        variables: { poolId: Number(poolId) },
        fetchPolicy:"network-only",
        onCompleted: () => {
            handleAuction(auctionPool.data);
        }
    })

    useEffect(() => {
        if (poolId) {
            if (aucType === AUCTION_TYPE.FixedSwap) {
                queryPoolSwap();
            } else if (aucType === AUCTION_TYPE.EnglishAuction) {
                queryAuctionPool();
            }
        }
    }, [poolId, aucType, queryPoolSwap, queryAuctionPool])

    return (
        <>
            <NewIndexStyled>
                <ul className='crumbs'>
                    <li><span>Marketplace</span></li>
                    <li><span>Fine Arts</span></li>
                    <li><span>Digital Image Name</span></li>
                </ul>
                <div className="container">
                    <div className="container_left">
                        <AutoStretchBaseWidthOrHeightImg src={nftInfo && nftInfo.fileurl} width={416} height={416} />
                        <div className="btn_group">
                            <OtherButton type='share' value='Share' />
                            <OtherButton type='like' value='Like' />
                        </div>
                    </div>


                    <div className="container_right">
                        <div className="sell_info">
                            <div className="row1">
                                <h3>{nftInfo.itemname || 'Name Is Loading ...'}</h3>

                                {/* Cancel按钮 */}
                                {poolInfo.status === 'Live' && poolInfo.creator === account && !poolInfo.creatorCanceledP &&
                                    < Button onClick={
                                        () => {
                                            setOpenModal(true)
                                        }}
                                        height='30px'
                                    >
                                        Cancel
                                </Button>}

                                {/* Cancel按钮 */}
                                {poolInfo.status === 'Live' && poolInfo.creator === account && poolInfo.creatorCanceledP &&
                                    < Button onClick={
                                        () => {
                                            /* handelFixedSwapCancel() */
                                            setOpenModal(true)
                                        }}
                                        height='30px'
                                        disabled
                                    >
                                        Canceled
                                </Button>}
                            </div>
                        </div>
                        <div className="seller">
                            <div className='info'>
                                <img src={icon_altAvatar} alt="" />
                                <p>Owned by <a href="http://">{nftInfo.ownername || 'Anonymity'}</a></p>

                                {aucType === 'english-auction' && <div className="close_time">
                                    <img src={icon_time} alt="" />
                                    <span>{poolInfo.showTime}</span>
                                </div>}
                            </div>
                            <div className="desc">
                                <p>{nftInfo.description || 'description Is Loading ...'}</p>
                                <span>Read more</span>

                            </div>
                        </div>

                        {renderByAucType()}
                        <div className="pullInfoBox">

                            <NewPullDown open={true} title='Offers'>
                                <OffersStyled>
                                    {offerList.map((item, index) => <div className="Offers flex flex-space-x" key={index}>
                                        <div className="flex Offers-info">
                                            <p className="name">{item.name}</p>
                                            <p className="time">{item.time}</p>
                                            <p className="amount">{item.amount}</p>
                                        </div>
                                        <div className="Offers-price">
                                            <span>{`${item.price} ETH`}</span>
                                            <span></span>
                                        </div>
                                    </div>)}
                                </OffersStyled>
                            </NewPullDown>
                            <NewPullDown open={false} title='Token Info'>
                                <div className="token-info">
                                    <div className="flex flex-space-x">
                                        <p>Token Contact Address</p>
                                        <p style={{ color: '#124EEB' }}>0x33a9b7ed8c71c...2976</p>
                                    </div>
                                    <div className="flex flex-space-x">
                                        <p>Token Symbol</p>
                                        <p>CKIE</p>
                                    </div>
                                    <div className="flex flex-space-x">
                                        <p>Token ID</p>
                                        <p>#123456</p>
                                    </div>
                                </div>
                            </NewPullDown>
                            <NewPullDown open={false} title='External link'>
                                <div>--</div>
                            </NewPullDown>
                            <NewPullDown open={false} title='Trading History'>
                                <TradingHistory rows={
                                    history.map((item, index) => ({
                                        Event: item.event,
                                        Quantity: item.quantity,
                                        Price: [`${item.price} ETH`, `($)`],
                                        From: getEllipsisAddress(item.from),
                                        To: getEllipsisAddress(item.to),
                                        Date: item.date,
                                    }))
                                } />
                            </NewPullDown>
                        </div>
                    </div>
                </div>
            </NewIndexStyled >
            <ConfirmCancelModal open={openModal} setOpen={setOpenModal} onConfirm={handelFixedSwapCancel} />
        </>
    )
}




const StyledLink = styled(Link)`
    font-family: Helvetica Neue;
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 17px;
    color: #0075FF;

    height: auto;

    margin-top: 50px;
`


const OffersStyled = styled.div`
font-family: Helvetica Neue;
line-height: 15px;
.Offers{
    margin-top: 12px;
    :first-child{
        margin-top: 0px;
    }
    .Offers-info{
        font-size: 12px;
        .name{
            font-weight: 550;
            color: #1F191B;
        }
        .time{
            margin-left: 27px;
            color: rgba(0,0,0,.5);
        }
        .amount{
            margin-left: 24px;
            color: rgba(0,0,0,.5);
        }
    }
    .Offers-price{
        .price_ETH {
            font-family: Helvetica Neue;
            font-style: normal;
            font-weight: 500;
            font-size: 12px;
            line-height: 15px;
            text-align: right;
            color: #1F191B;
            opacity: 0.8;
        }

        .price_USD {
            font-family: Helvetica Neue;
            font-style: normal;
            font-weight: normal;
            font-size: 12px;
            line-height: 14px;
            text-align: right;
            color: #1F191B;
            opacity: 0.5;
        }
    }
}
`