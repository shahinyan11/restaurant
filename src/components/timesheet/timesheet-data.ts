import { format_date } from '../../util'

const moment = require('moment')
const GenerateArray = (num: number) => {
    let counter: any = []
    for (let i = 0; i < num; i++) {
        counter.push({name: i + 1, capacity: Math.round(Math.random() * 9)})
    }
    return counter
}

export interface IEvent {
    first_name: string
    last_name: string

    number_people?: string

    status?: string
    event_type?: string
    charge?: number

    note?: string

    locked?: number

    start: string
    end: string

    icons?: string[]


    styles?: any
    duration?: number
    text?: {
        left?: string
        right?: string
    },
    icon?: {
        left?: string
        right?: string
    }
}

export const TimesheetData = () => {
    let localstorage: any = localStorage.getItem('_data')
    localstorage = localstorage ? JSON.parse(localstorage) : []
    return {
        ...DefaultData,
        events: localstorage
    }
}

export const DefaultData: any = {
    mouse_move: 0,
    locations: [
        {
            name: 'Restaurant 1',
            children: GenerateArray(30)
        },
        {
            name: 'Restaurant 2',
            children: GenerateArray(30)
        }
    ],
    selected_time: {
        start: moment(`${moment().format('YYYY/MM/DD')}:05:00`, format_date),
        end: moment(`${moment().add(1, 'days').format('YYYY/MM/DD')}:05:00`, format_date),
        step: 15
    },
    // events: [
    //     {
    //         id: $UID(),
    //         first_name: 'John',
    //         last_name: 'Lennon',
    //         status: 'validated-confirmed',
    //         room: {name: 5},
    //         restaurant: 'Restaurant 1',
    //         start: '2011/10/11:06:15',
    //         end: '2011/10/11:08:15',
    //     },
    // ]
}