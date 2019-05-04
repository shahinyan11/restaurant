import React from 'react'
import './header.scss'
const moment = require('moment')

export const Header = props => {
    const Clear = () => {
        localStorage.removeItem('_data')
        window.location.reload()
    }
    return (
        <div className="header-top">
            <div className="title">Timeline</div>

            <div className="center">

                <div className="icon fa fa-chevron-left"></div>
                <div className="info">
                    <div className="date">
                        {moment().format('dddd')}, {moment().format('LL')}
                    </div>
                    <div className="button">
                        Today
                    </div>
                </div>
                <div className="icon fa fa-chevron-right"></div>
            </div>

            <div className="right">

                <div className="button" style={{cursor: 'pointer'}} onClick={() => Clear()}>
                    <div className="icon fa fa-trash"></div>
                    <span>Clear Data</span>
                </div>

                <div className="button">
                    <div className="icon fa fa-plus"></div>
                    <span>Add a note</span>
                </div>

                <div className="button reservation">
                    <div className="icon fa fa-clock"></div>
                    <span>Make a reservation</span>
                </div>
            </div>
        </div>
    )
}