/*!
 * Perfume.js v2.1.2 (http://zizzamia.github.io/perfume)
 * Copyright 2018 The Perfume Authors (https://github.com/Zizzamia/perfume.js/graphs/contributors)
 * Licensed under MIT (https://github.com/Zizzamia/perfume.js/blob/master/LICENSE)
 * @license
 */
import { BrowserInfo } from './detect-browser';
export interface IPerfumeConfig {
    firstContentfulPaint: boolean;
    firstInputDelay: boolean;
    firstPaint: boolean;
    analyticsTracker?: (metricName: string, duration: number, browser?: BrowserInfo | any, customProperties?: {
        [key: string]: any;
    }) => void;
    browserTracker?: boolean;
    googleAnalytics: IGoogleAnalyticsConfig;
    logPrefix: string;
    logging: boolean;
    maxMeasureTime: number;
    warning: boolean;
    debugging: boolean;
}
export interface IPerfumeOptions {
    firstContentfulPaint?: boolean;
    firstInputDelay?: boolean;
    firstPaint?: boolean;
    analyticsTracker?: (metricName: string, duration: number, browser?: BrowserInfo | any) => void;
    browserTracker?: boolean;
    googleAnalytics?: IGoogleAnalyticsConfig;
    logPrefix?: string;
    logging?: boolean;
    maxMeasureTime?: number;
    warning?: boolean;
    debugging?: boolean;
}
export interface IGoogleAnalyticsConfig {
    enable: boolean;
    timingVar: string;
}
export interface IMetricEntry {
    start: number;
    end: number;
}
export declare interface IPerformanceEntry {
    duration: number;
    entryType: 'longtask' | 'measure' | 'navigation' | 'paint' | 'resource';
    name: string;
    startTime: number;
}
declare global {
    interface Window {
        ga: any;
    }
}
export default class Perfume {
    config: IPerfumeConfig;
    firstPaintDuration: number;
    firstContentfulPaintDuration: number;
    firstInputDelayDuration: number;
    observeFirstContentfulPaint?: Promise<number>;
    observeFirstInputDelay?: Promise<number>;
    private browser;
    private isHidden;
    private logMetricWarn;
    private queue;
    private metrics;
    private observers;
    private perf;
    private perfEmulated?;
    constructor(options?: IPerfumeOptions);
    /**
     * Start performance measurement
     */
    start(metricName: string): void;
    /**
     * End performance measurement
     */
    end(metricName: string, customProperties?: {
        [key: string]: any;
    }): void | number;
    /**
     * End performance measurement after first paint from the beging of it
     */
    endPaint(metricName: string, customProperties?: {
        [key: string]: any;
    }): Promise<void | number>;
    /**
     * Coloring Text in Browser Console
     */
    log(metricName: string, duration: number, customProperties?: {
        [key: string]: any;
    }): void;
    /**
     * Coloring Debugging Text in Browser Console
     */
    logDebug(methodName: string, debugValue?: any): void;
    /**
     * Sends the User timing measure to Google Analytics.
     * ga('send', 'timing', [timingCategory], [timingVar], [timingValue])
     * timingCategory: metricName
     * timingVar: googleAnalytics.timingVar
     * timingValue: The value of duration rounded to the nearest integer
     */
    sendTiming(metricName: string, duration: number, customProperties?: {
        [key: string]: string;
    }): void;
    private addBrowserToMetricName;
    private checkMetricName;
    private didVisibilityChange;
    private firstContentfulPaintCb;
    private initFirstPaint;
    private initFirstInputDelay;
    /**
     * From visibilitychange listener it saves only when
     * the page gets hidden, because it's important to not
     * use the wrong "hidden" value when send timing or logging.
     */
    private onVisibilityChange;
    /**
     * Dispatches the metric duration into internal logs
     * and the external time tracking service.
     */
    private logMetric;
    /**
     * Ensures console.warn exist and logging is enable for
     * warning messages
     */
    private logWarn;
}
