import React from 'react'
import styled from 'styled-components'
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
// import { Button } from '@components/UI-kit'

import icon_transfer from './assets/transfer.svg'
import icon_create from './assets/create.svg'

import default_img from './assets/default_img.svg'
import { getEllipsisAddress } from '@/utils/utils';

const TableItemStyled = styled(TableRow)`
    font-family: 'Helvetica Neue';
    font-weight: 400;
    font-size: 16px;
    width: 100%;
    display: flex;
    box-sizing: border-box;
    border-bottom: 1px solid rgba(0,0,0,.1);
    
    .event{
        img{
            margin-right: 10px;
        }
    }

    .item{
        display: flex;
        align-items: center;

        width: 260px;

        img{
            width: 44px;
            height: 44px;
            box-sizing: border-box;
            margin-right: 12px;
        }

        .itemName {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }

    td{
        border: none;
        cursor: pointer;

        &:hover{
            color: rgba(26,87,243,1);
        }
    }
`

export default function TableItem({ row }) {
    // console.log(row)
    return (
        <TableItemStyled>
            <TableCell className='event'>
                {row.event === 'Transfer' && <img src={icon_transfer} alt="" />}
                {row.event === 'Created' && <img src={icon_create} alt="" />}
                {row.event}
            </TableCell>
            <TableCell className='item'>
                {row.cover ? <img src={row.cover} alt="" /> : <img src={default_img} alt="" />}
                <span className="itemName">{row.item}</span>
            </TableCell>
            <TableCell>
                {row.quantity}
            </TableCell>
            {/* <TableCell>
                {row.status}
            </TableCell> */}
            <TableCell>
                {getEllipsisAddress(row.from)}
            </TableCell>
            <TableCell>
                {getEllipsisAddress(row.to)}
            </TableCell>
            <TableCell>
                {row.date}
            </TableCell>
            {/* <TableCell>
                {row.event === 'Transfer' && <Button>Detail</Button>}
            </TableCell> */}
        </TableItemStyled>

    )
}
