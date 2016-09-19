import * as events from 'events';

import * as sprintf from 'sprintf-js';
import * as _ from 'lodash';


export interface IProcessBarOptions {
    action?: string,
}
export class ProcessBar extends events.EventEmitter {
    public current: number = 0;

    private DEFAULT_OPTIONS = { action: 'downloading' };
    private FMT = '%(action)s [%(bar)10s] %(percentage)3s%% %(message)s';

    constructor(public goal: number, public options: IProcessBarOptions = {}) {
        super();

        //
        let readyOptions = _.assign(this.DEFAULT_OPTIONS, options)

        // Register tick event
        this.on('tick', (message: string) => {
            // Show process bar on console
            this.current++;
            let percentage = Math.floor((this.current / this.goal) * 100);
            let bar = _.repeat("=", Math.floor(percentage / 10));
            let kwargs = _.assign(readyOptions, { bar, percentage, message });
            console.log(sprintf.sprintf(this.FMT, kwargs))

            // Trigger end event
            if (this.current === this.goal) this.emit('end')
        })

        // Register end event
        this.on('end', () => {
            console.log('FINISH!')
        })
    }

    public tick(message: string): boolean {
        return this.emit('tick', message);
    }
}
