import React, { Component } from 'react'
import { ObservableService } from '../../service/observable.service'
import {
    $UID,
    format_date,
    GenerateEQ,
    GenerateKeySubscriber,
    MousePosition,
    ResetPlaceholderHover,
    ScrollTo,
    TimeLooper
} from '../../util'
import { $V } from '../../variable'
import TimesheetCell from './timesheet-cell'
import { TimesheetData } from './timesheet-data'
import { TimesheetHead } from './timesheet-head'
import { TimesheetSidebar } from './timesheet-sidebar'
import './timesheet.scss'



const $ = require('jquery');
const moment = require('moment');

export const CELL_WIDTH = 70;
export const CELL_HEIGHT = 30;

function pad(n, width, z = '0') {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}


class Timesheet extends Component {


    state = TimesheetData();

    timelooper;

    componentWillMount(): void {
        this.timelooper = TimeLooper(this.state.selected_time);

        ObservableService.watch($V.PUSH_EVENT).subscribe(async form => {
            const check = this.state.events.find(e => e.id === form.id);
            if (check) {
                this.pushEvents(true);
                if (form._clear === true) {
                    // Delete an event

                } else {
                    await this.setState({
                        events: this.state.events.map(e => {
                            if (e.id === form.id) return {...e, ...form};
                            return e
                        })
                    })
                }

                localStorage.setItem('_data', JSON.stringify(this.state.events));
                return this.pushEvents()
            }

            !form.id ? form.id = $UID(): null ;
            await this.setState({
                events: [
                    ...this.state.events,
                    form
                ]
            })

            localStorage.setItem('_data', JSON.stringify(this.state.events));
            this.pushEvents()
        })
    }

    componentDidMount(): void {
        ObservableService.set($V.LOCATIONS, this.state.locations);
        this.pushEvents();
        ObservableService.watch($V.CORE_SCROLL).subscribe(({x, y}) => {
            $('.side-scroll').css({
                transform: `translateX(${x}px)`,
            })
            $('.header-top').css({transform: `translateX(${x}px)`});
            if (y > 80) {
                $('.head').css({transform: `translateY(${y - 80}px)`});
                $('.timesheet-vertical').css({transform: `translateY(-80px)`})
            } else {
                $('.head').css({transform: `translateY(0px)`});
                $('.timesheet-vertical').css({transform: `translateY(0px)`})
            }


        })

        const today = moment();
        const date_now = today.format(format_date.replace('/DD:HH:mm', ''));
        const minute_now = parseInt(today.format('mm'));
        const hour_now = parseInt(today.format('HH'));
        const day_now = parseInt(today.format('DD'));


        const minute_15 = Math.floor(minute_now / 15) * 15;
        const full_date = moment(`${date_now}:${hour_now > 5 ? day_now : day_now + 1}:${hour_now}:${minute_15}`, format_date);

        const length = TimeLooper({start: this.state.selected_time.start, end: moment(full_date, format_date)}).length;

        const position = 195 + (length * CELL_WIDTH);
        const body = $('body').height();
        $('.timesheet-vertical-stay').css({left: `${position}px`, height: `${body - 110}px`});
        setTimeout(() => ScrollTo((length * CELL_WIDTH) - 100, null), 500)
    }


    async handleMouseMove(e) {
        const Obs = ObservableService;
        const selected = Obs.get($V.SELECTED_CELL);

        if (!selected) return Obs.set($V.GRID_START_MOVE, null);

        let start_mouse = Obs.get($V.GRID_START_MOVE);

        if (!start_mouse) {
            Obs.set($V.GRID_START_MOVE, MousePosition(e));
            start_mouse = MousePosition(e)
        }

        const hover_placeholder = $('.timesheet-hover');
        const curr_mouse = MousePosition(e);
        const el = $(selected.container.current);
        const el_position = el[0].getBoundingClientRect();
        const el_index = el.index();
        const parent = el.parent();

        let block_count = 0;
        const move_direction = {x: null, y: null};

        el.addClass('hover');

        // Only Allow Right & Left
        if (selected.direction === $V.GRID_DIRECTION_HORIZONTAL ||
            selected.direction === $V.GRID_DIRECTION_RIGHT ||
            selected.direction === $V.GRID_DIRECTION_LEFT
        ) {
            const direction_right = curr_mouse.x > start_mouse.x;
            move_direction.x = direction_right ? $V.GRID_DIRECTION_RIGHT : $V.GRID_DIRECTION_LEFT;

            if (selected.direction === $V.GRID_DIRECTION_RIGHT && !direction_right) return;
            if (selected.direction === $V.GRID_DIRECTION_LEFT && direction_right) return;

            block_count = Math.floor(Math.abs(el_position.x - curr_mouse.x) / CELL_WIDTH);

            if (block_count) {
                const cells = parent.find('.cell');

                const eq = direction_right
                    ? GenerateEQ(el_index, el_index + block_count)
                    : GenerateEQ(el_index, el_index - block_count);

                cells.filter(eq).addClass('hover');
                cells.not(eq).removeClass('hover')
            }

            // Step Move for vertical red line
            const index_moved = direction_right
                ? el_index + block_count
                : el_index - block_count;
            const el_moved = parent.find('.cell').eq(block_count ? index_moved : el_index);
            const pos_moved = el_moved[0].getBoundingClientRect().x;
            $('.timesheet-vertical').css({left: `${pos_moved + 35}px`})

        } else {
            const direction_top = curr_mouse.y < start_mouse.y;
            move_direction.y = direction_top ? $V.GRID_DIRECTION_TOP : $V.GRID_DIRECTION_BOTTOM;

            if (selected.direction === $V.GRID_DIRECTION_TOP && !direction_top) return;
            if (selected.direction === $V.GRID_DIRECTION_BOTTOM && direction_top) return;

            hover_placeholder.css({
                left: `${el_position.x}px`,
                top: `${el_position.y}px`,
                width: `${el_position.width}px`,
                height: `${el_position.height}px`
            })


            const event = selected.state.event;
            block_count = Math.floor(Math.abs(el_position.y - curr_mouse.y) / CELL_HEIGHT);
            hover_placeholder.css({width: `${el_position.width * (event.duration)}px`});
            if (block_count) {
                const size = block_count * CELL_HEIGHT;

                direction_top
                    ? hover_placeholder.css({height: `${size}px`, transform: `translateY(-${size}px)`})
                    : hover_placeholder.css({height: `${size}px`, transform: `translateY(${CELL_HEIGHT}px)`})

            }
        }

        Obs.set($V.GRID_DIRECTION_FINAL, {...move_direction, block_count})

    }

    handleMouseUp(e) {
        const Obs = ObservableService;
        const check = Obs.get($V.SELECTED_CELL);

        if (!check || check.drag !== true) return;
        ResetPlaceholderHover();
        const selected_cell = Obs.get($V.SELECTED_CELL);
        const grid_data = Obs.get($V.GRID_DIRECTION_FINAL) || {x: 0, y: 0};
        const event = selected_cell.state.event;

        Obs.set($V.SELECTED_CELL, null);
        $('.cell').removeClass('hover');

        if (grid_data.x === $V.GRID_DIRECTION_LEFT || grid_data.x === $V.GRID_DIRECTION_RIGHT) {
            const direction_right = grid_data.x === $V.GRID_DIRECTION_RIGHT;

            if (direction_right) {
                Obs.push($V.PUSH_EVENT, {
                    ...event,
                    end: moment(event.start, format_date).add(grid_data.block_count * 15, 'minutes')
                        .format(format_date)
                })
            } else {
                Obs.push($V.PUSH_EVENT, {
                    ...event,
                    start: moment(event.start, format_date).subtract(grid_data.block_count * 15, 'minutes')
                        .format(format_date)
                })
            }
        } else {
            const direction_top = grid_data.y === $V.GRID_DIRECTION_TOP;
            const rooms = ObservableService.get($V.LOCATIONS)
                .find(r => r.name === event.restaurant).children;
            const curr_room_index = rooms.findIndex(r => r.name === event.room.name);

            const index_update = rooms.filter((r, i) => {
                return direction_top
                    ? i < curr_room_index && i >= curr_room_index - grid_data.block_count
                    : i > curr_room_index && i <= curr_room_index + grid_data.block_count
            })

            index_update.map((r, i) => {
                setTimeout(() => Obs.push($V.PUSH_EVENT, {
                    ...event,
                    id: null,
                    room: r
                }), i * 50)
            })
        }

    }

    pushEvents(clear = false) {
        if (clear) {
            this.state.events.map(e => {
                const key = {time: moment(e.start, format_date), ...e};
                ObservableService.push(GenerateKeySubscriber(key), null)
            })
        } else {
            this.state.events.map(e => {
                const key = {time: moment(e.start, format_date), ...e};
                ObservableService.push(GenerateKeySubscriber(key), e)
            })
        }
    }

    shouldComponentUpdate(nextProps, nextState, nextContext: any): boolean {
        // Add logic here to prevent rerender all sheet
        return false
    }


    render() {
        return (
            <div className="timetable-root"
                 onMouseUp={e => this.handleMouseUp(e)}
                 onMouseMove={e => this.handleMouseMove(e)}>
                <TimesheetSidebar lists={this.state.locations}/>
                <div className="timetable-item">
                    <TimesheetHead selected={this.state.selected_time}/>
                    {
                        this.state.locations.map(({name, children}, i) => {
                            return (
                                <div key={i}>
                                    <div className="row row-restaurant">
                                        {/*{this.timelooper.map((m, x) =>*/}
                                        {/*<div key={x} className="cell"></div>*/}
                                        {/*)}*/}
                                        <span className="side-scroll">{name}</span>
                                    </div>

                                    <div className="placeholder-row">
                                        {children.map((room, r) => (
                                            <div className="row" key={r}>
                                                {this.timelooper.map((moment, y) => (
                                                    <TimesheetCell
                                                        siblings={children}
                                                        key={y}
                                                        restaurant={name}
                                                        time={moment}
                                                        room={room}
                                                    />
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
                <div className="timesheet-hover"></div>
                <div className="timesheet-vertical"></div>
                <div className="timesheet-vertical-stay current-time"></div>
            </div>
        )
    }
}

export default Timesheet
