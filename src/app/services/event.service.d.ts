import { BehaviorSubject } from 'rxjs';
import { C3event } from '../models/c3event';
export declare class EventService {
    private emitter;
    constructor();
    readonly Emitter: BehaviorSubject<C3event>;
}
