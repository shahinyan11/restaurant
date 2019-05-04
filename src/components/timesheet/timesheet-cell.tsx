import React, { Component, createRef } from 'react'
import { distinctUntilChanged } from 'rxjs/operators'
import { ObservableService } from '../../service/observable.service'
import { format_date, GenerateKeySubscriber, MousePosition, TimeLooper } from '../../util'
import { $V } from '../../variable'
import { IPopup } from '../popup/popup'
import { CELL_WIDTH } from './timesheet'
import TimesheetDrag from './timesheet-drag'
import { PopupEditCell, PopupEmptyCell } from './timesheet-popup'

const $ = require('jquery')
const moment = require('moment')

interface Cell {
    siblings: any
    restaurant: any
    time: any
    room: any
}

const GroupingRender = {
    6: ['number_people', 'last_name', 'first_name', 'icon:7'],
    5: ['number_people', 'last_name', 'icon:6'],
    4: ['number_people', 'last_name', 'icon:4'],
    3: ['number_people', 'last_name', 'icon:2'],
    2: ['number_people', 'last_name'],
    1: ['last_name'],
}

class TimesheetCell extends Component<Cell> {
    container: any = createRef()

    subscribers: any = []

    state: any = {
        my_cell_position: 0,
        my_fill_cell_position: 0,
        key: '',
        is_blocked: false,
        event: {},
        subscribers: [],
    }

    openPopupEdit(e) {
        e.preventDefault()
        e.stopPropagation()
        // if (this.state.event.icons.includes('fa-lock')) return
        const data: IPopup = {
            component: PopupEditCell, position: MousePosition(e), bind: {
                ...this.props,
                event: this.state.event
            }
        }
        ObservableService.push($V.CORE_POPUP, data)
    }

    openPopupEmpty(e) {
        e.stopPropagation()

        const selected_cell = ObservableService.get($V.SELECTED_CELL)
        const grid_data = ObservableService.get($V.GRID_DIRECTION_FINAL)
        this.setVertical(null, true)

        const data: IPopup = {
            component: PopupEmptyCell, position: MousePosition(e),
            bind: {selected_cell: selected_cell, grid_data}
        }
        ObservableService.push($V.CORE_POPUP, data)
    }

    emptyCell(e) {
        e.stopPropagation()
        const data = ObservableService.get($V.SELECTED_CELL)
        if (!data) return this.setVertical(e.clientX)

        this.openPopupEmpty(e)
    }

    setVertical(x, disable = false) {
        const vertical = $('.timesheet-vertical')

        if (disable) {
            ObservableService.set($V.SELECTED_CELL, null)
            vertical.removeClass('active')
            return
        }

        ObservableService.set($V.SELECTED_CELL, {
            ...this.props,
            container: this.container,
            direction: $V.GRID_DIRECTION_HORIZONTAL
        })

        vertical.addClass('active')
        vertical.css({left: `${x}px`})
    }

    componentWillMount(): void {
        const props = this.props

        const list_subscribers = [
            ObservableService.watch(GenerateKeySubscriber(props))
                .subscribe(async e => {
                if (e) {
                    const duration = TimeLooper({
                        start: moment(e.start, format_date),
                        end: moment(e.end, format_date),
                        step: 15
                    }).length + 1
                    await this.setState({
                        is_blocked: true,
                        event: {...e, duration},
                    })
                } else {
                    await this.setState({
                        is_blocked: false,
                        event: {}
                    })
                }

            }),
        ]
        this.subscribers.push(...list_subscribers)
    }

    componentDidMount(): void {
        this.setState({
            my_cell_position: this.container.current.getBoundingClientRect()
        })
    }

    componentWillUnmount(): void {
        if (this.subscribers.length)
            this.subscribers.map(u => u.unsubscribe())
    }


    renderContent() {
        const e = this.state.event
        const group = GroupingRender[e.duration > 5 ? 6 : e.duration]

        let html = ''
        group.map(field => {
            if (field.includes(':')) {
                const limit = parseInt(field.split(':')[1])
                return html += (e.icons || []).filter((x, key) => key < limit)
                    .reduce((a, b) => `${a}<i class="fa ${b}"></i>`, '')
            }
            if (e[field]) html += `<span>${e[field]}</span>`
        })

        return {
            __html: html
        }
    }

    render() {
        const e: any = this.state.event || {styles: {}}
        return (
            <div className="cell"
                 ref={this.container}
                 onClick={(e) => this.emptyCell(e)}>
                {
                    this.state.is_blocked
                        ? <div className={`filled-block ${e.status}`}
                               onContextMenu={(e) => this.openPopupEdit(e)}
                               onClick={e => this.openPopupEdit(e)}
                               style={{...e.styles, width: `${e.duration * CELL_WIDTH}px`}}>
                            <TimesheetDrag {...this} container={this.container}/>
                            <div dangerouslySetInnerHTML={this.renderContent()}></div>
                        </div>
                        : ''
                }
            </div>
        )
    }

}

export default TimesheetCell