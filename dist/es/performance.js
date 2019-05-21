// Import Polyfills
import 'first-input-delay';
var Performance = /** @class */ (function () {
    function Performance(config) {
        this.config = config;
    }
    /**
     * True if the browser supports the Navigation Timing API,
     * User Timing API and the PerformanceObserver Interface.
     * In Safari, the User Timing API (performance.mark()) is not available,
     * so the DevTools timeline will not be annotated with marks.
     * Support: developer.mozilla.org/en-US/docs/Web/API/Performance/mark
     * Support: developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver
     */
    Performance.supported = function () {
        return window.performance && !!performance.now && !!performance.mark;
    };
    /**
     * For now only Chrome fully support the PerformanceObserver interface
     * and the entryType "paint".
     * Firefox 58: https://bugzilla.mozilla.org/show_bug.cgi?id=1403027
     */
    Performance.supportedPerformanceObserver = function () {
        return window.chrome && 'PerformanceObserver' in window;
    };
    /**
     * When performance API available
     * returns a DOMHighResTimeStamp, measured in milliseconds, accurate to five
     * thousandths of a millisecond (5 microseconds).
     */
    Performance.prototype.now = function () {
        return window.performance.now();
    };
    Performance.prototype.mark = function (metricName, type) {
        var mark = "mark_" + metricName + "_" + type;
        window.performance.mark(mark);
    };
    Performance.prototype.measure = function (metricName, metric) {
        var startMark = "mark_" + metricName + "_start";
        var endMark = "mark_" + metricName + "_end";
        window.performance.measure(metricName, startMark, endMark);
        return this.getDurationByMetric(metricName, metric);
    };
    /**
     * First Paint is essentially the paint after which
     * the biggest above-the-fold layout change has happened.
     * PerformanceObserver subscribes to performance events as they happen
     * and respond to them asynchronously.
     * entry.name will be either 'first-paint' or 'first-contentful-paint'
     */
    Performance.prototype.firstContentfulPaint = function (cb) {
        this.perfObserver = new PerformanceObserver(this.performanceObserverCb.bind(this, cb));
        this.perfObserver.observe({ entryTypes: ['paint'] });
    };
    /**
     * Get the duration of the timing metric or -1 if there a measurement has
     * not been made by the User Timing API
     */
    Performance.prototype.getDurationByMetric = function (metricName, metric) {
        var entry = this.getMeasurementForGivenName(metricName);
        if (entry && entry.entryType === 'measure') {
            return entry.duration;
        }
        return -1;
    };
    /**
     * Return the last PerformanceEntry objects for the given name.
     */
    Performance.prototype.getMeasurementForGivenName = function (metricName) {
        var entries = window.performance.getEntriesByName(metricName);
        return entries[entries.length - 1];
    };
    Performance.prototype.performanceObserverCb = function (cb, entryList) {
        var _this = this;
        var entries = entryList.getEntries();
        cb(entries);
        entries.forEach(function (performancePaintTiming) {
            if (_this.config.firstContentfulPaint &&
                performancePaintTiming.name === 'first-contentful-paint') {
                _this.perfObserver.disconnect();
            }
        });
    };
    return Performance;
}());
export default Performance;
//# sourceMappingURL=performance.js.map