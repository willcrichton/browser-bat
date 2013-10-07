define(function(require) {
    'use strict';

    var WeekGraph = require('WeekGraph'),
    UsageGraph = require('UsageGraph');

    return Backbone.View.extend({
        el: '#main',
        
        render: function() {
            var $content = this.$('#content');
            $content.css('height', window.innerHeight - this.$('#dock').height());

            $content.append(new WeekGraph().render().el);
            $content.append(new UsageGraph().render().el);
        }
    });
});
