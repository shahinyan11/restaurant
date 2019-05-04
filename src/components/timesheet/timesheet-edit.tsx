import React, {Component} from 'react'
import {ObservableService} from '../../service/observable.service'
import {DestroyPopup, format_date} from '../../util'
import {$V} from '../../variable'
import {GetFirstNextTime} from './timesheet-popup'


const list_icon = [
    'fa-birthday-cake',
    'fa-tree',
    'fa-exclamation-circle',
    'fa-credit-card',
    'fa-book',
    'fa-lock'
]

class TimesheetEdit extends Component<any> {
    state = {
        start: null,
        end: null,
        restaurant: null,
        room: null,

        first_name: 'New',
        last_name: 'User',
        status: 'validated-confirmed',
        event_type: ['birthday-cake'],
        icons: [],
        number_people: 0,
        note: '',
        charge: 0,
        locked: 0
    };


    handleChange(e) {
        const target = e.target
        this.setState({
            [target.name]: target.value
        })

    }

    async handleIcon(icon) {
        const check: any = this.state.icons.includes(icon)
        if (check) {
            await this.setState({
                icons: this.state.icons.filter(i => i !== icon)
            })
        } else {
            await this.setState({
                icons: [...this.state.icons, icon]
            })
        }
    }

    async componentWillMount() {
        const bind = this.props.popup.bind
        if (Object.keys(bind.form)) {
            await this.setState(bind.form)
        }
    }

    async parser() {
        const list_int = ['number_people']
        list_int.map(async f => {
            if (this.state[f]) await this.setState({[f]: parseInt(this.state[f])})
        })
    }

    async handleSave() {
        const bind = this.props.popup.bind;
        await this.parser();

        let times = []

        if (!this.state.start && !this.state.end)
            times = GetFirstNextTime({time: bind.selected_cell.time, grid_data: bind.grid_data});
        ObservableService.push($V.PUSH_EVENT, {
            ...this.state,
            start: this.state.start || times[0].format(format_date),
            end: this.state.end || times[1].format(format_date),
            restaurant: this.state.restaurant || bind.selected_cell.restaurant,
            room: this.state.room || bind.selected_cell.room,
        })
        DestroyPopup()
    }


    render() {
        return (
            <div>
                <div className="overlay" onClick={() => DestroyPopup()}></div>
                <div className="popup timesheet-edit">
                    <div className="form-group">
                        <label>First Name</label>
                        <input type="text" name="first_name"
                               value={this.state.first_name}
                               onChange={e => this.handleChange(e)}/>
                    </div>
                    <div className="form-group">
                        <label>Last Name</label>
                        <input type="text" name="last_name"
                               value={this.state.last_name}
                               onChange={e => this.handleChange(e)}/>
                    </div>
                    <div className="form-group">
                        <label>Number People</label>
                        <input type="number" name="number_people" min="0" step="1"
                               value={this.state.number_people}
                               onChange={e => this.handleChange(e)}/>
                    </div>
                    <div className="form-group">
                        <label>Icons</label>
                        <div className="icon-lists">
                            {list_icon.map((icon, i) =>
                                <i key={i}
                                   className={`fa ${icon} ${this.state.icons.includes(icon)}`}
                                   onClick={() => this.handleIcon(icon)}>
                                </i>
                            )}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Note</label>
                        <textarea name="note"

                                  onChange={e => this.handleChange(e)}
                                  value={this.state.note}
                                  rows={5}/>

                    </div>


                    {/*<div className="form-group">*/}
                    {/*<label>Charge</label>*/}
                    {/*<input type="checkbox" name="charge" value={this.state.charge}*/}
                    {/*onChange={e => this.handleChange(e)}/>*/}
                    {/*</div>*/}

                    {/*<div className="form-group">*/}
                    {/*<label>Lock</label>*/}
                    {/*<input type="checkbox" name="locked" value={this.state.locked}*/}
                    {/*onChange={e => this.handleChange(e)}/>*/}
                    {/*</div>*/}

                    <div className="form-group">
                        <label>Status</label>
                        <select name="status" value={this.state.status} onChange={e => this.handleChange(e)}>
                            <option value="validated-confirmed">Validated/Confirmed</option>
                            <option value="honoured">Honoured</option>
                            <option value="partially-honoured">Partialy Honoured</option>
                            <option value="to-be-validated">To be validated/optional</option>
                            <option value="pending-charge">Pending charge</option>
                            <option value="joined-table">Joined Table</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <button onClick={() => this.handleSave()}>Save</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default TimesheetEdit