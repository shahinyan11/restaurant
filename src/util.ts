import { ObservableService } from './service/observable.service'
import { $V } from './variable'

const moment = require('moment')
const uuid = require('uuid/v4')
const $ = require('jquery')

export const $UID = uuid

export const format_date = 'YYYY/MM/DD:HH:mm'

export const DestroyPopup = () => {
    $('.cell').removeClass('hover')
    ObservableService.push($V.CLEAR_MOVED, true)
    ObservableService.push($V.CORE_DESTROY_ALL_POPUP, true)
}

export const ResetPlaceholderHover = () => {
    $('.timesheet-hover').css({height: 0, width: 0, transform: '', left: 0, top: 0})
}

export const NG = (obj = {}, key = '', initial?): any => {
    return key.split('.')
        .reduce(function (o, x) {
            return (typeof o === 'undefined' || o === null) ? o : o[x]
        }, obj) || initial
}

export const TimeLooper = (selected: any = {}) => {
    const {start, end, step} = selected

    const lists: any = []
    for (let m = moment(start); m.isBefore(end); m.add(step || 15, 'minutes')) {
        lists.push(m.clone())
    }

    return lists
}

export const GenerateArray = (start, end) => {
    const arr = start > end ? [end, start] : [start, end]
    const lists = []

    for (let i = arr[0]; i <= arr[1]; i++) {
        lists.push(i)
    }

    return lists
}

export const GenerateEQ = (start, end) => {
    return GenerateArray(start, end).map(a => {
        return `:eq(${a})`
    }).join(', ')
}

export const GenerateKeySubscriber = (obj: any) => {
    const {time, room, restaurant} = obj
    return `${time.format(format_date)}:${room.name}:${restaurant}`
}

export const MousePosition = (e) => {
    const {clientX, clientY} = e

    return {
        x: clientX,
        left: clientX,

        y: clientY,
        top: clientY
    }
}


const scrollMath = function (t, b, c, d) {
    t /= d / 2
    if (t < 1) {
        return c / 2 * t * t + b
    }
    t--
    return -c / 2 * (t * (t - 2) - 1) + b
}


export function ScrollTo(to, callback?, duration?) {
    // because it's so fucking difficult to detect the scrolling element, just move them all
    const requestAnimFrame = (function () {
        const win: any = window
        return win.requestAnimationFrame || win.webkitRequestAnimationFrame || win.mozRequestAnimationFrame || function (callback) {
            win.setTimeout(callback, 1000 / 60)
        }
    })()

    const doc: any = document

    function move(amount) {
        doc.documentElement.scrollLeft = amount
        doc.body.parentNode.scrollLeft = amount
        doc.body.scrollLeft = amount
    }

    function position() {
        return doc.documentElement.scrollLeft || doc.body.parentNode.scrollLeft || doc.body.scrollLeft
    }

    var start = position(),
        change = to - start,
        currentTime = 0,
        increment = 20
    duration = (typeof (duration) === 'undefined') ? 500 : duration
    var animateScroll = function () {
        // increment the time
        currentTime += increment
        // find the value with the quadratic in-out easing function
        var val = scrollMath(currentTime, start, change, duration)
        // move the document.body
        move(val)
        // do the animation unless its over
        if (currentTime < duration) {
            requestAnimFrame(animateScroll)
        } else {
            if (callback && typeof (callback) === 'function') {
                // the animation is done so lets callback
                callback()
            }
        }
    }
    animateScroll()
}