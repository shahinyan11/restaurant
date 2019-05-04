import React, { Component } from 'react'
import { ObservableService } from '../../service/observable.service'
import { $UID } from '../../util'
import { $V } from '../../variable'
import './popup.scss'

export interface IPopup {
    id?: string
    component: any
    position?: any
    bind?: any

    class?: {
        overlay?: string
    }

}

class Popup extends Component {
    state = {
        popups: []
    }

    componentWillMount() {
        // Watcher Generate Popup
        ObservableService.watch($V.CORE_POPUP).subscribe((obj: IPopup) => {
            const {component} = obj


            this.setState({
                popups: [...this.state.popups, {id: $UID(), component, ...obj}]
            })
        })

        // Watcher Remove Popups
        ObservableService.watch($V.CORE_DESTROY_POPUP).subscribe(id => {
            this.setState({
                popups: this.state.popups.filter((popup: IPopup) => popup.id !== id)
            })
        })

        ObservableService.watch($V.CORE_DESTROY_ALL_POPUP).subscribe(() => {
            this.setState({popups: []})
        })
    }

    renderPopup(popup: IPopup) {
        const Comp = popup.component

        const binding = Object.assign({}, popup)
        delete binding.component

        return (<Comp key={popup.id} popup={binding}/>)
    }

    render() {
        return (
            <div>
                {this.state.popups.map(popup => this.renderPopup(popup))}
            </div>
        )
    }
}

export default Popup