import React, { Component } from 'react'
import { ObservableService } from '../../service/observable.service'
import { $V } from '../../variable'

class TimesheetDrag extends Component<any> {

    dragStart(e, direction) {
        e.preventDefault()
        ObservableService.set($V.SELECTED_CELL, {
            ...this.props,
            container: this.props.container,
            drag: true,
            direction
        })
    }

    render() {
        return (
            <div className="timesheet-drag">
                <div onMouseDown={e => this.dragStart(e, $V.GRID_DIRECTION_TOP)}
                     onClick={e => e.stopPropagation()}
                     draggable={true}
                     className="top">
                </div>
                <div onMouseDown={e => this.dragStart(e, $V.GRID_DIRECTION_BOTTOM)}
                     onClick={e => e.stopPropagation()}
                     draggable={true}
                     className="bottom">
                </div>
                <div onMouseDown={e => this.dragStart(e, $V.GRID_DIRECTION_LEFT)}
                     onClick={e => e.stopPropagation()}
                     draggable={true}
                     className="left">
                </div>
                <div onMouseDown={e => this.dragStart(e, $V.GRID_DIRECTION_RIGHT)}
                     onClick={e => e.stopPropagation()}
                     draggable={true}
                     className="right">
                </div>
            </div>
        )
    }
}

export default TimesheetDrag