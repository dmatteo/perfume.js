/*!
 * Perfume.js v2.1.2 (http://zizzamia.github.io/perfume)
 * Copyright 2018 The Perfume Authors (https://github.com/Zizzamia/perfume.js/graphs/contributors)
 * Licensed under MIT (https://github.com/Zizzamia/perfume.js/blob/master/LICENSE)
 * @license
 */
import { detect } from './detect-browser';
import { IdleQueue } from './idle-queue';
import EmulatedPerformance from './emulated-performance';
import Performance from './performance';
var Perfume = /** @class */ (function () {
    function Perfume(options) {
        if (options === void 0) { options = {}; }
        var _this = this;
        this.config = {
            // Metrics
            firstContentfulPaint: false,
            firstPaint: false,
            firstInputDelay: false,
            // Analytics
            googleAnalytics: {
                enable: false,
                timingVar: 'name',
            },
            browserTracker: false,
            // Logging
            logPrefix: 'Perfume.js:',
            logging: true,
            maxMeasureTime: 15000,
            warning: false,
            debugging: false,
        };
        this.firstPaintDuration = 0;
        this.firstContentfulPaintDuration = 0;
        this.firstInputDelayDuration = 0;
        this.isHidden = false;
        this.logMetricWarn = 'Please provide a metric name';
        this.metrics = new Map();
        this.observers = new Map();
        this.didVisibilityChange = function () {
            if (document.hidden) {
                _this.isHidden = document.hidden;
            }
        };
        // Extend default config with external options
        this.config = Object.assign({}, this.config, options);
        // Init performance implementation based on supported browser APIs
        this.perf = Performance.supported()
            ? new Performance(this.config)
            : new EmulatedPerformance(this.config);
        // In case we want to track Browser version and OS
        if (this.config.browserTracker) {
            this.browser = detect();
        }
        // In case we can not use Performance Observer for initFirstPaint
        if (!Performance.supportedPerformanceObserver()) {
            this.perfEmulated = new EmulatedPerformance(this.config);
        }
        // Init observe FCP  and creates the Promise to observe metric
        if (this.config.firstPaint || this.config.firstContentfulPaint) {
            this.observeFirstContentfulPaint = new Promise(function (resolve) {
                _this.logDebug('observeFirstContentfulPaint');
                _this.observers.set('fcp', resolve);
                _this.initFirstPaint();
            });
        }
        // FID needs to be initialized as soon as Perfume is available, which returns
        // a Promise that can be observed
        if (this.config.firstInputDelay) {
            this.observeFirstInputDelay = new Promise(function (resolve) {
                _this.observers.set('fid', resolve);
                _this.initFirstInputDelay();
            });
        }
        // Init visibilitychange listener
        this.onVisibilityChange();
        // Ensures the queue is run immediately whenever the page
        // is in a state where it might soon be unloaded.
        // https://philipwalton.com/articles/idle-until-urgent/
        this.queue = new IdleQueue({ ensureTasksRun: true });
    }
    /**
     * Start performance measurement
     */
    Perfume.prototype.start = function (metricName) {
        if (!this.checkMetricName(metricName)) {
            return;
        }
        if (this.metrics.has(metricName)) {
            this.logWarn(this.config.logPrefix, 'Recording already started.');
            return;
        }
        this.metrics.set(metricName, {
            end: 0,
            start: this.perf.now(),
        });
        // Creates a timestamp in the browser's performance entry buffer
        this.perf.mark(metricName, 'start');
        // Reset hidden value
        this.isHidden = false;
    };
    /**
     * End performance measurement
     */
    Perfume.prototype.end = function (metricName, customProperties) {
        var _this = this;
        if (!this.checkMetricName(metricName)) {
            return;
        }
        var metric = this.metrics.get(metricName);
        if (!metric) {
            this.logWarn(this.config.logPrefix, 'Recording already stopped.');
            return;
        }
        // End Performance Mark
        metric.end = this.perf.now();
        this.perf.mark(metricName, 'end');
        // Get duration and change it to a two decimal value
        var duration = this.perf.measure(metricName, metric);
        var duration2Decimal = parseFloat(duration.toFixed(2));
        this.metrics.delete(metricName);
        this.queue.pushTask(function () {
            // Log to console, delete metric and send to analytics tracker
            _this.log(metricName, duration2Decimal, customProperties);
            _this.sendTiming(metricName, duration2Decimal, customProperties);
        });
        return duration2Decimal;
    };
    /**
     * End performance measurement after first paint from the beging of it
     */
    Perfume.prototype.endPaint = function (metricName, customProperties) {
        var _this = this;
        return new Promise(function (resolve) {
            setTimeout(function () {
                var duration = _this.end(metricName, customProperties);
                resolve(duration);
            });
        });
    };
    /**
     * Coloring Text in Browser Console
     */
    Perfume.prototype.log = function (metricName, duration, customProperties) {
        // Don't log when page is hidden or has disabled logging
        if (this.isHidden || !this.config.logging) {
            return;
        }
        if (!metricName) {
            this.logWarn(this.config.logPrefix, this.logMetricWarn);
            return;
        }
        var durationMs = duration.toFixed(2);
        var style = 'color: #ff6d00;font-size:11px;';
        var text = "%c " + this.config.logPrefix + " " + metricName + " " + durationMs + " ms";
        if (customProperties && Object.keys(customProperties).length > 0) {
            text += "\nCustom Properties: " + JSON.stringify(customProperties);
        }
        window.console.log(text, style);
    };
    /**
     * Coloring Debugging Text in Browser Console
     */
    Perfume.prototype.logDebug = function (methodName, debugValue) {
        if (debugValue === void 0) { debugValue = ''; }
        if (!this.config.debugging) {
            return;
        }
        window.console.log("Perfume.js debugging " + methodName + ":", debugValue);
    };
    /**
     * Sends the User timing measure to Google Analytics.
     * ga('send', 'timing', [timingCategory], [timingVar], [timingValue])
     * timingCategory: metricName
     * timingVar: googleAnalytics.timingVar
     * timingValue: The value of duration rounded to the nearest integer
     */
    Perfume.prototype.sendTiming = function (metricName, duration, customProperties) {
        // Doesn't send timing when page is hidden
        if (this.isHidden) {
            return;
        }
        // Get Browser from userAgent
        var browser = this.config.browserTracker ? this.browser : undefined;
        var metricNameWithBrowser = this.addBrowserToMetricName(metricName);
        // Send metric to custom Analytics service,
        // the default choice is Google Analytics
        if (this.config.analyticsTracker) {
            this.config.analyticsTracker(metricName, duration, browser, customProperties);
        }
        // Stop sending timing to GA if not enabled
        if (!this.config.googleAnalytics.enable) {
            return;
        }
        if (!window.ga) {
            this.logWarn(this.config.logPrefix, 'Google Analytics has not been loaded');
            return;
        }
        var durationInteger = Math.round(duration);
        window.ga('send', 'timing', metricNameWithBrowser, this.config.googleAnalytics.timingVar, durationInteger);
    };
    Perfume.prototype.addBrowserToMetricName = function (metricName) {
        if (!this.config.browserTracker) {
            return metricName;
        }
        var metricNameWithBrowser = metricName;
        // Check if Browser Name exist
        if (this.browser.name) {
            var browserName = this.browser.name.replace(/\s/g, '');
            metricNameWithBrowser += "." + browserName;
            // Check if Browser OS exist
            if (this.browser.os) {
                var browserOS = this.browser.os.replace(/\s/g, '');
                metricNameWithBrowser += "." + browserOS;
            }
        }
        return metricNameWithBrowser;
    };
    Perfume.prototype.checkMetricName = function (metricName) {
        if (metricName) {
            return true;
        }
        this.logWarn(this.config.logPrefix, this.logMetricWarn);
        return false;
    };
    Perfume.prototype.firstContentfulPaintCb = function (entries) {
        var _this = this;
        this.logDebug('firstContentfulPaintCb', entries);
        // Logging Performance Paint Timing
        entries.forEach(function (performancePaintTiming) {
            _this.queue.pushTask(function () {
                if (_this.config.firstPaint &&
                    performancePaintTiming.name === 'first-paint') {
                    _this.logMetric(performancePaintTiming.startTime, 'First Paint', 'firstPaint');
                }
                if (_this.config.firstContentfulPaint &&
                    performancePaintTiming.name === 'first-contentful-paint') {
                    _this.logMetric(performancePaintTiming.startTime, 'First Contentful Paint', 'firstContentfulPaint');
                }
            });
        });
    };
    Perfume.prototype.initFirstPaint = function () {
        this.logDebug('initFirstPaint');
        // Checks if use Performance or the EmulatedPerformance instance
        if (Performance.supportedPerformanceObserver()) {
            this.logDebug('initFirstPaint.supportedPerformanceObserver');
            try {
                this.perf.firstContentfulPaint(this.firstContentfulPaintCb.bind(this));
            }
            catch (e) {
                this.logWarn(this.config.logPrefix, 'initFirstPaint failed');
            }
        }
        else if (this.perfEmulated) {
            this.logDebug('initFirstPaint.perfEmulated');
            this.perfEmulated.firstContentfulPaint(this.firstContentfulPaintCb.bind(this));
        }
    };
    Perfume.prototype.initFirstInputDelay = function () {
        var _this = this;
        if (Performance.supported() && this.config.firstInputDelay) {
            // perfMetrics is exposed by the FID Polyfill
            perfMetrics.onFirstInputDelay(function (duration, event) {
                _this.queue.pushTask(function () {
                    _this.logMetric(duration, 'First Input Delay', 'firstInputDelay');
                });
            });
        }
    };
    /**
     * From visibilitychange listener it saves only when
     * the page gets hidden, because it's important to not
     * use the wrong "hidden" value when send timing or logging.
     */
    Perfume.prototype.onVisibilityChange = function () {
        if (typeof document.hidden !== 'undefined') {
            // Opera 12.10 and Firefox 18 and later support
            document.addEventListener('visibilitychange', this.didVisibilityChange);
        }
    };
    /**
     * Dispatches the metric duration into internal logs
     * and the external time tracking service.
     */
    Perfume.prototype.logMetric = function (duration, logText, metricName) {
        var duration2Decimal = parseFloat(duration.toFixed(2));
        // Stop Analytics and Logging for false negative metrics
        if (duration2Decimal > this.config.maxMeasureTime) {
            return;
        }
        // Save metrics in Duration property
        if (metricName === 'firstPaint') {
            this.firstPaintDuration = duration2Decimal;
        }
        if (metricName === 'firstContentfulPaint') {
            this.firstContentfulPaintDuration = duration2Decimal;
            this.observers.get('fcp')(duration2Decimal);
        }
        if (metricName === 'firstInputDelay') {
            this.firstInputDelayDuration = duration2Decimal;
            this.observers.get('fid')(duration2Decimal);
        }
        // Logs the metric in the internal console.log
        this.log(logText, duration2Decimal);
        // Sends the metric to an external tracking service
        this.sendTiming(metricName, duration2Decimal);
    };
    /**
     * Ensures console.warn exist and logging is enable for
     * warning messages
     */
    Perfume.prototype.logWarn = function (prefix, message) {
        if (!this.config.warning || !this.config.logging) {
            return;
        }
        window.console.warn(prefix, message);
    };
    return Perfume;
}());
export default Perfume;
//# sourceMappingURL=perfume.js.map