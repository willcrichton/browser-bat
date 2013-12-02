define(function(require) {
    'use strict';

    // convert seconds to miliseconds and get unix epoch time
    function toDate(time) {
        return new Date(time * 1000).getTime();
    }
    
    // starting data
    var data = [];
    DATA.histogram.forEach(function(row) {
        data.push([toDate(row[1]), row[0]]);
    });

    // get day of year from date 0-364
    Date.prototype.dayofYear = function(){
        var d= new Date(this.getFullYear(), 0, 0);
        return Math.floor((this-d)/8.64e+7);
    }

    // highslide configuration
    hs.graphicsDir = '/static/graphics/';
    hs.outlineType = 'rounded-white';
    hs.wrapperClassName = 'draggable-header';
    hs.captionEval = 'this.a.title';
    hs.showCredits = false;
    hs.marginTop = 20;
    hs.marginRight = 20;
    hs.marginBottom = 20;
    hs.marginLeft = 20;

    // popup boxes w/ most visited sites
    function showSites(query, heading) {
        $.ajax({
            url: '/query',
            data: {q: query},
            success: _.bind(function(result) {
                var data = JSON.parse(result);
                var sites = {};
                data.forEach(function(url) {
                    var host = parseUri(url).host;
                    if (!sites[host]) { 
                        sites[host] = 0;
                    }
                    sites[host]++;
                });
                
                sites = $.map(sites, function(count, site) {
                    return [[count, site]];
                }).sort(function(a, b) { return b[0] - a[0]; });

                var content = $.map(sites.slice(0, 3), function(arr) {
                    return arr[1] + ': ' + arr[0]
                }).join('<br />');
                
                hs.htmlExpand(null, {
                    pageOrigin: {x: this.pageX, y: this.pageY},
                    headingText: heading,
                    maincontentText: content,
                    width: 200
                });
            }, this)
        });
    }
    
    return Backbone.View.extend({
        className: 'graph',

        update: function() {
            /*if (!$(':checkbox:checked').length) {
              this.render();
              return;
              }*/

            var days = $(':checkbox:checked').length 
                ? $(':checkbox:checked').map(function(){ 
                    return 'strftime("%w", d) = "' + this.value + '"'; 
                }).get().join(' or ')
            : '1';

            var times = $('[type=time]').map(function(isEnd){ 
                if (this.value == '') return '1';
                var matches = this.value.match(/(\d+):(\d+)/);
                var op = isEnd ? '<=' : '>=';
                return 'cast(strftime("%H", d) as int) ' + op + matches[1];
            }).get().join(' and ');
            
            var where = '(' + days + ') and (' + times + ')';
            var query = 'select count(*), visit_time, datetime(visit_time, "unixepoch") as d from visits where ' + where + ' group by strftime("%Y%j", d)';

            $.ajax({
                url: '/query',
                data: {'q': query},
                success: _.bind(function(result) {
                    var rows = JSON.parse(result);
                    var keys = [], values = [];
                    rows.forEach(function(row) {
                        keys.push(new Date(row[1] * 1000).toDateString());
                        values.push(row[0]);
                    });

                    this.$el.highcharts({
                        chart: {
                            type: 'column'
                        },
                        xAxis: {
                            categories: keys
                        },
                        title: {
                            text: 'Internet usage over time'
                        },
                        plotOptions: { 
                            column: {
                                point: {events: {click: function() {
                                    var date = new Date(this.category);
                                    var query = 'select url, datetime(visit_time, "unixepoch") as d from visits where strftime("%Y%j", d) = "' + date.getFullYear().toString() + date.dayofYear().toString() + '"';
                                    showSites.call(this, query, date.toDateString());
                                }}}
                            }
                        },
                        series: [{name: 'Will', data: values}]
                    });
                }, this)
            });
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
                    spline: { marker: { enabled: false } },
                    series: {
                        cursor: 'pointer',
                        point: {events: {click: function() {
                            var date = new Date(this.x);
                            var query = 'select url, datetime(visit_time, "unixepoch") as d from visits where strftime("%Y%j", d) = "' + date.getFullYear().toString() + date.dayofYear().toString() + '"';
                            showSites.call(this, query, date.toDateString());
                        }}}
                    }
                    
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
