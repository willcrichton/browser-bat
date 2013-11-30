define(function(require) {
    'use strict';

    function toDate(time) {
        return new Date(time * 1000);
    }
    
    var data = [];
    DATA.histogram.forEach(function(row) {
        console.log(toDate(row[1]));
        data.push([toDate(row[1]), row[0]]);
    });

    return Backbone.View.extend({
        className: 'graph',

        update: function() {
            var days = $(':checkbox:checked').map(function(){ 
                return 'strftime("%w", d) = "' + this.value + '"'; 
            }).get().join(' or ');

            var times = $('[type=time]').map(function(isEnd){ 
                if (this.value == '') return '1';
                var matches = this.value.match(/(\d+):(\d+)/);
                var op = isEnd ? '<=' : '>=';
                return 'strftime("%H", d) ' + op + '"' + matches[1] + '"';
            }).get().join(' and ');
            
            var where = '(' + days + ') and (' + times + ')';
            var query = 'select count(*), visit_time, datetime(visit_time, "unixepoch") as d from visits where ' + where + ' group by strftime("%Y%j", d)';
            console.log(query);

            this.$el.highcharts().series.forEach(function(series) {
                $.ajax({
                    url: '/query',
                    data: {'q': query},
                    success: function(result) {
                        var rows = JSON.parse(result);
                        var newData = [];
                        rows.forEach(function(row) {
                            newData.push([toDate(row[1]), row[0]])
                        });
                        series.setData(newData);
                    }
                });
            });

            // TODO: something with this query, change graph, etc.
            console.log(query);
        },
        
        render: function() {
            $('#weekOpts').click(_.bind(this.update, this));

            this.$el.highcharts({
                chart: {
                    type: 'spline',
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
                    data: data
                }]
            });
            
            return this;
        }
    });
});
