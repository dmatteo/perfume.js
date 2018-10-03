import {
  AfterViewInit,
  Injectable,
  InjectionToken,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import Perfume, { IPerfumeConfig } from 'perfume.js';

let perfume;

@NgModule()
export class PerfumeRootModule {
  constructor() {}
}

@Injectable()
export class NgPerfume {
  perfume: Perfume;
  config: IPerfumeConfig = {
    firstContentfulPaint: false,
    firstPaint: false,
    firstInputDelay: false,
    timeToInteractive: false,
    googleAnalytics: {
      enable: false,
      timingVar: 'name',
    },
    logPrefix: '⚡️ Perfume.js:',
    logging: true,
    warning: false,
  };
  firstPaintDuration: number = 0;
  firstContentfulPaintDuration: number = 0;
  firstInputDelayDuration: number = 0;
  observeFirstContentfulPaint: Promise<number>;
  observeFirstInputDelay: Promise<number>;
  observeTimeToInteractive?: Promise<number>;
  timeToInteractiveDuration: number = 0;

  constructor() {
    this.config = perfume.config;
    this.firstPaintDuration = perfume.firstPaintDuration;
    this.firstContentfulPaintDuration = perfume.firstContentfulPaintDuration;
    this.firstInputDelayDuration = perfume.firstInputDelayDuration;
    this.observeFirstContentfulPaint = perfume.observeFirstContentfulPaint;
    this.observeFirstInputDelay = perfume.observeFirstInputDelay;
    this.observeTimeToInteractive = perfume.observeTimeToInteractive;
    this.timeToInteractiveDuration = perfume.timeToInteractiveDuration;
  }

  start(metricName: string): void {
    perfume.start(metricName);
  }

  end(metricName: string): void | number {
    return perfume.end(metricName);
  }

  endPaint(metricName: string): Promise<void | number> {
    return perfume.endPaint(metricName);
  }

  log(metricName: string, duration: number): void {
    perfume.log(metricName, duration);
  }

  sendTiming(metricName: string, duration: number): void {
    perfume.sendTiming(metricName, duration);
  }
}

@NgModule({})
export class PerfumeModule {
  static forRoot(options: any): ModuleWithProviders {
    perfume = new Perfume(options);
    return {
      ngModule: PerfumeRootModule,
      providers: [NgPerfume],
    };
  }
}

/**
 * Describes any Angular component class that implements `AfterViewInit`.
 */
// tslint:disable-next-line:interface-name
export interface AfterViewInitable {
  prototype: AfterViewInit;
  new (...args: any[]): AfterViewInit;
}

/**
 * Component View Init (CVI) decorator
 * Marks the time between the constructor is initialized,
 * and ngAfterViewInit execution ends.
 */
// tslint:disable-next-line:function-name
export function PerfumeAfterViewInit() {
  return function DecoratorFactory(target: AfterViewInitable) {
    // The new constructor behavior, supports AOT and DI
    const newConstructor: any = function newCtor(...args) {
      perfume.start(target.name);
      const c: any = function childConstuctor() {
        return target.apply(this, arguments);
      };
      c.prototype = Object.create(target.prototype);
      return new c(...args);
    };

    // The new ngAfterViewInit behavior
    const ngAfterViewInit = target.prototype.ngAfterViewInit;
    target.prototype.ngAfterViewInit = function(...args) {
      ngAfterViewInit && ngAfterViewInit.apply(this, args);
      perfume.end(target.name);
    };

    // Copy prototype so instanceof operator still works
    newConstructor.prototype = Object.create(target.prototype);

    // Return new constructor (will override original)
    return newConstructor;
  };
}