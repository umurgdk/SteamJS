var news_page = new Steam.Page({
    name: 'News Page',
    initialize: function(cb) {
        var pager = new Steam.Pager({
            url: siteUrl+'news-pager',
            per_page: 3,
            data: {}
        });

        this.active_category = null;

        this.pager = pager;
        this.pager.initialize(cb);
    },

    open: function (cb) {
        var self = this;

        $.get(window.siteUrl+'_templates/4m/templates/news.page.tpl.html', function(template) {
            var total_page = self.pager.total_page;
            var pages = [];

            if(total_page > 1) {
                for(var i=0; i < total_page; i++) {
                    var cls = 'pager-first';
                    if(i > 0) {
                        cls = 'pager-middle';
                    }

                    if (i == (total_page - 1)) {
                        cls = 'pager-last';
                    }

                    var page = {
                        page: i,
                        cls: cls,
                        text: (i + 1)+''
                    };

                    pages.push(page);
                }
            }

            var categories = _(self.data.categories).map(function (cat) {
                cat.active = (cat.id == self.active_category);

                return cat;
            });

            var template_data = {
                news: self.pager.data,
                categories: categories,
                site: window.siteUrl,
                pager: (pages.length > 0 ? pages : null)
            };

            $('#content').html(Mustache.render(template, template_data));
            $('#content').fadeIn(function () {
                async.series(_($('#content .new')).map(function (el) {
                    return function (cb) {
                        $(el).animate({opacity: 0}, 1, function () {
                            $(el).animate({
                                'margin-left': 0,
                                opacity: 1
                            }, 300);
                            _.delay(cb, 150);
                        });
                    };
                }), function () {
                    if(total_page > 0) {
                        var width = total_page * 22;

                        $('#content .tabs').animate({opacity: 0}, 1, function () {
                            $('#content .tabs').animate({
                                opacity: 1,
                                top: 473
                            }, function () {
                                $('#content .tabs-pager').css('display', 'block');
                                $('#content .tabs-pager').width(width).animate({opacity: 0, top: 45},1, function () {
                                    $('#content .tabs-pager').animate({
                                        top: 14,
                                        opacity: 1
                                    }, cb);
                                });
                            });

                            $('#content .tabs li').off('click').on('click', function (e) {
                                $('#content .tabs li').removeClass('active');
                                $(this).addClass('active');
                                self.openCategory($(this).attr('rel'));
                            });
                        });



                        $('#content .tabs-pager a.page').click(function (e) {
                            e.preventDefault();
                            self.pager.openPage($(this).attr('rel'), function() {
                                self.close.call(self, function () {
                                    self.open.call(self);
                                });
                            });
                        });

                        $('#content a.link').click(function (e) {
                            e.preventDefault();
                            self.openNew($(this).attr('rel'), $(this).parent());
                        });
                    } else {
                        if (cb) cb();
                    }
                });
            });
        },'html');
    },

    openCategory: function (id) {
        var self = this;

        self.active_category = id;

        self.pager.setPostData({
            category_id: id
        });

        self.pager.initialize(function () {
            if(self.pager.data.length > 0) {
                self.close.call(self, function () {
                    self.open.call(self);
                });
            }
        });
    },

    closeNew: function (id, div) {
        var self = this;
        self.stage = 'list';
        self.close.call(self, function () {
            self.open.call(self);
        });
    },

    openNew: function (id, div) {
        var self = this;
        console.log(id);
        $.post(siteUrl+'news-read', {
            id: id
        }, function (data) {
            console.log(data);
            if(data.success) {
                $.get(siteUrl+'_templates/4m/templates/news-read.page.tpl.html', function(template) {
                    var tops = _($('.new')).map(function (item) {
                        var top = $(item).position().top;
                        return {
                            el: $(item),
                            top: top
                        };
                    });

                    _(tops).each(function (item) {
                         item.el.css('position','absolute').css('top', item.top);
                    });

                    async.parallel(_($('.new:not(#new-'+id+'), .pager')).map(function (item) {
                        return function (cb) {
                            $(item).fadeOut(cb);
                        };
                    }), function () {
                        $(div).animate({top: 0}, 300);
                        $('#content .page-template').append(Mustache.render(template, {
                            icerik: data.data.icerik,
                            site: siteUrl
                        }));
                        $('#content .new-full').animate({opcacity: 0}, 1, function () {
                            $('.tabs li').fadeOut();
                            $('#content .new-full').animate({
                                top: 220,
                                opacity: 1
                            }, 300, function () {
                                $('.tabs a.back').fadeIn();
                                $('.tabs a.back').off('click').on('click', function (e) {
                                    self.closeNew(id, div);
                                });

                                $('#new-scrollbar').xcrollbar({
                                    padding: {
                                        left: 12,
                                        right: 35
                                    }
                                });
                            });

                            $('.tabs-pager').fadeOut();

                            self.stage = 'read';

                            $('a',div).off('click').attr('href', siteUrl+'libs/haberler/'+data.data.resim).on('click', function (e) {
                                e.preventDefault();

                                div.css('overflow', 'hidden');
                                var img = $(this).prev().prev();
                                img.fadeOut(function () {
                                    var kucuk_img = img.attr('src');
                                    var slideshow = $('<div>').addClass('slideshow');
                                    var _img = $('<img>').attr('src', $('a', div).attr('href')).attr('rel', 0);
                                    slideshow.append(_img);

                                    var __page = 0;
                                    _(data.data.resimler).each(function (image, index) {
                                        $('<img>').attr('src', image.buyuk).attr('rel', __page).appendTo(slideshow);
                                        if((index + 1) % 4 == 0) {
                                            __page++;
                                        }
                                    });

                                    //img.attr('src', $('a', div).attr('href'));

                                    var eski_tabs = $('#content .tabs');

                                    div.append(slideshow.css('opacity', 0));
                                    slideshow.animate({opacity: 0}, 1, function () {

                                    slideshow.animate({opacity: 1}, function () {
                                        div.css('z-index', 10000);
                                        eski_tabs.fadeOut();
                                        $('#new-scrollbar').fadeOut();
                                        div.animate({
                                            height: 456
                                        }, function () {
                                            $('a',div).hide();
                                            var tabs  = $('<div>').addClass('tabs');
                                            var title = $('<h2>').addClass('title').text(data.data.baslik);
                                            var sliderContainer = $('<div>').addClass('slider-container');
                                            var sliderSlides    = $('<div>').addClass('slider-slides');
                                            var closeButtton    = $('<a>').addClass('close-button').attr('href', '#');

                                            div.append(closeButtton);

                                            var slideLeft = $('<a>').addClass('slide-left');
                                            var slideRight = $('<a>').addClass('slide-right');


                                            var tmpSlides = [$('<a>').attr('rel', 0).attr('href', '#').append($('<img>').attr('src', $('a', div).attr('href').replace('haberler/','haberler/icon_')))];
                                            var slidesList = [];

                                            console.log(data.data.resimler);

                                            var slideCount = data.data.resimler.length;
                                            _(data.data.resimler).each(function (resim, i) {
                                                var slide = $('<a>').attr('rel', i+1).attr('href', '#');
                                                var img   = $('<img>').attr('src', resim.kucuk);
                                                slide.append(img);
                                                tmpSlides.push(slide);

                                                if ((i+1) % 4 == 0 || (i+1) == slideCount) {
                                                    slidesList.push(tmpSlides);
                                                    tmpSlides = [];
                                                }
                                            });

                                            _(slidesList).each(function (item) {
                                                var slide = $('<div>').addClass('slide');
                                                _(item).each(function (img) {
                                                    slide.append(img);
                                                });

                                                sliderSlides.append(slide);
                                            });

                                            sliderContainer.append(slideLeft).append(sliderSlides).append(slideRight);

                                            tabs.append(sliderContainer);
                                            tabs.append(title);
                                            tabs.css('top','456px').appendTo(div).animate({
                                                top: 396
                                            }, function () {
                                                sliderContainer.animate({
                                                    bottom: 16
                                                });
                                            });

                                            var littleslider = sliderSlides.bxSlider({
                                                controls: false,
                                                wrapperClass: 'slider-wrapper',
                                                displaySlideQty: 4,
                                                infiniteLoop: false
                                            });

                                            var bigslider = slideshow.bxSlider({
                                                auto: true,
                                                controls: false,
                                                mode: 'fade',
                                                infiniteLoop: false,
                                                onBeforeSlide: function(currentSlideNumber, totalSlideQty, currentSlideHtmlObject){
                                                    var page = $(currentSlideHtmlObject).attr('rel');
                                                    littleslider.goToSlide(page);
                                                }
                                            });

                                            $('.tabs .slider-container .slider-slides .slide a').click(function (e) {
                                                e.preventDefault();
                                                bigslider.goToSlide($(this).attr('rel'));
                                            });

                                            $('.slide-left').click(function (e) {
                                                e.preventDefault();
                                                littleslider.goToPreviousSlide();
                                            });

                                            $('.slide-right').click(function (e) {
                                                e.preventDefault();
                                                littleslider.goToNextSlide();
                                            });

                                            closeButtton.on('click', function (e) {
                                                bigslider.stopShow();
                                                littleslider.stopShow();
                                                e.preventDefault();

                                                async.parallel(_([tabs, closeButtton]).map(function (item) {
                                                    return function (cb) {
                                                        item.fadeOut(cb);
                                                    };
                                                }), function () {
                                                    div.animate({
                                                        height: 132
                                                    }, function () {
                                                        slideshow.fadeOut(function () {
                                                            img.attr('src', kucuk_img);
                                                            img.fadeIn();
                                                            eski_tabs.fadeIn();
                                                            $('#new-scrollbar').fadeIn();
                                                            $('#content .new-full').animate({ opacity: 1 });
                                                            $('.info',div).animate({ opacity: 1 });
                                                            $('a:not(.close-button)', div).show();
                                                            $('div:not(.info)', div).remove();
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                        $('#content .new-full').animate({ opacity: 0 });
                                        $('.info', div).animate({ opacity: 0 });
                                    });
                                    });
                                })
                            });
                        });
                    });
                }, 'html');
            }
        },'json');
    },

    close: function (cb) {
        var self = this;

        if(self.stage == 'read') {
            $('#content').fadeOut(function () {
                $('#content *').remove();
                cb();
            });
            return;
        }
        async.series(_($('#content .new')).map(function (el) {
            return function (cb) {
                $(el).animate({
                    'margin-left': -726,
                    opacity: 0
                }, 300);
                _.delay(cb, 150);
            };
        }), function () {
            $('#content').fadeOut(function () {
                $('#content *').remove();
                cb();
            });
        });
    }
});