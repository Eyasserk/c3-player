/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
var MathService = /** @class */ (function () {
    function MathService() {
    }
    /**
     * @param {?} i
     * @return {?}
     */
    MathService.prototype.pad = /**
     * @param {?} i
     * @return {?}
     */
    function (i) {
        return (i < 10) ? "0" + i : "" + i;
    };
    /**
     * @param {?} i
     * @return {?}
     */
    MathService.prototype.padm = /**
     * @param {?} i
     * @return {?}
     */
    function (i) {
        return (i < 10) ? "0" + i.toFixed(1) : "" + i.toFixed(1);
    };
    MathService.decorators = [
        { type: Injectable, args: [{
                    providedIn: 'root'
                },] }
    ];
    /** @nocollapse */
    MathService.ctorParameters = function () { return []; };
    /** @nocollapse */ MathService.ngInjectableDef = i0.defineInjectable({ factory: function MathService_Factory() { return new MathService(); }, token: MathService, providedIn: "root" });
    return MathService;
}());
export { MathService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0aC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYzMtcGxheWVyLyIsInNvdXJjZXMiOlsic3JjL2FwcC9zZXJ2aWNlcy9tYXRoLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7O0FBRTNDO0lBS0U7SUFBZSxDQUFDOzs7OztJQUVoQix5QkFBRzs7OztJQUFILFVBQUksQ0FBUztRQUNYLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBQyxDQUFDLENBQUM7SUFDakMsQ0FBQzs7Ozs7SUFFRCwwQkFBSTs7OztJQUFKLFVBQUssQ0FBUztRQUNaLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2RCxDQUFDOztnQkFiRixVQUFVLFNBQUM7b0JBQ1YsVUFBVSxFQUFFLE1BQU07aUJBQ25COzs7OztzQkFKRDtDQWdCQyxBQWRELElBY0M7U0FYWSxXQUFXIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdyb290J1xufSlcbmV4cG9ydCBjbGFzcyBNYXRoU2VydmljZSB7XG5cbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIHBhZChpOiBudW1iZXIpOiBTdHJpbmd7XG4gICAgcmV0dXJuIChpIDwgMTApID8gXCIwXCIraSA6IFwiXCIraTsgXG4gIH1cblxuICBwYWRtKGk6IG51bWJlcik6IFN0cmluZ3tcbiAgICByZXR1cm4gKGkgPCAxMCkgPyBcIjBcIitpLnRvRml4ZWQoMSkgOiBcIlwiK2kudG9GaXhlZCgxKTtcbiAgfVxufVxuIl19