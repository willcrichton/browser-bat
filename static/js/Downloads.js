define(function(require) {
    'use strict';

    return Backbone.View.extend({
        el: '#downloads',
        
        initialize: function() {
            this.downloads = DATA.downloads;
        },

        events: {
            'keyup input[type=text]': 'search'
        },

        search: function() {
            var search = this.$('input[type=text]').val().toLowerCase();
            this.$('#dl-list').html('');
            if (search == '') {
                return;
            }
            
            var results = [];
            this.downloads.forEach(function(download) {
                if (download.name.toLowerCase().indexOf(search) > -1) {
                    results.push(download);
                }
            });
            
            _.forEach(results, function(result) {
                this.$('#dl-list').append('<button class="btn btn-default" data-toggle="popover" data-html="true" data-content="Copy this link into your URL bar:<br /><code>file://' + result.path + '</code>" data-placement="left">' + result.name + '</button>');
            }, this);

            this.$('#dl-list button').popover();
        }
    });
});
