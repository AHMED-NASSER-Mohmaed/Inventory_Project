import * as i0 from '@angular/core';
import { Injectable, InjectionToken, Pipe, Component, ChangeDetectionStrategy, Optional, Inject, Input, ViewChild, NgModule, makeEnvironmentProviders } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { trigger, state, style, transition, animate } from '@angular/animations';
import * as i1 from '@angular/platform-browser';
import { NgIf, NgFor } from '@angular/common';

const LOADERS = {
    "ball-8bits": 16,
    "ball-atom": 4,
    "ball-beat": 3,
    "ball-circus": 5,
    "ball-climbing-dot": 4,
    "ball-clip-rotate": 1,
    "ball-clip-rotate-multiple": 2,
    "ball-clip-rotate-pulse": 2,
    "ball-elastic-dots": 5,
    "ball-fall": 3,
    "ball-fussion": 4,
    "ball-grid-beat": 9,
    "ball-grid-pulse": 9,
    "ball-newton-cradle": 4,
    "ball-pulse": 3,
    "ball-pulse-rise": 5,
    "ball-pulse-sync": 3,
    "ball-rotate": 1,
    "ball-running-dots": 5,
    "ball-scale": 1,
    "ball-scale-multiple": 3,
    "ball-scale-pulse": 2,
    "ball-scale-ripple": 1,
    "ball-scale-ripple-multiple": 3,
    "ball-spin": 8,
    "ball-spin-clockwise": 8,
    "ball-spin-clockwise-fade": 8,
    "ball-spin-clockwise-fade-rotating": 8,
    "ball-spin-fade": 8,
    "ball-spin-fade-rotating": 8,
    "ball-spin-rotate": 2,
    "ball-square-clockwise-spin": 8,
    "ball-square-spin": 8,
    "ball-triangle-path": 3,
    "ball-zig-zag": 2,
    "ball-zig-zag-deflect": 2,
    cog: 1,
    "cube-transition": 2,
    fire: 3,
    "line-scale": 5,
    "line-scale-party": 5,
    "line-scale-pulse-out": 5,
    "line-scale-pulse-out-rapid": 5,
    "line-spin-clockwise-fade": 8,
    "line-spin-clockwise-fade-rotating": 8,
    "line-spin-fade": 8,
    "line-spin-fade-rotating": 8,
    pacman: 6,
    "square-jelly-box": 2,
    "square-loader": 1,
    "square-spin": 1,
    timer: 1,
    "triangle-skew-spin": 1,
};
const DEFAULTS = {
    BD_COLOR: "rgba(51,51,51,0.8)",
    SPINNER_COLOR: "#fff",
    Z_INDEX: 99999,
};
const PRIMARY_SPINNER = "primary";
class NgxSpinner {
    constructor(init) {
        Object.assign(this, init);
    }
    static create(init) {
        if (!init?.template && !init?.type) {
            console.warn(`[ngx-spinner]: Property "type" is missed. Please, provide animation type to <ngx-spinner> component
        and ensure css is added to angular.json file`);
        }
        return new NgxSpinner(init);
    }
}

class NgxSpinnerService {
    /**
     * Creates an instance of NgxSpinnerService.
     * @memberof NgxSpinnerService
     */
    constructor() {
        /**
         * Spinner observable
         *
         * @memberof NgxSpinnerService
         */
        this.spinnerObservable = new BehaviorSubject(null);
    }
    /**
     * Get subscription of desired spinner
     * @memberof NgxSpinnerService
     **/
    getSpinner(name) {
        return this.spinnerObservable
            .asObservable()
            .pipe(filter((x) => x && x.name === name));
    }
    /**
     * To show spinner
     *
     * @memberof NgxSpinnerService
     */
    show(name = PRIMARY_SPINNER, spinner) {
        return new Promise((resolve, _reject) => {
            setTimeout(() => {
                if (spinner && Object.keys(spinner).length) {
                    spinner["name"] = name;
                    this.spinnerObservable.next(new NgxSpinner({ ...spinner, show: true }));
                    resolve(true);
                }
                else {
                    this.spinnerObservable.next(new NgxSpinner({ name, show: true }));
                    resolve(true);
                }
            }, 10);
        });
    }
    /**
     * To hide spinner
     *
     * @memberof NgxSpinnerService
     */
    hide(name = PRIMARY_SPINNER, debounce = 10) {
        return new Promise((resolve, _reject) => {
            setTimeout(() => {
                this.spinnerObservable.next(new NgxSpinner({ name, show: false }));
                resolve(true);
            }, debounce);
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.1.6", ngImport: i0, type: NgxSpinnerService, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.1.6", ngImport: i0, type: NgxSpinnerService, providedIn: "root" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.1.6", ngImport: i0, type: NgxSpinnerService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: "root",
                }]
        }], ctorParameters: () => [] });

const NGX_SPINNER_CONFIG = new InjectionToken("NGX_SPINNER_CONFIG");

class SafeHtmlPipe {
    constructor(sanitizer) {
        this.sanitizer = sanitizer;
    }
    transform(value) {
        return value ? this.sanitizer.bypassSecurityTrustHtml(value) : '';
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.1.6", ngImport: i0, type: SafeHtmlPipe, deps: [{ token: i1.DomSanitizer }], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "19.1.6", ngImport: i0, type: SafeHtmlPipe, isStandalone: true, name: "safeHtml" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.1.6", ngImport: i0, type: SafeHtmlPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: "safeHtml",
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i1.DomSanitizer }] });

class NgxSpinnerComponent {
    // TODO: https://github.com/Napster2210/ngx-spinner/issues/259
    // @HostListener("document:keydown", ["$event"])
    // handleKeyboardEvent(event: KeyboardEvent) {
    //   if (this.spinnerDOM && this.spinnerDOM.nativeElement) {
    //     if (
    //       this.fullScreen ||
    //       (!this.fullScreen && this.isSpinnerZone(event.target))
    //     ) {
    //       event.returnValue = false;
    //       event.preventDefault();
    //     }
    //   }
    // }
    /**
     * Creates an instance of NgxSpinnerComponent.
     *
     * @memberof NgxSpinnerComponent
     */
    constructor(spinnerService, changeDetector, elementRef, globalConfig) {
        this.spinnerService = spinnerService;
        this.changeDetector = changeDetector;
        this.elementRef = elementRef;
        this.globalConfig = globalConfig;
        /**
         * To enable/disable animation
         *
         * @type {boolean}
         * @memberof NgxSpinnerComponent
         */
        this.disableAnimation = false;
        /**
         * Spinner Object
         *
         * @memberof NgxSpinnerComponent
         */
        this.spinner = new NgxSpinner();
        /**
         * Unsubscribe from spinner's observable
         *
         * @memberof NgxSpinnerComponent
         **/
        this.ngUnsubscribe = new Subject();
        /**
         * To set default ngx-spinner options
         *
         * @memberof NgxSpinnerComponent
         */
        this.setDefaultOptions = () => {
            const { type } = this.globalConfig ?? {};
            this.spinner = NgxSpinner.create({
                name: this.name,
                bdColor: this.bdColor,
                size: this.size,
                color: this.color,
                type: this.type ?? type,
                fullScreen: this.fullScreen,
                divArray: this.divArray,
                divCount: this.divCount,
                show: this.show,
                zIndex: this.zIndex,
                template: this.template,
                showSpinner: this.showSpinner,
            });
        };
        this.bdColor = DEFAULTS.BD_COLOR;
        this.zIndex = DEFAULTS.Z_INDEX;
        this.color = DEFAULTS.SPINNER_COLOR;
        this.size = "large";
        this.fullScreen = true;
        this.name = PRIMARY_SPINNER;
        this.template = null;
        this.showSpinner = false;
        this.divArray = [];
        this.divCount = 0;
        this.show = false;
    }
    initObservable() {
        this.spinnerService
            .getSpinner(this.name)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((spinner) => {
            this.setDefaultOptions();
            Object.assign(this.spinner, spinner);
            if (spinner.show) {
                this.onInputChange();
            }
            this.changeDetector.detectChanges();
        });
    }
    /**
     * Initialization method
     *
     * @memberof NgxSpinnerComponent
     */
    ngOnInit() {
        this.setDefaultOptions();
        this.initObservable();
    }
    /**
     * To check event triggers inside the Spinner Zone
     *
     * @param {*} element
     * @returns {boolean}
     * @memberof NgxSpinnerComponent
     */
    isSpinnerZone(element) {
        if (element === this.elementRef.nativeElement.parentElement) {
            return true;
        }
        return element.parentNode && this.isSpinnerZone(element.parentNode);
    }
    /**
     * On changes event for input variables
     *
     * @memberof NgxSpinnerComponent
     */
    ngOnChanges(changes) {
        for (const propName in changes) {
            if (propName) {
                const changedProp = changes[propName];
                if (changedProp.isFirstChange()) {
                    return;
                }
                else if (typeof changedProp.currentValue !== "undefined" &&
                    changedProp.currentValue !== changedProp.previousValue) {
                    if (changedProp.currentValue !== "") {
                        this.spinner[propName] = changedProp.currentValue;
                        if (propName === "showSpinner") {
                            if (changedProp.currentValue) {
                                this.spinnerService.show(this.spinner.name, this.spinner);
                            }
                            else {
                                this.spinnerService.hide(this.spinner.name);
                            }
                        }
                        if (propName === "name") {
                            this.initObservable();
                        }
                    }
                }
            }
        }
    }
    /**
     * To get class for spinner
     *
     * @memberof NgxSpinnerComponent
     */
    getClass(type, size) {
        this.spinner.divCount = LOADERS[type];
        this.spinner.divArray = Array(this.spinner.divCount)
            .fill(0)
            .map((_, i) => i);
        let sizeClass = "";
        switch (size.toLowerCase()) {
            case "small":
                sizeClass = "la-sm";
                break;
            case "medium":
                sizeClass = "la-2x";
                break;
            case "large":
                sizeClass = "la-3x";
                break;
            default:
                break;
        }
        return "la-" + type + " " + sizeClass;
    }
    /**
     * Check if input variables have changed
     *
     * @memberof NgxSpinnerComponent
     */
    onInputChange() {
        this.spinner.class = this.getClass(this.spinner.type, this.spinner.size);
    }
    /**
     * Component destroy event
     *
     * @memberof NgxSpinnerComponent
     */
    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.1.6", ngImport: i0, type: NgxSpinnerComponent, deps: [{ token: NgxSpinnerService }, { token: i0.ChangeDetectorRef }, { token: i0.ElementRef }, { token: NGX_SPINNER_CONFIG, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.1.6", type: NgxSpinnerComponent, isStandalone: true, selector: "ngx-spinner", inputs: { bdColor: "bdColor", size: "size", color: "color", type: "type", fullScreen: "fullScreen", name: "name", zIndex: "zIndex", template: "template", showSpinner: "showSpinner", disableAnimation: "disableAnimation" }, viewQueries: [{ propertyName: "spinnerDOM", first: true, predicate: ["overlay"], descendants: true }], usesOnChanges: true, ngImport: i0, template: "<div\n  [@.disabled]=\"disableAnimation\"\n  [@fadeIn]=\"'in'\"\n  *ngIf=\"spinner.show\"\n  class=\"ngx-spinner-overlay\"\n  [style.background-color]=\"spinner.bdColor\"\n  [style.z-index]=\"spinner.zIndex\"\n  [style.position]=\"spinner.fullScreen ? 'fixed' : 'absolute'\"\n  #overlay\n>\n  <div *ngIf=\"!template\" [class]=\"spinner.class\" [style.color]=\"spinner.color\">\n    <div *ngFor=\"let index of spinner.divArray\"></div>\n  </div>\n  <div *ngIf=\"template\" [innerHTML]=\"template | safeHtml\"></div>\n  <div class=\"loading-text\" [style.z-index]=\"spinner.zIndex\">\n    <ng-content></ng-content>\n  </div>\n</div>\n", styles: [".ngx-spinner-overlay{position:fixed;top:0;left:0;width:100%;height:100%}.ngx-spinner-overlay>div:not(.loading-text){top:50%;left:50%;margin:0;position:absolute;transform:translate(-50%,-50%)}.loading-text{position:absolute;top:60%;left:50%;transform:translate(-50%,-60%)}\n"], dependencies: [{ kind: "pipe", type: SafeHtmlPipe, name: "safeHtml" }, { kind: "directive", type: NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: NgFor, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }], animations: [
            trigger("fadeIn", [
                state("in", style({ opacity: 1 })),
                transition(":enter", [style({ opacity: 0 }), animate(300)]),
                transition(":leave", animate(200, style({ opacity: 0 }))),
            ]),
        ], changeDetection: i0.ChangeDetectionStrategy.OnPush }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.1.6", ngImport: i0, type: NgxSpinnerComponent, decorators: [{
            type: Component,
            args: [{ imports: [SafeHtmlPipe, NgIf, NgFor], selector: "ngx-spinner", changeDetection: ChangeDetectionStrategy.OnPush, animations: [
                        trigger("fadeIn", [
                            state("in", style({ opacity: 1 })),
                            transition(":enter", [style({ opacity: 0 }), animate(300)]),
                            transition(":leave", animate(200, style({ opacity: 0 }))),
                        ]),
                    ], template: "<div\n  [@.disabled]=\"disableAnimation\"\n  [@fadeIn]=\"'in'\"\n  *ngIf=\"spinner.show\"\n  class=\"ngx-spinner-overlay\"\n  [style.background-color]=\"spinner.bdColor\"\n  [style.z-index]=\"spinner.zIndex\"\n  [style.position]=\"spinner.fullScreen ? 'fixed' : 'absolute'\"\n  #overlay\n>\n  <div *ngIf=\"!template\" [class]=\"spinner.class\" [style.color]=\"spinner.color\">\n    <div *ngFor=\"let index of spinner.divArray\"></div>\n  </div>\n  <div *ngIf=\"template\" [innerHTML]=\"template | safeHtml\"></div>\n  <div class=\"loading-text\" [style.z-index]=\"spinner.zIndex\">\n    <ng-content></ng-content>\n  </div>\n</div>\n", styles: [".ngx-spinner-overlay{position:fixed;top:0;left:0;width:100%;height:100%}.ngx-spinner-overlay>div:not(.loading-text){top:50%;left:50%;margin:0;position:absolute;transform:translate(-50%,-50%)}.loading-text{position:absolute;top:60%;left:50%;transform:translate(-50%,-60%)}\n"] }]
        }], ctorParameters: () => [{ type: NgxSpinnerService }, { type: i0.ChangeDetectorRef }, { type: i0.ElementRef }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [NGX_SPINNER_CONFIG]
                }] }], propDecorators: { bdColor: [{
                type: Input
            }], size: [{
                type: Input
            }], color: [{
                type: Input
            }], type: [{
                type: Input
            }], fullScreen: [{
                type: Input
            }], name: [{
                type: Input
            }], zIndex: [{
                type: Input
            }], template: [{
                type: Input
            }], showSpinner: [{
                type: Input
            }], disableAnimation: [{
                type: Input
            }], spinnerDOM: [{
                type: ViewChild,
                args: ["overlay"]
            }] } });

class NgxSpinnerModule {
    static forRoot(config) {
        return {
            ngModule: NgxSpinnerModule,
            providers: [{ provide: NGX_SPINNER_CONFIG, useValue: config }],
        };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.1.6", ngImport: i0, type: NgxSpinnerModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.1.6", ngImport: i0, type: NgxSpinnerModule, imports: [NgxSpinnerComponent, SafeHtmlPipe], exports: [NgxSpinnerComponent] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.1.6", ngImport: i0, type: NgxSpinnerModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.1.6", ngImport: i0, type: NgxSpinnerModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [NgxSpinnerComponent, SafeHtmlPipe],
                    exports: [NgxSpinnerComponent],
                }]
        }] });

/**
 * Provides the configuration for the NgxSpinner.
 *
 * @param config - The configuration object for NgxSpinner.
 * @returns An array of environment providers configured with the given NgxSpinner configuration.
 * @example
 * ```ts
 * import { provideSpinnerConfig } from 'ngx-spinner';
 *
 * bootstrap(AppComponent, {
 *   providers: [
 *     provideSpinnerConfig({type: 'ball-scale-multiple'}),
 *   ],
 * })
 */
const provideSpinnerConfig = (config) => {
    const providers = [
        {
            provide: NGX_SPINNER_CONFIG,
            useValue: config,
        },
    ];
    return makeEnvironmentProviders(providers);
};

/**
 * Generated bundle index. Do not edit.
 */

export { DEFAULTS, LOADERS, NgxSpinner, NgxSpinnerComponent, NgxSpinnerModule, NgxSpinnerService, PRIMARY_SPINNER, provideSpinnerConfig };
//# sourceMappingURL=ngx-spinner.mjs.map
