define(function(require) {
    'use strict';

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


    return Backbone.View.extend({
        className: 'graph',

        update: function() {
            var days = $(':checkbox:checked').map(function(){ 
                return 'strftime("%w") = ' + this.value; 
            }).get().join(' or ');

            var times = $('[type=time]').map(function(isEnd){ 
                if (this.value == '') return '1';
                var matches = this.value.match(/(\d+):(\d+)/);
                var op = isEnd ? '<=' : '>=';
                return 'strftime("%H") ' + op + matches[1];
            }).get().join(' and ');
            
            var where = '(' + days + ') and (' + times + ')';
            var query = 'select * from ____ where ' + where;

            this.$el.highcharts().series.forEach(function(series) {
                    series.setData(genData());
            });
            // TODO: something with this query, change graph, etc.
            console.log(query);
        },
        
        render: function() {
            $('#weekOpts').click(_.bind(this.update, this));


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
