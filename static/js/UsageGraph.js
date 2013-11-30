define(function(render) {

    //54.07
    var sites = (DATA['sites'] || []).slice(0, 7)
    var sum = _.reduce(_.pluck(sites, 1), function(a, b) { return a + b; }, 0);

    return Backbone.View.extend({
        className: 'graph',
        render: function() {
            var colors = Highcharts.getOptions().colors,
            categories = ['Will', 'Jie', 'David'],
            name = 'Internet usage',
            data = [{
                y: 100,
                color: colors[0],
                drilldown: {
                    name: 'Will',
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
                        center: ['50%', '50%']
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

            return this;
        }
    });
});
