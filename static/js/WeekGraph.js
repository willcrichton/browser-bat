define(function(require) {
    'use strict';

    return Backbone.View.extend({
        className: 'graph',
        render: function() {
            function genData() {
                var data = [];
                var start = 0;
                var datum = Math.round(Math.random() * 10);
                for (var i = 0; i < 100; i++) {
                    start += Math.floor(Math.random() * 10000000);
                    datum += Math.random() * 1- 0.5;
                    if (datum < 0) datum = 0;
                    if (datum > 10) datum = 10;
                    data.push([start, datum]);
                }
                return data;
            }

            this.$el.highcharts({
                chart: {
                    type: 'column',
                    zoomType: 'x'
                },
                title: {
                    text: 'Internet usage over time',
                    x: -20 //center
                },
                xAxis: {
                    type: 'datetime'
                },
                yAxis: {
                    title: {
                        text: 'Average usage'
                    },
                    plotLines: [{
                        value: 0,
                        width: 1,
                        color: '#808080'
                    }],
                    min: 0
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle',
                    borderWidth: 0
                },
                plotOptions: {
                    spline: { marker: { enabled: false } }
                },
                series: [{
                    name: 'Will',
                    data: genData()
                }, {
                    name: 'Jie',
                    data: genData()
                }, {
                    name: 'David',
                    data: genData()
                }]
            });
            
            return this;
        }
    });
});
