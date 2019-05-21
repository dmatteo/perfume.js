var EmulatedPerformance = /** @class */ (function () {
    function EmulatedPerformance(config) {
        this.config = config;
    }
    /**
     * When performance API is not available
     * returns Date.now that is limited to one-millisecond resolution.
     */
    EmulatedPerformance.prototype.now = function () {
        return Date.now() / 1000;
    };
    EmulatedPerformance.prototype.mark = function (metricName, type) { };
    EmulatedPerformance.prototype.measure = function (metricName, metric) {
        return this.getDurationByMetric(metricName, metric);
    };
    /**
     * First Paint is essentially the paint after which
     * the biggest above-the-fold layout change has happened.
     * Uses setTimeout to retrieve FCP
     */
    EmulatedPerformance.prototype.firstContentfulPaint = function (cb) {
        var _this = this;
        setTimeout(function () {
            cb(_this.getFirstPaint());
        });
    };
    /**
     * Get the duration of the timing metric or -1 if there a measurement has
     * not been made by now() fallback.
     */
    EmulatedPerformance.prototype.getDurationByMetric = function (metricName, metric) {
        var duration = metric.end - metric.start;
        return duration || 0;
    };
    /**
     * http://msdn.microsoft.com/ff974719
     * developer.mozilla.org/en-US/docs/Web/API/PerformanceTiming/navigationStart
     */
    EmulatedPerformance.prototype.getFirstPaint = function () {
        var navTiming = window.performance.timing;
        var performancePaintTiming = {
            duration: 0,
            entryType: 'paint',
            name: 'first-contentful-paint',
            startTime: 0,
        };
        if (navTiming && navTiming.navigationStart !== 0) {
            performancePaintTiming.startTime = Date.now() - navTiming.navigationStart;
        }
        return [performancePaintTiming];
    };
    return EmulatedPerformance;
}());
export default EmulatedPerformance;
//# sourceMappingURL=emulated-performance.js.map