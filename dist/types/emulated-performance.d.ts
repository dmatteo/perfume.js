import { IPerformance } from './performance';
import { IMetricEntry, IPerfumeConfig } from './perfume';
export interface IPerformancePaintTiming {
    name: string;
    entryType: string;
    startTime: number;
    duration: number;
}
export default class EmulatedPerformance implements IPerformance {
    config: IPerfumeConfig;
    constructor(config: IPerfumeConfig);
    /**
     * When performance API is not available
     * returns Date.now that is limited to one-millisecond resolution.
     */
    now(): number;
    mark(metricName: string, type: string): void;
    measure(metricName: string, metric: IMetricEntry): number;
    /**
     * First Paint is essentially the paint after which
     * the biggest above-the-fold layout change has happened.
     * Uses setTimeout to retrieve FCP
     */
    firstContentfulPaint(cb: (entries: any[]) => void): void;
    /**
     * Get the duration of the timing metric or -1 if there a measurement has
     * not been made by now() fallback.
     */
    private getDurationByMetric;
    /**
     * http://msdn.microsoft.com/ff974719
     * developer.mozilla.org/en-US/docs/Web/API/PerformanceTiming/navigationStart
     */
    private getFirstPaint;
}
