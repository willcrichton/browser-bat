define(function(require) {
    'use strict';

    var 
    WeekGraph  = require('WeekGraph'),
    UsageGraph = require('UsageGraph'),
    FreqGraph  = require('FreqGraph'),
    Downloads  = require('Downloads');

    return Backbone.View.extend({
        el: '#main',

        events: {
            'keypress #db-query': 'query'
        },

        query: function(e) {
            if (e.which != 13) return;
            $.ajax({
                url: '/query',
                data: {'q': this.$('#db-query').val()},
                success: _.bind(function(result) {
                    this.$('#query-output').html(result);
                }, this),
                error: _.bind(function(err) {
                    this.$('#query-output').html('Error! Check your syntax?');
                }, this)
            });
        },
        
        render: function() {
            this.$('#content').css('height', window.innerHeight - this.$('#dock').height());

            this.$('#time').prepend(new WeekGraph().render().el);
            this.$('#total').prepend(new UsageGraph().render().el);
            this.$('#freq').prepend(new FreqGraph().render().el);

            new Downloads();

            return this;
        }
    });
});
