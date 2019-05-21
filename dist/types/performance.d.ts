import 'first-input-delay';
import { IMetricEntry, IPerfumeConfig } from './perfume';
export interface IPerformance {
    config: IPerfumeConfig;
    now(): number;
    mark(metricName: string, type: string): any;
    measure(metricName: string, metric: IMetricEntry): number;
    firstContentfulPaint(cb: any): any;
}
export default class Performance implements IPerformance {
    config: IPerfumeConfig;
    /**
     * True if the browser supports the Navigation Timing API,
     * User Timing API and the PerformanceObserver Interface.
     * In Safari, the User Timing API (performance.mark()) is not available,
     * so the DevTools timeline will not be annotated with marks.
     * Support: developer.mozilla.org/en-US/docs/Web/API/Performance/mark
     * Support: developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver
     */
    static supported(): boolean;
    /**
     * For now only Chrome fully support the PerformanceObserver interface
     * and the entryType "paint".
     * Firefox 58: https://bugzilla.mozilla.org/show_bug.cgi?id=1403027
     */
    static supportedPerformanceObserver(): boolean;
    private perfObserver;
    constructor(config: IPerfumeConfig);
    /**
     * When performance API available
     * returns a DOMHighResTimeStamp, measured in milliseconds, accurate to five
     * thousandths of a millisecond (5 microseconds).
     */
    now(): number;
    mark(metricName: string, type: string): void;
    measure(metricName: string, metric: IMetricEntry): number;
    /**
     * First Paint is essentially the paint after which
     * the biggest above-the-fold layout change has happened.
     * PerformanceObserver subscribes to performance events as they happen
     * and respond to them asynchronously.
     * entry.name will be either 'first-paint' or 'first-contentful-paint'
     */
    firstContentfulPaint(cb: (entries: any[]) => void): void;
    /**
     * Get the duration of the timing metric or -1 if there a measurement has
     * not been made by the User Timing API
     */
    private getDurationByMetric;
    /**
     * Return the last PerformanceEntry objects for the given name.
     */
    private getMeasurementForGivenName;
    private performanceObserverCb;
}
