if (!window.Steam) {
    window.Steam = {};
}

Steam.Pager = (function (window, $, _) {
    var default_options = {
        initial_page: 0,
        data: {}
    };
    var required_options = ['url', 'per_page'];

    var Pager = function (options) {
        var required_fields_validation = _.all(required_options, function (option) {
            return _.chain(options).keys().include(option).value();
        });

        if (!required_fields_validation) {
            throw "Missing required options: ['url','per_page']";
        }

        var self = this;

        self.options      = _(default_options).extend(options);
        self.total_page   = 0;
        self.current_page = 0;

        var _parseData = function (data) {
            if(data.total_page !== undefined) {
                self.total_page   = data.total_page;
            }

            if(data.current_page !== undefined) {
                self.current_page = data.current_page;
            }

            if(data.data !== undefined) {
                self.data = data.data;
            }
        };

        this.getData = function () {
            return self.data;
        };

        this.setPostData = function (data) {
            self.options.data = data;
        };

        this.initialize = function (cb) {
            var post_data = _(self.options.data).extend({
                page: self.options.intial_page,
                per_page: self.options.per_page
            });

            $.post(self.options.url, post_data, function (data) {
                if(!data.success) {
                    cb(true);
                    return false;
                }

                _parseData(data);

                if(cb) {
                    cb();
                }
            },'json');
        };

        this.hasNextPage = function () {
            return self.current_page < (self.total_page - 1);
        };

        this.hasPreviousPage = function () {
            return self.current_page > 0;
        };

        this.nextPage = function (cb) {
            if(!self.hasNextPage()) {
                return false;
            }

            var post_data = _(self.options.data).extend({
                page: self.current_page + 1,
                per_page: self.options.per_page
            });

            $.post(self.options.url, post_data, function(data){
                if(!data.success) {
                    return false;
                }

                _parseData(data);

                if(cb) {
                    self.current_page += 1;
                    cb(self.data);
                }
            },'json');
        };

        this.openPage = function (page_no, cb) {
            self.current_page = page_no;


            var post_data = _(self.options.data).extend({
                page: self.current_page,
                per_page: self.options.per_page
            });

            $.post(self.options.url, post_data, function(data){
                if(!data.success) {
                    return false;
                }

                _parseData(data);

                if(cb) {
                    cb(self.data);
                }
            },'json');
        };

        this.previousPage = function (cb) {
            if(!self.hasPreviousPage()) {
                return false;
            }

            var post_data = _(self.options.data).extend({
                page: self.current_page - 1,
                per_page: self.options.per_page
            });

            $.post(self.options.url, post_data, function(data){
                if(!data.success) {
                    return false;
                }

                _parseData(data);

                if(cb) {
                    self.current_page -= 1;
                    cb(self.data);
                }
            },'json');
        };
    };

    return Pager;
})(window, $, _);