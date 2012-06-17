if (!window.Steam) {
	window.Steam = {};
};

Steam.Menu = (function (window, $, _) {
	var default_options = {
		item_selector:    'li a',
		bind_to_receiver: true,
		receiver:         null,

		ajax:             true,
		ajax_method:      'post',

		post_data:        true,
		response_type:    'json',
		url:              '/'
	};

	var required_options = ['receiver', 'url'];

	var Menu = function ($menu_wrapper, options) {
		var required_fields_validation = _.all(required_options, function (option) {
			return _.chain(options).keys().include(option).value();
		});

		if (!required_fields_validation) {
			throw "You must enter an url and a receiver object";
		}

		var items = {};
		var initial_active_item = (options['active_menu_item'] ? options['active_menu_item'] : false);

		var self = this;

		this.options = $.extend(default_options, options);

		$(this.options.item_selector, $menu_wrapper).each(function (i, el) {
			var link = $(el).attr('rel');

			items[link] = {
				$el:    $(el),
				active: (initial_active_item && (initial_active_item == link)),
				link:   link
			};
		});

		this.items = items;
		this.active_item = initial_active_item;		

		(function bindEvents () {
			var prepare_post_data = function (item) {
				var data = {};
				var attributes = item.$el[0].attributes;
				$(attributes).each(function (i, attr) {
					if (attr.nodeName.indexOf('data-') == 0) {
						var key = attr.nodeName.substring(5);
						var val = attr.nodeValue;

						data[key] = val;
					};
				});

				return data;
			};

			var ajax = (self.options.ajax_method == 'post' ? $.post : $.get);

			_(items).each(function (item) {
				var post_data = {};
				if (self.options.post_data) {
					post_data = prepare_post_data(item);
				};

				item.$el.off('click');
				item.$el.on('click', function (e) {
					e.preventDefault();
					if (self.options.ajax) {
						ajax(self.options.url+item.link, post_data, function (data) {
							var error = true;
							if (data.success) {
								error = false;
							}

							self.options.receiver.openLink.call(self.options.receiver, item.link, data, error);
						}, self.options.response_type);
					};
				});
			});
		})();
	};

	return Menu;
})(window, $, _);