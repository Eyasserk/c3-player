/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as i0 from "@angular/core";
var EventService = /** @class */ (function () {
    function EventService() {
        this.emitter = new BehaviorSubject(null);
    }
    Object.defineProperty(EventService.prototype, "Emitter", {
        get: /**
         * @return {?}
         */
        function () {
            return this.emitter;
        },
        enumerable: true,
        configurable: true
    });
    EventService.decorators = [
        { type: Injectable, args: [{
                    providedIn: 'root'
                },] }
    ];
    /** @nocollapse */
    EventService.ctorParameters = function () { return []; };
    /** @nocollapse */ EventService.ngInjectableDef = i0.defineInjectable({ factory: function EventService_Factory() { return new EventService(); }, token: EventService, providedIn: "root" });
    return EventService;
}());
export { EventService };
if (false) {
    /**
     * @type {?}
     * @private
     */
    EventService.prototype.emitter;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2MzLXBsYXllci8iLCJzb3VyY2VzIjpbInNyYy9hcHAvc2VydmljZXMvZXZlbnQuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sTUFBTSxDQUFDOztBQUd2QztJQU1FO1FBQ0UsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLGVBQWUsQ0FBVSxJQUFJLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRUQsc0JBQUksaUNBQU87Ozs7UUFBWDtZQUNFLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN0QixDQUFDOzs7T0FBQTs7Z0JBWkYsVUFBVSxTQUFDO29CQUNWLFVBQVUsRUFBRSxNQUFNO2lCQUNuQjs7Ozs7dUJBTkQ7Q0FpQkMsQUFiRCxJQWFDO1NBVlksWUFBWTs7Ozs7O0lBRXZCLCtCQUEwQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEJlaGF2aW9yU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgQzNldmVudCB9IGZyb20gJy4uL21vZGVscy9jM2V2ZW50JztcblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgRXZlbnRTZXJ2aWNlIHtcblxuICBwcml2YXRlIGVtaXR0ZXI6IEJlaGF2aW9yU3ViamVjdDxDM2V2ZW50PjtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEJlaGF2aW9yU3ViamVjdDxDM2V2ZW50PihudWxsKTtcbiAgfVxuXG4gIGdldCBFbWl0dGVyKCk6IEJlaGF2aW9yU3ViamVjdDxDM2V2ZW50PntcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyO1xuICB9XG59XG4iXX0=