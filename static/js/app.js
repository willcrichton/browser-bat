define(function(require) {
    requirejs.config({
        enforceDefine: true,
        inlineText: true,
        urlArgs: "bust=" + (new Date()).getTime()
    });

    require(['MainView'], function(MainView) {
        new MainView().render();
    });
});
