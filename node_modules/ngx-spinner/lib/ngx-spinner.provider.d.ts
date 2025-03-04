import { EnvironmentProviders } from "@angular/core";
import { NgxSpinnerConfig } from "./config";
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
export declare const provideSpinnerConfig: (config: NgxSpinnerConfig) => EnvironmentProviders;
