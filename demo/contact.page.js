var contact_page = new Steam.Page({
    name: 'Contact Page',
    initialize: function(cb) {
        this.active_address = null;

        this.contact_infos = this.data.data.contact_infos;
        this.contact_infos[0].active = true;
        this.contact_infos[0].index = 0;
        this.contact_infos[1].index = 1;

        if(cb) {
            cb();
        }
    },

    open: function (cb) {
        var self = this;

        $.get(window.siteUrl+'_templates/4m/templates/contact.page.tpl.html', function(template) {
            var template_data = {
                site: window.siteUrl,
                contact_infos: self.contact_infos
            };

            $('#content').html(Mustache.render(template, template_data));
            $('.placeholder').each(function (i, el) {
                var $el = $(el);
                var placeholder = $el.attr('rel');

                $el.val(placeholder);

                $el.focusin(function (e) {
                    if($el.val() == placeholder) {
                        $el.val('');
                        $el.removeClass('placeholder');
                    } else if($el.val() == '') {
                        $el.val(placeholder);
                        $el.addClass('placeholder');
                    }
                }).focusout(function (e) {
                    if($el.val() == '') {
                        $el.val(placeholder);
                        $el.addClass('placeholder');
                    }
                });
            });
            $('.address-wrapper').css('margin-left', '726px');
            $('.form').animate({opacity: 0, 'margin-top': 260}, function () {
                $('.address').animate({opacity: 0, 'margin-left': -500}, 1, function() {
                    $('.address-wrapper').animate({ 'margin-left': 0}, function () {
                        $('#content').fadeIn(function () {
                            async.parallel(_($('.address')).map(function (item, i) {
                                return function (cb) {
                                    _.delay(function () {$(item).animate({
                                        opacity: 1,
                                        'margin-left': 0
                                    },600, cb)}, i*250);
                                };
                            }), function () {
                                $('#map-embed').html(self.contact_infos[0].embed);
                            });

                            $('.form').animate({
                                'margin-top': 0,
                                'opacity' : 1
                            });

                            $('.address').click(function (e) {
                                var $address = $(this);
                                e.preventDefault();
                                $('.address').removeClass('active');
                                $address.addClass('active');
                                $('#map-embed').fadeOut(function () {
                                    $('#map-embed').html(self.contact_infos[$address.attr('rel')].embed);

                                    $('#map-embed').fadeIn(function () {

                                    });
                                })
                            });

                            $('#contact-submit').click(function (e) {
                                e.preventDefault();
                                $.post(window.siteUrl+'contact', {
                                    name:    $('input#name').val(),
                                    email:   $('input#mail').val(),
                                    company: $('input#company').val(),
                                    message: $('textarea#message').val(),
                                    contact_submit: 'send'
                                }, function (response) {
                                    if(response.success) {
                                        $('input#name').val('');
                                        $('input#mail').val('');
                                        $('input#company').val('');
                                        $('textarea#message').val('');
                                    }
                                }, 'json')
                            });

                            if (cb) cb();
                        });

                    });
                });
            });

        },'html');
    },

    openCategory: function (id) {
        var self = this;

        self.active_category = id;

        self.pager.setPostData({
        });

        self.pager.initialize(function () {
            if(self.pager.data.length > 0) {
                self.close.call(self, function () {
                    self.open.call(self);
                });
            }
        });
    },

    close: function (cb) {
        var self = this;

        $('#content').fadeOut(function () {
            $('#content *').remove();
            cb();
        });
    }
});