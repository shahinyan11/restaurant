import React from 'react'
import { ObservableService } from '../../service/observable.service'
import { DestroyPopup, format_date } from '../../util'
import { $V } from '../../variable'
import TimesheetEdit from './timesheet-edit'


const moment = require('moment')
const $ = require('jquery')

export const GetFirstNextTime = ({time, grid_data}) => {
    const clone = time.clone()
    const next_time = grid_data.x === $V.GRID_DIRECTION_RIGHT
        ? clone.add(grid_data.block_count * 15, 'minutes')
        : clone.subtract(grid_data.block_count * 15, 'minutes')

    return time.isSameOrAfter(next_time)
        ? [next_time, time]
        : [time, next_time]
}


const NewBook = (obj: { popup, grid_data?, form? }) => {
    const {popup, form, grid_data} = obj

    ObservableService.push($V.CORE_POPUP, {
        component: TimesheetEdit,
        bind: {
            selected_cell: popup.bind.selected_cell,
            grid_data,
            form: form || {}
        }
    })
}

const WalkIn = ({popup}) => {
    const {selected_cell, grid_data} = popup.bind

    const times = GetFirstNextTime({grid_data, time: selected_cell.time})
    if (grid_data.block_count === 0) return alert('Invalid Time Range')

    ObservableService.push($V.PUSH_EVENT, {
        start: times[0].format(format_date),
        end: times[1].format(format_date),
        restaurant: selected_cell.restaurant,
        room: selected_cell.room,
        last_name: 'Walk In',
        status: 'walk-in'
    })

    DestroyPopup()
}

export const PopupEmptyCell = ({popup}) => {
    const {room, time} = popup.bind.selected_cell
    const {grid_data} = popup.bind

    const times = GetFirstNextTime({grid_data, time})

    return (
        <div>
            <div className="overlay" onClick={() => DestroyPopup()}></div>
            <div className="popup popup-new-cell">
                <div className="list head">Room
                    {` ${room.name}`} - {times[0].format('HH:mm')} : {times[1].format('HH:mm')}
                </div>
                <div className="list" onClick={() => NewBook({popup, grid_data})}>New Booking</div>
                <div className="list" onClick={() => WalkIn({popup})}>Walk-in</div>
            </div>
        </div>
    )
}

export const PopupEditCell = ({popup}) => {
    const {room, time, event} = popup.bind
    const ChangeStatus = (obj) => {
        ObservableService.push($V.PUSH_EVENT, {...event, ...obj})
        DestroyPopup()
    }
    return (
        <div>
            <div className="overlay" onClick={() => DestroyPopup()}></div>
            <div className="popup popup-edit-cell">
                <div className="list head">Room {room.name} {moment(time, format_date).format('- HH:mm')}</div>
                <div className="list" onClick={() => ChangeStatus({status: 'honoured'})}>Booking honoured</div>
                <div className="list">Waiting for other guests</div>
                <div className="list" onClick={() => ChangeStatus({_clear: true})}>No show</div>
                <div className="list" onClick={(e) => NewBook({popup, form: popup.bind.event})}>Edit booking</div>
                <div className="list" onClick={() => ChangeStatus({locked: true})}>Freeze</div>
                <div className="list">Cancel</div>
                <div className="list">Customer Information</div>
            </div>
        </div>
    )
}
