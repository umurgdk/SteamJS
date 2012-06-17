if (!window.Steam) {
	window.Steam = {};
};

Steam.PageManager = (function (window, _) {
    var default_options = {
        before_open_page:  function (data) {},
        after_open_page:   function (data) {},
        before_close_page: function (data) {},
        after_close_page:  function (data) {}
    };

	var PageManager = function (options) {
		var self = this;

        if(options === undefined || options === null) options = {};
        self.options = _(default_options).extend(options);

        this.activePage = null;
        this.activePageLink = '';

		this.pages = {};
		this.addPage = function (link, page) {
			self.pages[link] = page;
		};

		this.openLink = function (link, data, error) {
            console.log(self.pages);
            if(!self.pages[link]) {
                throw "Wrong page name";
            }

            if(error) {
                return;
            }

            if(link == self.activePageLink) {
                return;
            }

            var page = self.pages[link];
            if(self.activePage !== null && self.activePage !== undefined) {
                self.options.before_close_page.call(self.options.bind_events_to, self.activePage);
                self.activePage.close.call(self.activePage, function (cb_data) {
                    self.options.after_close_page.call(self.options.bind_events_to, self.activePage);
                    self.options.before_open_page.call(self.options.bind_events_to, page);

                    page.setData(data);
                    page.initialize.call(page, function () {
                        page.open.call(page, function(cb_data) {
                            self.options.after_open_page.call(self.options.bind_events_to, page);

                            self.activePage = page;
                            self.activePageLink = link;
                        });
                    });
                });
            } else {
                self.options.before_open_page.call(self.options.bind_events_to, page);
                page.setData(data);
                page.initialize.call(page, function() {
                    page.open.call(page, function(cb_data) {
                        self.options.after_open_page.call(self.options.bind_events_to, page);

                        self.activePage = page;
                        self.activePageLink = link;
                    });
                });
            }
        };
	}

    return PageManager;
})(window, _);