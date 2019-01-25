/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as i0 from "@angular/core";
export class EventService {
    constructor() {
        this.emitter = new BehaviorSubject(null);
    }
    /**
     * @return {?}
     */
    get Emitter() {
        return this.emitter;
    }
}
EventService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
/** @nocollapse */
EventService.ctorParameters = () => [];
/** @nocollapse */ EventService.ngInjectableDef = i0.defineInjectable({ factory: function EventService_Factory() { return new EventService(); }, token: EventService, providedIn: "root" });
if (false) {
    /**
     * @type {?}
     * @private
     */
    EventService.prototype.emitter;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2MzLXBsYXllci8iLCJzb3VyY2VzIjpbInNyYy9hcHAvc2VydmljZXMvZXZlbnQuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sTUFBTSxDQUFDOztBQU12QyxNQUFNLE9BQU8sWUFBWTtJQUd2QjtRQUNFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxlQUFlLENBQVUsSUFBSSxDQUFDLENBQUM7SUFDcEQsQ0FBQzs7OztJQUVELElBQUksT0FBTztRQUNULE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN0QixDQUFDOzs7WUFaRixVQUFVLFNBQUM7Z0JBQ1YsVUFBVSxFQUFFLE1BQU07YUFDbkI7Ozs7Ozs7Ozs7SUFHQywrQkFBMEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IEMzZXZlbnQgfSBmcm9tICcuLi9tb2RlbHMvYzNldmVudCc7XG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnXG59KVxuZXhwb3J0IGNsYXNzIEV2ZW50U2VydmljZSB7XG5cbiAgcHJpdmF0ZSBlbWl0dGVyOiBCZWhhdmlvclN1YmplY3Q8QzNldmVudD47XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBCZWhhdmlvclN1YmplY3Q8QzNldmVudD4obnVsbCk7XG4gIH1cblxuICBnZXQgRW1pdHRlcigpOiBCZWhhdmlvclN1YmplY3Q8QzNldmVudD57XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlcjtcbiAgfVxufVxuIl19