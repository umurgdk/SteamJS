var projects_page = new Steam.Page({
    name: 'Projects',
    initialize: function (cb) {
        var pager = new Steam.Pager({
            url: siteUrl+'projects-pager',
            per_page: 3,
            data: {}
        });

        this.pager = pager;
        this.pager.initialize(cb);
    },

    open: function (cb) {
        var self = this;

        $.get(window.siteUrl+'_templates/4m/templates/projects.page.tpl.html', function(template) {
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
                projects: self.pager.data,
                categories: categories,
                site: window.siteUrl,
                pager: (pages.length > 0 ? pages : null)
            };

            $('#content').html(Mustache.render(template, template_data));
            $('#content').fadeIn(function () {
                async.series(_($('#content .project')).map(function (el) {
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
                    $('#content .project-categories a').mouseenter(function () {
                        $(this).parent().addClass('hover');
                    }).mouseleave(function () {
                        $(this).parent().removeClass('hover');
                    }).click(function (e) {
                        $('#content .project-categories .item').removeClass('active');
                        $(this).parent().addClass('active');
                        self.openCategory($(this).attr('rel'));
                    });
                    $('#content .project-categories').animate({opacity: 0}, 1, function () {
                        $('#content .project-categories').animate({
                            opacity: 1,
                            left: 0
                        });
                    });

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
                            self.openProject($(this).attr('rel'), $(this).parent());
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

    openProject: function (id, div) {
        var self = this;
        console.log(id);
        $.post(siteUrl+'projects-read', {
            id: id
        }, function (data) {
            console.log(data);
            if(data.success) {
                $.get(siteUrl+'_templates/4m/templates/projects-read.page.tpl.html', function(template) {
                    var animation_array = _($('.project')).map(function (item) {
                        return function (cb) {
                            $(item).fadeOut(cb);
                        };
                    });

                    animation_array.push(function (cb) {
                        $('.tabs').animate({
                            top: '+=58',
                            opacity: 0
                        }, cb);
                    });

                    animation_array.push(function (cb) {
                        $('.project-categories').animate({
                            left: -256,
                            opacity: 0
                        }, cb);
                    });

                    async.parallel(animation_array, function () {
                        var islenmis = data.data;
                        var iter = 0;
                        islenmis.galeri.unshift({index: 0, resim: islenmis.resim});
                        islenmis.galeri = _(islenmis.galeri).map(function (resim) {
                            var obj = {
                                resim: resim.resim,
                                index: iter,
                                page: Math.floor(iter / 4.0)
                            };

                            iter++;

                            return obj;
                        });

                        var group = function (list, count) {
                            return (function _group (list,osc,grouped,index) {
                                if (list.length > 0) {
                                    var first = list[0];
                                    osc.push(first);
                                    if(index == count) {
                                        grouped.push(osc);
                                        osc = [];
                                        index = 0;
                                    }

                                    return _group(_(list).rest(), osc, grouped, index + 1);
                                } else {
                                    if(osc.length > 0) {
                                        grouped.push(osc);
                                    }
                                    return grouped;
                                }
                            })(list,[],[],1);
                        };

                        islenmis.slider = group(islenmis.galeri, 4);
                        $('#content .page-template').append(Mustache.render(template, {
                            data: islenmis,
                            site: siteUrl
                        }));

                        $('.project-full .slideshow').animate({opacity:0},1, function () {
                            $('.project-full .slideshow').css('display', 'block').animate({opacity: 1}, function () {
                                $('.project-full .tabs').animate({opacity: 0}, 1, function () {
                                    $('.project-full .tabs').animate({
                                        top: 399,
                                        opacity: 1
                                    }, function () {
                                        $('.project-full .tabs .slider-container').animate({opacity: 0}, 1, function () {
                                            var littleslider = $('.project-full .tabs .slider-container .slider-slides').bxSlider({
                                                controls: false,
                                                wrapperClass: 'slider-slides',
                                                displaySlideQty: 4,
                                                infiniteLoop: false
                                            });

                                            var bigslider = $('.project-full .slideshow').bxSlider({
                                                controls: false,
                                                infiniteLoop: false,
                                                auto: true,
                                                mode: 'fade',
                                                onBeforeSlide: function(currentSlideNumber, totalSlideQty, currentSlideHtmlObject){
                                                    if(currentSlideNumber > 0) {
                                                        var page = $(currentSlideHtmlObject).attr('rel');
                                                        littleslider.goToSlide(page);
                                                    }
                                                }
                                            });

                                            $('.close-button').click(function (e) {
                                                self.close(function () {
                                                    self.open();
                                                });
                                            });

                                            $('.project-full .tabs .slider-container .slider-slides .slide a').click(function (e) {
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

                                            $('.project-full .tabs .slider-container').animate({
                                                bottom: 16,
                                                opacity: 1
                                            });
                                        });
                                    });
                                });
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

        async.series(_($('#content .project')).map(function (el) {
            return function (cb) {
                $(el).animate({
                    'margin-left': 470,
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