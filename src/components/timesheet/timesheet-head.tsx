import React from 'react'
import { TimeLooper } from '../../util'

export const TimesheetHead = ({selected}) => (
    <div className="head head-scroll">
        {TimeLooper(selected).map((moment,i) => (
            <div className="cell" key={i}>{moment.format('HH:mm')}</div>
        ))}
    </div>
)