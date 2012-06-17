if (!window.Steam) {
    window.Steam = {};
};

Steam.Page = (function (window, $, _) {
    var required_options = ['open', 'close', 'name'];
    var Page = function (options) {
        var required_fields_validation = _.all(required_options, function (option) {
            return _.chain(options).keys().include(option).value();
        });

        if (!required_fields_validation) {
            throw "You must enter an open function, close function and a name";
        }

        var self = this;

        self.options = options;
        self.options.intialize = (self.options.initialize || function (cb) {cb();});
        self.data    = {};

        this.name = self.options.name;

        this.initialize = function (cb) {
            self.options.initialize.call(self.options, cb);
        };

        this.open = function(data, cb) {
            self.options.open.call(self.options, data, cb);
        };

        this.close = function(cb) {
            self.options.close.call(self.options, cb);
        };

        this.setData = function (data) {
            _(self.data).extend(data);
            self.options.data = self.data;
        };
    };

    return Page;
})(window, $, _);