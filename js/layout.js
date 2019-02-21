// 原型封装 插件
/*
    插件优化：
    1、增加店家切换
    2、异常处理curLeft
    3、curLeft的改变
    4、事件的绑定与取消
    5、宽度自适应的 
    6、插件被异常调用的处理，源头
*/
!(function ($, window, document) {
    var NavActive,
        curLeft,
        hoverLeft,
        plugin = 'slideActive',
        defaluts = {
            activeClass: '.cur', // 选中的当前class
            comeTime: 300, // 到目标位置的时间
            shakeTranslateX: 20, // 左右抖动的距离
            shakeTime: 100, // 抖动时间
            backTime: 300, // 回到当前class位置的时间
            ifbackOrgin: true // 是否返回到初始的位置
        };
    // 构造函数
    NavActive = function (element, options, callback) {
        // 参数调整
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }
        callback = callback || null;
        // 属性
        this.element = element;
        this.settings = $.extend({}, defaluts, options); // option || default
        this._default = defaluts;
        this._name = this.plugin;
        this._callback = callback;
        this.$firstSlider = $(this.element).siblings(this.settings.activeClass).length > 0 ? $(this.element).siblings(this.settings.activeClass) : $(this.element).eq(0);
        this.curLeft = this.$firstSlider.position().left;
        this.sliderWd = this.$firstSlider.outerWidth() || $(this.element).eq(0).width(); // 调整宽度
        return this.init();
    };
    // 原型 -- 字面量
    /*
        属性中的this -> window
        调用中的this -> NavActive
    */
    NavActive.prototype = {
        ifRun: function () {
            if ($(window).width() < 992) return false;
            return ture;
        },
        init: function () {
            var $el, _this, _tagName;
            _this = this;
            $el = $(this.element);
            $elParent = $el.parent();
            _tagName = this.$firstSlider.get(0).tagName.toLowerCase();

            $el.last().after('<' + _tagName + ' id="activehook">');
            // 最后一个
            _this.slider = $el.siblings('#activehook').css({
                'left': _this.curLeft,
                'width': _this.sliderWd
            }); // 扩展 slider

            if (!_this.ifRun) {
                $el.off('mouseenter').unbind('mouseleave');
                return;
            }
            // resize Envent  
            $(window).resize(function () {
                _this.slider = $el.siblings('#activehook').css('left', _this.curLeft);
            });
            // click Event 
            $el.on('click', function () {
                _this.curLeft = $(this).position().left; // click  curLeft
                // _this.initActiveFn($(this));
            });
            // hover Event
            $el.hover(function () {
                _this.initActiveFn($(this));
            });
            $elParent.on('mouseleave', function () {
                if (_this.settings.ifbackOrgin) return _this.backOrigin();
            })
        },
        initActiveFn: function ($item) {
            // this -> NavActive 
            // 变量的访问作用域  ->
            var _this = this;
            var moveEnd = this.curLeft;
            var curLeft = $item.position().left;
            var lastLeft = this.slider.position().left;

            // 滑块的widht
            // console.log($item.outerWidth());
            // _this.slider.css('width',$item.outerWidth());

            if (curLeft > lastLeft) { // slide right
                moveEnd = curLeft + _this.settings.shakeTranslateX;
            } else { // slide left
                moveEnd = curLeft - _this.settings.shakeTranslateX
            }
            // animate
            _this.slider.stop().animate({
                'left': moveEnd
            }, _this.settings.comeTime, function () { // animate cb
                _this.slider.stop().animate({
                    'left': curLeft
                }, _this.settings.shakeTime);
            }).css('width', $item.outerWidth());
            // 回调函数的时机
            return _this.runCallBack(_this);
        },
        backOrigin: function () {
            // this -> NavACtive
            var _this = this;
            _this.slider.stop().animate({
                'left': _this.curLeft
            }, _this.settings.backTime, function () {
                _this.slider.css('width', _this.sliderWd);
            });
        },
        runCallBack: function (_this) {
            return !_this._callback ? null : _this._callback(_this.element);
        }
    }
    // 自运行调用 挂载插件 // 还不清楚 $.data()的使用
    return $.fn[plugin] = function (options, callback) {
        // console.log(this);  // DOM
        return new NavActive(this, options, callback);
    };
})(jQuery, window, document);

$(function () {

    var throttle = function (func, wait, options) {
        var context, args, result;
        var timeout = null;
        var previous = 0; // 起始时间
        if (!options) options = {}; // default：{}
        // 定时器函数
        var later = function () {
            previous = options.leading === false ? 0 : $.now(); // default: now
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        };
        return function () {
            var now = $.now();
            if (!previous && options.leading === false) previous = now;
            // 时差
            var remaining = wait - (now - previous); // default: remaining >0
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now; // reset: previous
                result = func.apply(context, args); // 显示绑定；null相当于顶级对象，相当于直接 result = func;
                if (!timeout) context = args = null; // 清空 参数
            } else if (!timeout && options.trailing !== false) { // timer=null &&  [trailing] =true
                timeout = setTimeout(later, remaining);
            }
            return result; // 显示绑定函数
        };
    };

    $('.pcnav li').each(function () {

        if ($(this).find('.second').length > 0) {
            $(this).find('.first').addClass('hassub');
        }
    });

    $(".mobilenav").on("click", function () {
        $(".headsearchbtn").removeClass("show");
        $(".mobilesearch").stop().slideUp(function () {
            $(this).removeAttr("style");
        });
        if ($(".nav").is(":hidden")) {
            $(this).addClass("show");
            $(".nav").slideDown(300);
        } else {

            $(this).removeClass("show");
            $(".nav").slideUp(300, function () {
                $(this).removeAttr("style");
            });
        }
    });

    $(".headsearchbtn").click(function () {
        $(".mobilenav").removeClass("show");
        $(".nav").slideUp(300, function () {
            $(this).removeAttr("style");
        });
        if ($(this).hasClass("show")) {
            $(this).removeClass("show");
            $(".mobilesearch").stop().slideUp(function () {
                $(this).removeAttr("style");
            });
        } else {
            $(this).addClass("show");
            $(".mobilesearch").stop().slideDown();
        }
    });
    if (typeof Swiper != 'undefined') {
        var _indexswiper = new Swiper('.banner', {
            pagination: '.bannerdot',
            autoplay: 3500,
            loop: true,
            paginationClickable: true,
            autoplayDisableOnInteraction: false,
            speed: 1000
        });
        // 内容 滚动
        var swiper = new Swiper('.service-terms', {
            scrollbar: '.service-terms .swiper-scrollbar',
            direction: 'vertical',
            slidesPerView: 'auto',
            mousewheelControl: true,
            freeMode: true,
            roundLengths: true
        });

    }

    function resizeW() {
        if ($(".header").height() >= 80) {
            // 初始化
            $(".footnav").css("display", "block");
            $(".footerlinks ul li h4").unbind("click");
            $(".insidenavT").unbind("click");
        } else {
            //初始化
            $(".footnav").css("display", "none");
            $(".footerlinks ul li h4").unbind("click").bind("click", function () {
                if ($(this).parent().find(".footnav").is(":hidden")) {
                    $(this).addClass("cur").parent().siblings().find("h4").removeClass("cur");
                    $(this).parents("ul").find("li").find(".footnav").stop().slideUp();
                    $(this).parent().find(".footnav").stop().slideDown();
                } else {
                    $(this).removeClass("cur");
                    $(this).parent().find(".footnav").stop().slideUp();
                }
            });
            // 内页，手机版下拉
            $(".insidenavT").unbind("click").bind("click", function () {
                if ($(this).parent().hasClass("show")) {
                    $(this).parent().removeClass("show");
                    $(this).parent().find("ul").stop().slideUp(function () {
                        $(this).removeAttr("style");
                    });
                } else {
                    $(this).parent().find("ul").stop().slideDown(function () {
                        $(this).parent().addClass("show");
                    });
                }
            });
        }

        // 手机版进入，ipad以上弹窗
        if ($(window).width() < 768) {
            $(".thumb-origin-hook li a").off('click');
            //$('.rightbuoy .side-inner').hide().find('p').hide();
            $('.rightbuoy .item a').off('moverenter').unbind('mouseleave');
            // 侧边栏
            $('.rightbuoy').off('click').on('click', function () {
                var _sideIn = $(this).find('.side-inner');
                if (_sideIn.is(':hidden')) {
                    _sideIn.fadeIn();
                } else {
                    _sideIn.fadeOut();
                }
            });
            $('.rightbuoy .item a').on('click', function (ev) {
                ev.stopPropagation();
                $(this).next().fadeIn(300).parent().siblings().find('p').hide();
            });
        } else {
            $('.rightbuoy .side-inner').show().find('p').hide();
            $('.rightbuoy .item a').off('moverenter').unbind('mouseleave');
        }

        if ($(window).width() > 992) {
            $('.rightbuoy .item a').hover(function () {
                $(this).next().fadeIn(300)
            }, function () {
                $(this).next().fadeOut(300)
            });
        }
        // click or hover
        if ($(window).width() < 992) {
            $('.prdt-share .m-share-slide').hide();
            // $('.prdt-share').off(' mouseenter').unbind('mouseleave');
            $(document).off('mouseenter mouseleave', '.prdt-share');
            $(document).off('mouseenter mouseleave', '.job-delivery');

            // documnet off
            $(document).off('click', '.prdt-share .shareall').on('click', '.prdt-share .shareall', function () {
                $(this).next().fadeIn(300);
            });

            // $('.prdt-share .shareall').off('click').on('click', function () {
            //     $(this).next().fadeIn(300);
            // });
            /* 新增 -- job-delivery */

            $(document).off('click', '.job-delivery .delivery').on('click', '.job-delivery .delivery', function () {
                $(this).next().fadeIn();
            });
            $('.pcnav .hassub').off('mouseenter').unbind('mouseleave');
            // 导航
            $('.pcnav .hassub a').off('click').on('click', function (ev) {
                ev.preventDefault();
                $(this).parent().toggleClass('roll').next().slideToggle().parents('li').siblings().find('.first').removeClass('roll').next().slideUp();
            });

        } else {
            $('.prdt-share .m-share-slide').hide();
            $('.job-delivery .delivery-ways').hide();
            $(document).off('click', '.prdt-share .shareall');

            $(document).on('mouseenter', '.prdt-share', function () {
                $(this).find('.m-share-slide').stop(true, true).fadeIn(300);
            });
            $(document).on('mouseleave', '.prdt-share', function (ev) {
                if ($(ev.target).hasClass('.prdt-share')) {
                    $(this).find('.m-share-slide').stop(true, true).show();
                    return;
                }
                $(this).find('.m-share-slide').stop(true, true).fadeOut(300);
            });

            //-- delivery
            $(document).off('click', '.job-delivery .delivery');

            $(document).on('mouseenter', '.job-delivery', function () {
                $(this).find('.delivery-ways').fadeIn();
            });
            $(document).on('mouseleave', '.job-delivery', function () {
                $(this).find('.delivery-ways').fadeOut();
            });

            //$('.prdt-share .shareall').off('click');
            // $('.prdt-share').hover(function () {
            //     $(this).find('.m-share-slide').stop(true, true).fadeIn(300);
            // }, function () {
            //     $(this).find('.m-share-slide').stop(true, true).fadeOut(300);
            // });

            $('.pcnav .hassub a').off('click');
            // slideActive只有 一个callback; 失败
            if (!$('.pcnav li#activehook').length) {
                $('.pcnav li').last().after('<li id="activehook"></li>');
            }

            var fistOffset = $('.pcnav li.cur').length ? $('.pcnav li.cur').position().left - $('.pcnav').position().left : 0;
            var $navActive = $('.pcnav #activehook');
            $('.pcnav li#activehook').css('left', fistOffset);
            // slideActive
            $('.pcnav li').off('mouseenter').unbind('mouseleave').hover(function () {
                var _offset = $('.pcnav').position().left;
                var curLeft = $(this).position().left - _offset;
                var moveEnd = curLeft;
                var lastLeft = $navActive.position().left - _offset;
                if (curLeft > lastLeft) { // slide right
                    moveEnd = curLeft + 20;
                } else { // slide left
                    moveEnd = curLeft - 20;
                }
                // animate
                $navActive.stop().animate({
                    'left': moveEnd
                }, 300, function () { // animate cb
                    $navActive.stop().animate({
                        'left': curLeft
                    }, 100);
                });
                $(this).find('.second').stop().show();
            }, function () {
                $(this).find('.second').stop().hide();
            });
            // backorgin
            $('.pcnav').on('mouseleave', function () {
                $navActive.stop().animate({
                    'left': fistOffset
                });
            });
        }
    }
    var hArr = [];
    $('.second').each(function () {
        hArr.push($(this).height());
    });
    //console.log(hArr);  // 436, 252, 203, 195, 196

    // if( $('.pcnav li').length>0){  // renturn 的问题
    //     $('.pcnav li').slideActive();  // return 的问题
    // };

    resizeW();
    windowwidth();

    $(window).resize(throttle(resizeW, 200));
    $(window).resize(throttle(windowwidth, 200));
    //  新品推荐 wowclass
    $('.indexrecommend .swiper-slide').eq(0).addClass('wow slideInLeft');
    $('.indexrecommend .swiper-slide').eq(1).addClass('wow slideInLeft');
    $('.indexrecommend .swiper-slide').eq(2).addClass('wow slideInRight');
    $('.indexrecommend .swiper-slide').eq(3).addClass('wow slideInRight');

    /* wow css效果*/
    if (typeof WOW != 'undefined') {
        var wow = new WOW({
            boxClass: 'wow', // animated element css class (default is wow)
            animateClass: 'animated', // animation css class (default is animated)
            offset: 0, // distance to the element when triggering the animation (default is 0)
            mobile: false, // trigger animations on mobile devices (default is true)
            live: true // act on asynchronously loaded content (default is true)
        });
        wow.init();
    }

    if ($(".indexbanner").length > 0) {
        var mySwiper = new Swiper('.indexbanner', {
            effect: 'slide',
            loop: true,
            autoplay: 5000,
            speed: 1200,
            pagination: '.indexbannerbtn',
            prevButton: '.leftbtn',
            nextButton: '.rightbtn',
            paginationClickable: true,
            preventClicks: false,
            autoplayDisableOnInteraction: false,
            grabCursor: false,
            parallax: true,
            onTransitionEnd: function (swiper) {
                $(".indexbanner ul li").eq(swiper.activeIndex).addClass("active").siblings().removeClass("active");
            }
        });
    };

    function windowwidth() {
        var overflowwid = $("body").css("overflow", "hidden").width();
        var windowwid = $("body").removeAttr("style").width();
        var scrollwid = overflowwid - windowwid;

        if (windowwid + scrollwid > 1024) {

            $(".indexbanner").mouseenter(function () {
                $(".leftbtn,.rightbtn").show();
            });
            $(".indexbanner").mouseleave(function () {
                $(".leftbtn,.rightbtn").hide();
            })

            $(".indexbanner li").each(function () {
                var thisindex = $(this);
                var datecolor = thisindex.find(".bannertextcont").attr("data-color");
                var dateclass = thisindex.find(".bannertextcont").attr("data-dq");
                var listattr = thisindex.find(".bannertextcont").attr("style");
                thisindex.find(".bannertextcont").attr("style", datecolor);
                thisindex.find(".bannertextcont").addClass(dateclass);
            });

        } else {

            $(".indexbanner li").each(function () {
                var thisindex = $(this);
                var listattr = thisindex.find(".bannertextcont").attr("style");
                thisindex.find(".bannertextcont").attr("style", "");
            });

            $(".bannertextcont").removeClass("bannerleft bannercenter banrright");

        };
    }
    if ($(".indexrecommend").length > 0) {
        var swiper = new Swiper('.indexrecommend .swiper-container', {
            autoplay: 4000,
            speed: 1200,
            loop: true,
            nextButton: '.indexrecommend .swiper-button-next',
            prevButton: '.indexrecommend .swiper-button-prev',
            paginationClickable: true,
            slidesPerView: 4,
            spaceBetween: 2,
            breakpoints: {
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 2
                },
                768: {
                    slidesPerView: 2,
                    spaceBetween: 2
                },
                640: {
                    slidesPerView: 1,
                    spaceBetween: 2
                }
            }
        });
    }

    // swiper
    $(".indexsolution ul li .name .btn").click(function () {
        if ($(this).parents(".textbox").hasClass("show")) {
            $(this).parents(".textbox").removeClass("show");
            $(this).parents(".textbox").find(".text").css({
                "height": "auto",
                "white-space": "initial",
                "text-overflow": "initial"
            });
            $(this).parents(".textbox").find(".text").stop().animate({
                "height": 22
            }, 500, function () {
                $(this).removeAttr("style");
            });
        } else {
            $(this).parents(".textbox").addClass("show");
            $(this).parents(".textbox").find(".text").css({
                "height": "auto",
                "white-space": "initial",
                "text-overflow": "initial"
            });
            var h1 = $(this).parents(".textbox").find(".text").height();
            $(this).parents(".textbox").find(".text").css({
                "height": 22
            });
            $(this).parents(".textbox").find(".text").stop().animate({
                "height": h1
            }, 500, function () {
                $(this).removeAttr("style");
            })
        }
    });

    $(".cutP").each(function () {
        var _this = $(this);
        _this.find(".cutbtn").find("a").eq(0).addClass("cur");
        _this.find(".cutlump").eq(0).show();
        _this.find(".cutbtn").find("a").click(function () {
            $(this).addClass("cur").siblings().removeClass("cur");
            _this.find(".cutlump").hide();
            _this.find(".cutlump").eq($(this).index()).show();
        });
    });
    $(".loginbtn").click(function () {
        $(".loginpopup").show();
        $('.logo-register').fadeIn(300);
    });

    $(".popup .bg").click(function () {
        $(this).parents(".popup").hide();
        if ($(this).parents(".popup").hasClass("videopopup")) {
            $(this).parents(".popup").find(".videopopupM video").attr("src", "");
        }
    });

    // 登陆弹窗隐藏，
    function hideLoginPop() {
        $(".popup .bg").trigger('click');
    }

    $(".videobtn").click(function () {
        var src1 = $(this).attr("videosrc");
        $(".videopopupM video").attr("src", src1);
        $(".videopopup").show();
    });
    $(".buoytopbtn").click(function () {
        $("html,body").stop().animate({
            scrollTop: 0
        }, 300);
    });
    // 二级 链接定位
    $(".twonavs").each(function () {
        if ($(this).find(".cur").length > 0) {
            $(this).parents("li").addClass("cur");
            $(this).parents("li").addClass("action");
            $(this).show();
        }
        //$(this).find('.twoitem').eq(0).find('.thrnavs').show();
    });
    // 三级链接定位
    $('.thrnavs').each(function () {
        if ($(this).find(".cur").length > 0) {
            $(this).parent().addClass('cur').parents('li').addClass('cur action');
            $(this).show();
        }
    });
    // click slide
    // //  二级

    $('.insidenav ul li .twoitem').on('click', function (ev) {
        ev.stopPropagation();
        if ($(this).find('.thrnavs').length > 0) { // 三级
            if ($(this).hasClass('cur')) {
                $(this).removeClass('cur').find('.thrnavs').stop().slideUp();
            } else {
                $(this).addClass('cur').find('.thrnavs').stop().slideDown().end().siblings().removeClass('cur').find('.thrnavs').stop().slideUp();
            }
        } else {
            location.href = $(this).find('a').eq(0).attr('href');
        }
    });
    // 三级, -- 修复
    $('.insidenav ul li .twoitem .thrnavs').on('click', function (ev) {
        ev.stopPropagation();
    });

    $(".insidenav li .onenav").on('click', function () {
        var _curLi = $(this).parent();
        _twonavsArr = _curLi.find('.twonavs'),
            _twoFirstLink = _twonavsArr.find('a').eq(0); // 二级第一个 基准
        if (_twonavsArr.length == 0) return;
        if (_twoFirstLink.next().hasClass('thrnavs')) { // 
            location.href = _twoFirstLink.next().find('a').eq(0).attr('href')
        } else {
            location.href = _twoFirstLink.attr('href');
        }
    });

    // 招贤纳士
    $(document).on('click', '.advertise-list li .job', function () {
        if ($(this).next().is(':hidden')) {
            $(this).next().slideDown().parent().addClass('cur').siblings().removeClass('cur').find('.job-slide').slideUp();
        } else {
            $(this).parent().removeClass('cur').find('.job-slide').slideUp();
        }
    });

    // 产品详情
    $('.param-tabtitles h3').on('click', function () {
        $(this).addClass('cur').siblings().removeClass().removeClass('cur');
        $('.param-tabboxs .item').eq($(this).index()).show().siblings().hide();
    });
    if (typeof Swiper !== 'undefined') {
        var _mainGallarySw = new Swiper('.main-gallary', {
            pagination: '.main-gallary .swiper-pagination'
        });
    }
    $('.small-gallary li').on('click', function () {
        $(this).addClass('cur').siblings().removeClass('cur');
        if (typeof Swiper !== 'undefined') {
            _mainGallarySw.slideTo($(this).index(), 500, false);
        }
    });
    /* 加入我们表单*/
    $('.formsubmitM .formbox input').on('focus', function () {
        $(this).parents('dl').find('dt').addClass('cur');
    });
    $('.formsubmitM .formbox input').on('blur', function () {
        $(this).parents('dl').find('dt').removeClass('cur');
    });


    // slidActive

    if ($('.param-tabtitles h3').length > 0) {
        $('.param-tabtitles h3').slideActive();
    }
    if ($('.insideCnav a').length > 0) {
        $('.insideCnav a').slideActive();
    }
    if ($('.contactmap .city-select a').length > 0) {
        $('.contactmap .city-select a').slideActive();
    }
    if ($('.prdt-wapper .last-cate a').length > 0) {
        $('.prdt-wapper .last-cate a').slideActive();
    }
    //_solutionSw
    // 首页
    if ($(".indexsolution").length > 0) {
        var _solutionSw = new Swiper('.indexsolution .swiper-container', {
            autoplay: 5000,
            pagination: '.indexsolution .swiper-pagination',
            paginationClickable: false,
            // autoplayDisableOnInteraction: false,
            paginationBulletRender: function (swiper, index, className) {
                return '<span class="' + className + '">' + $(".indexsolution ul li").eq(index).attr("name") + '</span>';
            }
        });
        $('.indexsolution .swiper-pagination').on('mouseenter', 'span.swiper-pagination-bullet', function () {
            _solutionSw.slideTo($(this).index(), 1000, false);
        });
    }
    // --语言版本建设提示
    $('.languagelist a').on('click', function (ev) {
        ev.stopPropagation();
        if ($(this).attr('href').indexOf('javascript:;') !== -1) {
            $('.language-hook').fadeIn(300);
        };
    });
    //-- 对比功能建设
    $('.prdt-compare a').on('click', function (ev) {
        ev.stopPropagation();
        $('.compare-hook').fadeIn(300);
    });
    $(document).on('click', function (ev) {
        if ($(ev.target).closest('.othersite-popup .tips').length === 0) {
            $('.othersite-popup').fadeOut(300);
        }
    });
    // 微信二维码
    $('.follow-us .weixin').on('click', function () {
        $('.weixin-qrcode').show().addClass('animated zoomIn');
    });
    // document colose
    $(document).on('click', function (ev) {
        if ($(ev.target).closest('.prdt-share').length === 0) {
            $('.prdt-share .m-share-slide').hide();
        };
        if ($(ev.target).closest('.job-delivery').length === 0) {
            $('.job-delivery .delivery-ways').hide();
        }
        if ($(ev.target).closest('.weixin').length === 0) {
            $('.weixin-qrcode').fadeOut().removeClass('animated zoomIn');
        }
    });

    // 对比功能start
    //对比功能
    // $('.m-share-slide .weixin').on('click',function(){
    //     //console.log('111111111111');
    //     $('.bd_weixin_popup_head span').text('Use Wechat Scan QR code');
    //     $('.bd_weixin_popup_foot').text('');

    //     $('.bd_weixin_popup').on('load',function(){
    //         //console.log('245454');
    //          $('.bd_weixin_popup_head span').text('Use Wechat Scan QR code');
    //          $('.bd_weixin_popup_foot').text('');
    //     });
    // });
    // $(".prolistyan li").on("click", function () {
    //     if ($(this).hasClass("cur")) {
    //         $(this).removeClass("cur");
    //     } else {
    //         $(this).addClass("cur");
    //     }
    // });
    // $(".protianj").on("click", function () {
    //     $(".commpare-box").fadeIn();
    // });
    // $(".colsetancy").on("click", function () {
    //     $(".commpare-box").fadeOut();
    // });
    // $(".truedin").on("click", function () {

    //     if ($(".prolistyan li.cur").length > 4) {
    //         alert("抱歉，您只能选择4款产品进行对比");
    //         return false;
    //     } else {
    //         return true;
    //     }
    // });
    // 对比页面
    $(".prolistyan li").on("click", function () {
        if ($(this).hasClass("cur")) {
            $(this).removeClass("cur");
        } else {
            $(this).addClass("cur");
        }
    });

    $(document).on("click", ".protianj a", function () {
        $(".commpare-box").fadeIn();
    });
    $(".colsetancy").on("click", function () {
        $(".commpare-box").fadeOut();
    });
    // 选择的时候就要确认
    /*
        1、选择 2个产品后， 添加第三个产品， 默认选中当前分类
        2、选择 2个产品后，切换分类 了，需要清除，切换另一类别的对比
    */
    window.chooesArr = []; // 数据的 添加删除 ；对应关系  需要唯一的 对应关系 id
    $(document).on('click', '.commpare-box .prdt-item', function (ev) {
        // console.log($('.commpare-box .prdt-item.cur').length);
        ev.stopPropagation();
        if ($(this).hasClass('cur')) { // string fontcolor 高亮的插件
            // 同化 str,str,str,
            var _arrStr = (chooesArr.join(',') + ',').replace($(this).attr('rel') + ',', ''); // return string
            // 还原数组
            chooesArr = _arrStr.split(',');
            // 去除末尾空项
            chooesArr.pop();
            // console.log(_arrStr);
            // console.log(chooesArr);
            $(this).removeClass('cur');
        } else {
            // 又是同样的问题   if / else 0/ 1
            if (chooesArr.length < 4) {
                chooesArr.push($(this).attr('rel'));
                $(this).addClass('cur');
            } else {
                $('.number-tiphook').find('.msg').text('一次比较最多添加4种产品！').end().stop().fadeIn();
            }
        }
        // result
        //window.chooesIdStr = chooesArr.join(',');// 全局
        // console.log(chooesIdStr);
    });
    $('.number-tiphook').on('click', function (ev) {
        if (!$(ev.target).closest('.tips').length) {
            $('.number-tiphook').stop().fadeOut()
        }
    });

    // $(".truedin").on("click", function () {
    //     if ($(".prolistyan li.cur").length > 4) {
    //         alert("抱歉，您只能选择4款产品进行对比");
    //         return false;
    //     } else {
    //         return true;
    //     }
    // });
    // 二级的
    $(document).on('click', '.navyncenter', function () {
        $(this).next().stop().slideToggle();
    });
    // 三级的
    $(document).on('click', '.navyntit', function () {
        $(this).next().stop().slideToggle();
    });

    // $(".navyxlbox .navyntit").on("click", function () {
    //     if ($(this).next(".prolistyan").is(":hidden")) {
    //         $(this).next(".prolistyan").stop().slideDown();
    //     } else {
    //         $(this).next(".prolistyan").stop().slideUp();
    //     }
    // });


    //对比功能over

});
// load js-sticty-footer
$(window).on('load', function () {
    // 程序js获取的
    $('.advertise-list li').eq(0).addClass('cur').find('.job-slide').show();
    // 问题一： 
    function getSlide() {
        var $thumb = $(".thumb-origin-hook img");
        // var $slideItem = $(".thumb-popup .swiper-wrapper").html();
        var $thumbSwiper = $(".thumb-popup .swiper-wrapper").html('');
        var slide_length = $thumb.length;
        for (var i = 0; i < slide_length; i++) {
            var $item = $('<li class="swiper-slide"><img src="' + $thumb[i].src + '"></li>');
            $thumbSwiper.append($item);
        }
    }
    getSlide(); // 静态获取
    if (typeof Swiper != 'undefined') {
        var thumbCopySwiper = new Swiper(".thumb-copy-wrapper", {
            autoplay: 3000,
            loop: false,
            pagination: ".swiper-pagination",
            observer: true,
            observeParents: true
        });
    }
    // 加载更多获取
    $('.honorlist .loadmorebtn').on('click', function () {
        getSlide();
    });

    $(".thumb-origin-hook").on('click', 'a', function (ev) {
        ev.preventDefault();
        getSlide();
        thumbCopySwiper.slideTo($(this).parent().index(), 0, false);
        $(".thumb-popup").fadeIn(300);
    });
    $(".thumb-popup .close").click(function () {
        $(".thumb-popup").fadeOut(300);
    });
    var $footer = $('.footer'),
        footerHeight = 0,
        footerOffsetT = 0;

    function setFooterPosition(vertion) {
        setTimeout(function () {
            footerHeight = !vertion ? $footer.outerHeight() : $footer.height();
            footerOffsetT = $(window).height() - footerHeight + 'px';
            if ($(document.body).height() < $(window).height()) {
                $footer.css({
                    position: 'absolute',
                    top: footerOffsetT
                });
            } else {
                $footer.css('position', 'static');
            }
        }, 500);
    }
    
    setFooterPosition();
    $(document).click(function () {
        setFooterPosition();
    });
    $(window).resize(setFooterPosition);
})