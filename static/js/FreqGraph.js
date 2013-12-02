define(function(require) {
    'use strict';
    
     return Backbone.View.extend({
         className: 'graph',
         render: function() {
             var query = "select count(*), datetime(visit_time, 'unixepoch') AS d, cast(strftime('%H',  datetime(visit_time, 'unixepoch')) as int) from visits group by strftime('%w', d), strftime('%H', d)/6";
             $.ajax({
                 url: '/query',
                 data: {q: query}
             }).done(_.bind(function(result) {
                 var data = JSON.parse(result);
                 var series = [[], [], [], []]
                 data.forEach(function(row) {
                     series[Math.floor(row[2] / 6)].push(row[0]);
                 });

                 var names = ['Midnight - 6:00 AM', '6:00 AM - 12:00 PM',
                              '12:00 PM - 6:00 PM', '6:00 PM - Midnight'];
                 series = series.map(function(dataset, i) {
                     return {name: names[i], data: dataset};
                 }).reverse();

                 this.$el.highcharts({
                     chart: { type: 'column' },
                     title: { text: 'Usage frequency' },
                     xAxis: { categories: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
                     yAxis: {
                         min: 0,
                         title: {text: 'Number of sites visited'},
                         stackLabels: {
                             enabled: true,
                             style: {
                                 fontWeight: 'bold',
                                 color: 'white'
                             }
                         }
                     },
                     plotOptions: {
                         column: {
                             stacking: 'normal',
                             dataLabels: { 
                                 enabled: true,
                                 color: 'white'
                             }
                         }
                     },
                     series: series
                 });
             }, this));
             return this;
         }
     });
});
