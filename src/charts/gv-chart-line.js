/*
 * Copyright (C) 2015 The Gravitee team (http://gravitee.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { LitElement } from 'lit-element';
import '../atoms/gv-button';
import '../atoms/gv-tag';
import Highcharts from 'highcharts';
import { ChartElement } from '../mixins/chart-element';
import { dispatchCustomEvent } from '../lib/events';

/**
 * Line chart component
 *
 * @fires gv-chart-line:zoom - Custom event with zoomed timeframe
 *
 * @attr {Array} series - The series to display on the line chart.
 * @attr {Array} options - The list of options to display.
 *
 */
export class GvChartLine extends ChartElement(LitElement) {

  getOptions () {
    if (this._series && this._series.values && this._series.values[0] && this._series.values[0].buckets) {
      this._series.values[0].buckets.forEach((bucket, i) => {
        const metadata = this._series && this._series.values && this._series.values[i] && this._series.values[i].metadata;
        this._series.values[i] = { ...this.options.data[0], ...this.options.data[i], ...bucket };
        const isFieldRequest = metadata && (bucket.name === '1'
          || bucket.name.match('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'));
        if (isFieldRequest) {
          this._series.values[i].name = metadata[bucket.name].name;
          this._series.values[i].labelPrefix = metadata[bucket.name].name;
        }
        else {
          this._series.values[i].name = this._series.values[i].labelPrefix;
        }
      });
    }
    return {
      chart: {
        type: 'areaspline',
        zoomType: 'x',
        events: {
          selection: (event) => {
            event.preventDefault();
            dispatchCustomEvent(this, 'zoom', {
              from: Math.floor(event.xAxis[0].min),
              to: Math.round(event.xAxis[0].max),
            });
          },
        },
      },
      tooltip: {
        formatter: function () {
          const nbCol = Math.trunc(this.points.filter((p) => p.y).length / 10);
          let s = '<div><b>' + Highcharts.dateFormat('%A, %b %d, %H:%M', this.x) + '</b></div>';
          s += '<div class="' + ((nbCol >= 2) ? 'tooltip tooltip-' + (nbCol > 5 ? 5 : nbCol) : '') + '">';
          if (this.points.filter((point) => {
            return point.y !== 0;
          }).length) {
            let i = 0;
            this.points.forEach((point) => {
              if (point.y) {
                const name = ' ' + (point.series.options.labelPrefix ? point.series.options.labelPrefix + ' ' + point.series.name : point.series.name);
                if (nbCol < 2 && i++ > 0) {
                  s += '<br />';
                }
                s += '<span style="margin: 1px 5px;"><span style="color:' + point.color + '">\u25CF</span>' + name + ': <b>' + (point.series.options.decimalFormat ? Highcharts.numberFormat(point.y, 2) : point.y)
                  + (point.series.options.labelSuffix ? point.series.options.labelSuffix : '') + '</b></span>';
              }
            });
          }
          s += '</div>';
          return s;
        },
        shared: true,
        useHTML: true,
      },
      plotOptions: {
        line: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
          },
        },
        series: {
          ...this.options,
          ...{
            marker: {
              enabled: false,
            },
            fillOpacity: 0.1,
          },
        },
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: {
          month: '%e. %b',
          year: '%b',
        },
        crosshair: true,
      },
      yAxis: { title: { text: '' } },
    };
  }

  firstUpdated () {
    this.shadowRoot.addEventListener('mousemove', (e) => {
      let chart, i, event, points;
      for (i = 0; i < Highcharts.charts.length; i++) {
        chart = Highcharts.charts[i];
        if (chart && chart.pointer) {
          if (e.originalEvent) {
            event = chart.pointer.normalize(e.originalEvent);
          }
          else {
            event = chart.pointer.normalize(e);
          }
          points = chart.series.map((serie) => {
            return serie.searchPoint(event, true);
          });
          points = points.filter((point) => {
            return point;
          });

          e.points = points;
          if (points.length && points[0] && points[0].series.area) {
            points[0].highlight(e);
          }
        }
      }
    });
    (Highcharts).Pointer.prototype.reset = function () {
      let chart;
      for (let i = 0; i < Highcharts.charts.length; i++) {
        chart = Highcharts.charts[i];
        if (chart) {
          if (chart.tooltip) {
            chart.tooltip.hide(this);
          }
          if (chart.xAxis[0]) {
            chart.xAxis[0].hideCrosshair();
          }
        }
      }
    };
    (Highcharts).Point.prototype.highlight = function (event) {
      if (event.points.length) {
        this.onMouseOver();
        this.series.chart.tooltip.refresh(event.points);
        this.series.chart.xAxis[0].drawCrosshair(event, this);
      }
    };
  }
}

window.customElements.define('gv-chart-line', GvChartLine);