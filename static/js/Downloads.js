define(function(require) {
    'use strict';

    return Backbone.View.extend({
        el: '#downloads',
        
        initialize: function() {
            this.downloads = DATA.downloads;
        },

        events: {
            'keydown input[type=text]': 'search'
        },

        search: function() {
            var search = this.$('input[type=text]').val().toLowerCase();
            var results = [];
            this.downloads.forEach(function(download) {
                if (download.name.toLowerCase().indexOf(search) > -1) {
                    results.push(download);
                }
            });
            
            this.$('#dl-list').html('');
            _.forEach(results, function(result) {
                this.$('#dl-list').append('<button class="btn btn-default" data-toggle="popover" data-html="true" data-content="Copy this link into your URL bar:<br /><code>file://' + result.path + '</code>" data-placement="left">' + result.name + '</button>');
            }, this);

            this.$('#dl-list button').popover();
        }
    });
});
