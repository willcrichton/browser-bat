define(function(require) {
    'use strict';

    var 
    WeekGraph  = require('WeekGraph'),
    UsageGraph = require('UsageGraph'),
    Downloads  = require('Downloads');

    return Backbone.View.extend({
        el: '#main',
        
        render: function() {
            this.$('#content').css('height', window.innerHeight - this.$('#dock').height());

            this.$('#time').prepend(new WeekGraph().render().el);
            this.$('#total').prepend(new UsageGraph().render().el);

            new Downloads();

            return this;
        }
    });
});
