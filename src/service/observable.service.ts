import { Subject } from 'rxjs'
import { debounceTime } from 'rxjs/operators'

const Obs: any = {}
const Data: any = {}


export class ObservableService {

    static watch(name: any) {
        if (!Obs[name]) Obs[name] = new Subject()
        return Obs[name].asObservable()
    }

    static watchOnce(name, debounce = 0) {
        return new Promise(done => {
            const watcher_once = this.watch(name)
                .pipe(debounceTime(debounce)).subscribe(data => {
                    setTimeout(() => watcher_once.unsubscribe(), 0)
                    return done(data)
                })
        })
    }

    static push(name, val) {
        if (!Obs[name]) Obs[name] = new Subject()

        this.set(name, val);
        Obs[name].next(val)
    }


    static set(name, val, update = false) {
        if (!Data[name] || typeof val !== 'object') return Data[name] = val
        if (update) {
            for (const v in val) {
                Data[name][v] = val[v]
            }
        } else {
            Data[name] = val
        }
    }

    static get(name) {
        return Data[name]
    }

    static getAndSet(name, val = null) {
        const value = Data[name]
        Data[name] = val
        return value
    }

}