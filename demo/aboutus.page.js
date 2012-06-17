var aboutus_page = new Steam.Page({
    name: 'About Us Page',
    initialize: function(cb) {
        this.pages = this.data.sayfalar;
        this.staff = this.data.calisanlar;

        //console.log(this.staff);

        this.active_page = this.pages[0].id;

        if(cb) {
            cb();
        }
    },

    open: function(cb) {
        var self = this;

        var pages = self.preparePages();
        var template_data = {
            pages: pages,
            active_page: pages[0]
        };

        $.get(window.siteUrl+'_templates/4m/templates/aboutus.page.tpl.html', function(template) {
            $('#content').html(Mustache.render(template, template_data));

            self.introAnimation(function () {
                self.bindEvents();
                if(cb) { cb(); }
            });
        });
    },

    close: function (cb) {
        this.closeAnimation(cb);
    },

    openPeople: function (cb) {
        var self = this;
        var kategoriler = _(self.staff).keys();

        var _kategori = null;
        var _index = 0;
        var liste = _(self.staff).map(function (calisanlar, kategori) {
            return {
                title: kategori,
                people: _(calisanlar).map(function (calisan) {
                    if(kategori != _kategori){
                        _kategori = kategori;
                        _index = 0;
                    }
                    calisan.index = _index;
                    _index += 1;
                    return calisan;
                })
            };
        });

        //console.log('Kategori:', _kategori);
        //console.log('İndex: ', _index);

        //console.log(liste);

        var template_data = {
            staff: liste
        };

        $.get(window.siteUrl+'_templates/4m/templates/people.page.tpl.html', function(template) {
            $('#content').append(Mustache.render(template, template_data));

            self.peopleOpenAnimation(function () {
                self.bindPeopleEvents();
                if(cb) { cb(); }
            });
        });
    },

    bindPeopleEvents: function () {
        var self = this;
        $('.tabs .back').click(function (e) {
            e.preventDefault();
            var pages = self.preparePages_();
            var page = pages[_(pages).keys()[0]];
            $('.project-categories div').removeClass('active');
            $('.project-categories div[rel='+page.id+']').addClass('active');

            self.peopleCloseAnimation(function () {
                $('.project-categories').animate({
                    left: 0,
                    opacity: 1
                });
                self.openPage(page);
            });
        });

        $('#people-list').on( 'click','.person', function (e) {
            e.preventDefault();
            var person_id = $(this).attr('rel').split('-');

            self.openPerson(person_id[0], person_id[1], $(this));
        })
    },

    openPerson: function (person_id, section, $el) {
        var self = this;
        var old_left = $el.position().left;
        var old_top  = $('#people-list').position().top;

        var staff = self.staff;

        $('.tabs .back').off('click');
        $('#people-list').off('click', '.person');

        var $info = $('<div class="person-info">');
        var $close_button = $('<a class="close-button" href="#">');
        var $person_scroll = $('<div class="scrollbar person-scrollbar" id="personinfo-scrollbar">');

        async.parallel(_($('.person, .people-category h2, .scrollbar, .tabs').not($el)).map(function (item) {
            return function (cb) {
                $(item).animate({
                    opacity: 0
                }, cb);
            };
        }), function () {
            $('#people-list').animate({
                top: -($el.position().top),
                left: -(old_left)
            }, function () {
                $('#people-list').parent().parent().append($info);
                $('#people-list').parent().parent().append($close_button);

                $info.html(staff[section][person_id].information);
                $info.append($person_scroll);
                $info.css({
                    left: 255,
                    top: 95
                }).fadeIn(function () {
                    if($('.person-info').height() > 400) {
                        $('.person-info').css('height', 400);
                        $('#personinfo-scrollbar').show().xcrollbar({
                            delay: 100
                        }).css('z-index', 100000);
                        $('#personinfo-scrollbar').parent().css({width: 410, height: 400});
                    }
                });
                $close_button.attr('style', 'top: 100px !important; left: 680px !important; z-index: 99999;');
            });
        });

        $close_button.on('click', function () {
            self.closePerson(old_top);
        });
    },

    closePerson: function (old_top) {
        var self = this;

        $('.close-button, .person-info, #personinfo-scrollbar').animate({
            opacity: 0
        }, function () {
            $(this).remove();
        });

        $('#people-list').animate({
            top: old_top,
            left: 0
        });

        $('.person, .people-category h2, .scrollbar, .tabs').animate({
            opacity: 1
        });

        self.bindPeopleEvents();
    },

    peopleOpenAnimation: function (cb) {
        var self = this;
        async.parallel([
            function (cb) {
                $('.project-categories').animate({
                    left: -256,
                    opacity: 0
                }, cb);
            }, function (cb) {
                async.parallel(_($('#people-list .person')).map(function (item) {
                    return function (cb) {
                        $(item).animate({opacity: 0}, cb);
                    };
                }), function () {
                    $('#people-list').fadeIn();
                    async.parallel(_($('#people-list .person')).map(function (person, index) {
                        return function (cb) {
                            _.delay(function () {
                                $(person).animate({opacity:1}, cb);
                            }, index * 10);
                        };
                    }), cb);
                });

            }, function (cb) {
                $('.tabs .back').fadeIn(cb);
            }
        ], function () {
            $('#staff-list-scrollbar').xcrollbar({
                delay: 100
            });
            if(cb) {
                cb.call(self);
            }
        });
    },

    peopleCloseAnimation: function (cb) {
        var self = this;

        async.parallel([
            function (cb) {
                $('#people-list').parent().fadeOut(cb);
            },
            function (cb) {
                async.parallel(_($('#people-list .person').get().reverse()).map(function (person, index) {
                    return function (cb) {
                        $(person).animate({opacity:0}, cb);
                    };
                }), cb);
            }
        ], function () {
            $('#people-list').parent().remove();
            if(cb) {
                cb.call(self);
            }
        });
    },

    bindEvents: function () {
        var self = this;

        $('.project-categories a').off('click').on('click', function(e) {
            e.preventDefault();

            if($(this).attr('rel') === 'staff') {
                $('.project-categories div').removeClass('active');
                $(this).parent().addClass('active');
                self.closePageAnimation(self.openPeople);
            } else {
                var page_id = $(this).attr('rel');
                var page = self.preparePages_()[page_id];

                $('.project-categories div').removeClass('active');
                $(this).parent().addClass('active');

                self.pageTransition(page);
            }

        });
    },

    closePageAnimation: function(cb) {
        var self = this;

        $('.page-content').animate({
            top: '-=600',
            opacity: 0
        }, function () {
            cb.call(self);
        });
    },

    openPageAnimation: function(cb) {
        $('.page-content').animate({
            top: '+=600',
            opacity: 1
        }, cb);
    },

    pageTransition: function(page, cb) {
        var self = this;

         self.closePageAnimation(function() {
             /*
            $('.page-content').html('');
            var html = $('.page-content').append($('<h2>').text(page.baslik)).html();
            $('.page-content').html(html + page.icerik);

            self.openPageAnimation(cb);*/
             self.openPage(page, cb);
        });
    },

    openPage: function (page, cb) {
        var self = this;

        $('.page-content').html('');
        var html = $('.page-content').append($('<h2>').text(page.baslik)).html();
        $('.page-content').html(html + page.icerik);

        self.openPageAnimation(cb);
    },

    introAnimation: function (cb) {
        $('#content').fadeIn(function () {
            $('.project-categories',this).animate({
                'left': 0
            });

            $('.tabs', this).animate({
                top: 472
            }, cb);
        });
    },

    closeAnimation: function (cb) {
        $('.project-categories').animate({
            left: -256
        });

        $('.tabs').animate({
            top: 529
        }, cb);

        $('#content').fadeOut();
    },

    preparePages: function () {
        var self  = this;
        var pages = _(self.pages).map(function (page) {
            page.active = (page.id == self.active_page);
            return page;
        });

        return pages;
    },

    preparePages_: function () {
        var self  = this;
        var pages = {};
        _(self.pages).each(function (page) {
            page.active = (page.id == self.active_page);
            pages[page.id+''] = page;
        });

        return pages;
    }
});