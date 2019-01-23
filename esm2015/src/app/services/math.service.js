/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
export class MathService {
    constructor() { }
    /**
     * @param {?} i
     * @return {?}
     */
    pad(i) {
        return (i < 10) ? "0" + i : "" + i;
    }
    /**
     * @param {?} i
     * @return {?}
     */
    padm(i) {
        return (i < 10) ? "0" + i.toFixed(1) : "" + i.toFixed(1);
    }
}
MathService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
/** @nocollapse */
MathService.ctorParameters = () => [];
/** @nocollapse */ MathService.ngInjectableDef = i0.defineInjectable({ factory: function MathService_Factory() { return new MathService(); }, token: MathService, providedIn: "root" });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0aC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYzMtcGxheWVyLyIsInNvdXJjZXMiOlsic3JjL2FwcC9zZXJ2aWNlcy9tYXRoLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7O0FBSzNDLE1BQU0sT0FBTyxXQUFXO0lBRXRCLGdCQUFlLENBQUM7Ozs7O0lBRWhCLEdBQUcsQ0FBQyxDQUFTO1FBQ1gsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFDLENBQUMsQ0FBQztJQUNqQyxDQUFDOzs7OztJQUVELElBQUksQ0FBQyxDQUFTO1FBQ1osT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7OztZQWJGLFVBQVUsU0FBQztnQkFDVixVQUFVLEVBQUUsTUFBTTthQUNuQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgTWF0aFNlcnZpY2Uge1xuXG4gIGNvbnN0cnVjdG9yKCkge31cblxuICBwYWQoaTogbnVtYmVyKTogU3RyaW5ne1xuICAgIHJldHVybiAoaSA8IDEwKSA/IFwiMFwiK2kgOiBcIlwiK2k7IFxuICB9XG5cbiAgcGFkbShpOiBudW1iZXIpOiBTdHJpbmd7XG4gICAgcmV0dXJuIChpIDwgMTApID8gXCIwXCIraS50b0ZpeGVkKDEpIDogXCJcIitpLnRvRml4ZWQoMSk7XG4gIH1cbn1cbiJdfQ==