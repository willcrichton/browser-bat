define(function(render) {

    var sites = (DATA['sites'] || []).slice(0, 7)
    var sum = _.reduce(_.pluck(sites, 1), function(a, b) { return a + b; }, 0);

    return Backbone.View.extend({
        className: 'graph',

        drilldown: function(name) {
            if (name == DATA.user) {
                this.render();
                return;
            }

            var query = 'SELECT count(*) as c, visit_time, datetime(visit_time, "unixepoch") AS d FROM visits WHERE url like "%' + name + '%" GROUP BY strftime("%Y%j", d) ORDER BY d';
            $.ajax({
                url: '/query',
                data: {q: query}
            }).done(_.bind(function(result) {
                var data = JSON.parse(result);
                var series = data.map(function(row) {
                    return [new Date(row[1] * 1000).getTime(), row[0]]
                });

                this.$el.highcharts({
                    chart: {
                        type: 'spline',
                        zoomType: 'x'
                    },
                    title: {
                        text: 'Internet usage over time for ' + name,
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
                        name: DATA.user,
                        data: series
                    }]
                });

                $('#total-back').show();
            }, this));
        },

        render: function() {
            var colors = Highcharts.getOptions().colors,
            categories = [DATA.user]
            name = 'Internet usage',
            data = [{
                y: 100,
                color: colors[0],
                drilldown: {
                    name: DATA.user,
                    categories: _.pluck(sites, 0),
                    data: _.map(_.pluck(sites, 1), function(n) { return Math.round(54.07 * n / sum * 100) / 100; }),
                    color: colors[0]
                }
            }];            
            
            // Build the data arrays
            var browserData = [];
            var versionsData = [];
            for (var i = 0; i < data.length; i++) {
                
                // add browser data
                browserData.push({
                    name: categories[i],
                    y: data[i].y,
                    color: data[i].color
                });
                
                // add version data
                for (var j = 0; j < data[i].drilldown.data.length; j++) {
                    var brightness = 0.2 - (j / data[i].drilldown.data.length) / 5 ;
                    versionsData.push({
                        name: data[i].drilldown.categories[j],
                        y: data[i].drilldown.data[j],
                        color: Highcharts.Color(data[i].color).brighten(brightness).get()
                    });
                }
            }
            
            // Create the chart
            var self = this;
            this.$el.highcharts({
                credits: { enabled: false },
                chart: {
                    type: 'pie'
                },
                title: {
                    text: 'Internet usage by user'
                },
                yAxis: {
                    title: {
                        text: 'Percent time on site'
                    }
                },
                plotOptions: {
                    pie: {
                        shadow: false,
                        center: ['50%', '50%'],
                        point: { events: { click: function() {
                            self.drilldown(this.name);
                        }}}
                    }
                },
                tooltip: {
                    valueSuffix: '%'
                },
                series: [{
                    name: 'Usage',
                    data: browserData,
                    size: '60%',
                    dataLabels: {
                        formatter: function() {
                            return this.y > 5 ? this.point.name : null;
                        },
                        color: 'white',
                        distance: -30
                    }
                }, {
                    name: 'Site usage',
                    data: versionsData,
                    size: '80%',
                    innerSize: '60%',
                    dataLabels: {
                        formatter: function() {
                            // display only if larger than 1
                            return this.y > 1 ? '<b>'+ this.point.name +':</b> '+ this.y +'%'  : null;
                        }
                    }
                }]
            });

            
            $('#total-back').hide();
            $('#total-back').click(_.bind(function() {
                this.render();
            }, this));

            return this;
        }
    });
});
