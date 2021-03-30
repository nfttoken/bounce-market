import React, { useState, useEffect } from "react";
import styled from "styled-components";
import UnitDropdown from "./UnitDropdown";
// import icon_ETH from "./assets/icon_ETH.svg";
import { useActiveWeb3React } from "@/web3";
import useToken from "@/utils/useToken";

import icon_BNB from '@assets/images/wallet/icon_BNB.svg'
import icon_ETH_new from '@assets/images/wallet/icon_ETH_new.svg'


function InputPrice({
	className,
	title,
	price,
	setPrice,
	setUnit,
	ifInputAmount = false,
	setAmount,
	notice,
	gridArea,
	options,
	nftInfo
}) {
	const { active, chainId } = useActiveWeb3React();
	const [priceValue, setpriceValue] = useState("");
	const [balance, setBalance] = useState(0);
	const [amountValue, setAmountValue] = useState(1);
	// eslint-disable-next-line
	const [selToken, setSelToken] = useState(options[0]);
	const { getBalance_ERC_1155, getBalance_ERC_721 } = useToken()

	useEffect(() => {
		if (!active || !nftInfo || !nftInfo.standard) return;
		let getBalance
		if (nftInfo.standard === 2) {
			getBalance = async () => {
				const balance = await getBalance_ERC_1155(nftInfo.contractaddress, nftInfo.id)
				setBalance(balance)
			}
		} else if (nftInfo.standard === 1) {
			getBalance = async () => {
				const balance = await getBalance_ERC_721(nftInfo.contractaddress, nftInfo.id)
				setBalance(balance)
			}
		}
		getBalance();
		// eslint-disable-next-line
	}, [active, nftInfo, ifInputAmount])
	useEffect(() => {
		if (!price) return;
		setpriceValue(price)
	}, [price])

	const checkInputPrice = (e) => {

		if (e.target.value.match("^$") != null) {
			setPrice(0);
			setpriceValue("");
		} else if (e.target.value.match("^0$") != null) {
			setPrice(0);
			setpriceValue("0");
		} else if (e.target.value.match("^\\d+$") != null) {
			setPrice(e.target.value);
			setpriceValue(e.target.value);
		} else if (e.target.value.match("^\\d+\\.$") != null) {
			setPrice(e.target.value);
			setpriceValue(e.target.value);
		} else if (e.target.value.match("^\\d+\\.[0-9]*0+$") != null) {
			setPrice(parseFloat(e.target.value));
			setpriceValue(e.target.value);
		} else if (e.target.value.match("^\\d+\\.[0-9]*[1-9]+$") != null) {
			setPrice(e.target.value);
			setpriceValue(e.target.value);
		}
	};
	const checkAmountVal = (e) => {
		if (balance && parseFloat(balance) < parseFloat(e.target.value)) {
			setAmount(balance);
			setAmountValue(balance);
		} else if (e.target.value > 0) {
			setAmount(e.target.value.replace(/\D/g, ''));
			setAmountValue(e.target.value.replace(/\D/g, ''))
		} else {
			setAmount("")
			setAmountValue("")
		}
	};

	return (
		<Wrapper className={className} gridArea={gridArea}>
			<span className="title">{title}</span>
			<span className="notice">{notice}</span>
			<InputRow>
				<input
					className="InputPrice"
					type="text"
					placeholder="Price"
					maxLength={18}
					value={priceValue}
					onChange={checkInputPrice}
				/>
				<UnitDropdown
					className={className + "Unit"}
					width="115px"
					height="32px"
					options={options.filter(item => item.isShow)}
					icon={chainId === 56 ? icon_BNB : icon_ETH_new}
					defaultValue={chainId === 56 ? 'BNB' : 'ETH'}
					// disabled={true}
					onChange={(item) => {
						console.log(item)
						setSelToken(item)
						setUnit && setUnit(item.value);
					}}
				/>
			</InputRow>
			{ifInputAmount && <>
				<span className="amount">Amount</span>
				<AmounttRow>
					<div className="Amount">
						<input
							className="InputAmount"
							type="text"
							defaultValue={1}
							placeholder="Amount"
							maxLength={18}
							disabled={nftInfo && nftInfo.standard === 1}
							value={amountValue}
							onChange={checkAmountVal}
						/>
						<span className="balance"> Balance: {balance}</span>
					</div>
				</AmounttRow>
			</>}

		</Wrapper>
	);
}


const Wrapper = styled.div`
	/* 传方法 */
	grid-area: ${({ gridArea }) => {
		return gridArea;
	}};

	// display: grid;
	// align-items: center;
	// grid-template-rows: 15px 16px 15px 16px 52px 15px 16px 16px 1fr;
	// grid-template-areas:
	// 	"title"
	// 	"."
	// 	"notice"
	// 	"."
	// 	"InputRow"
	// 	"."
	// 	"amount"
	// 	"."
	// 	"AmounttRow";

	span.title {
		font-family: Helvetica Neue;
		font-style: normal;
		font-weight: bold;
		font-size: 12px;
		line-height: 15px;
		text-transform: capitalize;
		color: #1f191b;
		opacity: 0.7;
		display:block;
		grid-area: title;
	}
	span.notice {
		font-family: Helvetica Neue;
		font-style: normal;
		font-weight: normal;
		font-size: 13px;
		line-height: 15px;
		text-transform: capitalize;
		color: #1f191b;
		opacity: 0.5;
		grid-area: notice;
		margin: 6px 0 8px;
		display:block;
	}
	
	span.amount {
		font-family: Helvetica Neue;
		font-style: normal;
		font-weight: bold;
		font-size: 12px;
		line-height: 15px;
		text-transform: capitalize;
		color: #1f191b;
		opacity: 0.7;
		grid-area: amount;
	}
	

	// span.notice {
	// 	font-family: Helvetica Neue;
	// 	font-style: normal;
	// 	font-weight: 500;
	// 	font-size: 14px;
	// 	line-height: 17px;
	// 	color: #1f191b;
	// 	opacity: 0.3;

	// 	box-sizing: border-box;
	// 	/* border-bottom: 1px solid rgba(0, 0, 0, 0.3); */
	// 	border-bottom: 1px solid #000000;

	// 	grid-area: notice;

	// 	padding-top: 10px;
	// 	padding-bottom: 20px;

	// 	align-self: start;
	// }
`;

const InputRow = styled.div`
	grid-area: InputRow;
	display: grid;
	grid-template-columns: 79% auto;
	border: 1px solid rgba(0, 0, 0, 0.3);
	align-items: center;
	margin-bottom: 20px;
	input {
		box-sizing: border-box;
		padding-top: 5px;
		padding-bottom: 5px;
		height: 50px;
		text-indent: 20px;
		&::-webkit-input-placeholder {
			font-family: Helvetica Neue;
			font-style: normal;
			font-weight: 500;
			font-size: 16px;
			line-height: 20px;
			text-transform: capitalize;
			color: #1f191b;
			opacity: 0.3;
		}

		&::-moz-placeholder {
			/* Mozilla Firefox 19+ */
			font-family: Helvetica Neue;
			font-style: normal;
			font-weight: 500;
			font-size: 16px;
			line-height: 20px;
			text-transform: capitalize;
			color: #1f191b;
			opacity: 0.3;
		}

		&:-ms-input-placeholder {
			/* Internet Explorer 10+ */
			font-family: Helvetica Neue;
			font-style: normal;
			font-weight: 500;
			font-size: 16px;
			line-height: 20px;
			text-transform: capitalize;
			color: #1f191b;
			opacity: 0.3;
		}
	}

	.Amount {
		display: flex;
		align-items: center;
		box-sizing: border-box;
		margin-left: auto;
		input.InputAmount {
			margin-left: 10px;
		}
	}
`;
const AmounttRow = styled.div`
	grid-area: AmounttRow;
	display: grid;
	grid-template-columns: auto;
	align-items: center;
	height:54px;
	margin-bottom:20px;
	input {
		width: 146px;
		box-sizing: border-box;
		padding-top: 5px;
		padding-bottom: 5px;
		margin-left: 22px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.3);

		&::-webkit-input-placeholder {
			font-family: Helvetica Neue;
			font-style: normal;
			font-weight: 500;
			font-size: 16px;
			line-height: 20px;
			text-transform: capitalize;
			color: #1f191b;
			opacity: 0.3;
		}

		&::-moz-placeholder {
			/* Mozilla Firefox 19+ */
			font-family: Helvetica Neue;
			font-style: normal;
			font-weight: 500;
			font-size: 16px;
			line-height: 20px;
			text-transform: capitalize;
			color: #1f191b;
			opacity: 0.3;
		}

		&:-ms-input-placeholder {
			/* Internet Explorer 10+ */
			font-family: Helvetica Neue;
			font-style: normal;
			font-weight: 500;
			font-size: 16px;
			line-height: 20px;
			text-transform: capitalize;
			color: #1f191b;
			opacity: 0.3;
		}
	}

	.Amount {
		display: flex;
		align-items: center;
		box-sizing: border-box;
		width:100%;
		margin-left: auto;
		height:50px;
		border: 1px solid rgba(0,0,0,0.3);
		justify-content: space-between;
		input.InputAmount {
			margin-left: 10px;
			width:78%;
			height:48px;
			border-bottom:none;
		}
		.balance{
			display:inline-block;
			height:32px;
			line-height:32px;
			padding-left:12px;
			white-space: nowrap;
			border-left: 1px solid rgba(0,0,0,0.2);
			margin-right: 10px;
		}
	}
`;

export default InputPrice;