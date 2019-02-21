// JavaScript Document
$(function () {
    if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.match(/6./i) == "6.") {
        $('.CWhint,.masker02').show();
    }
    else if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.match(/7./i) == "7.") {
        $('.CWhint,.masker02').show();
    }
    else if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.match(/8./i) == "8.") {
        $('.CWhint,.masker02').show();
    }
    else if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.match(/9./i) == "9.") {
        $('.CWhint,.masker02').show();
    }

    $('.CWclsoe,.CWhintrighthref').click(function () {
        $('.CWhint,.masker02').hide();
    })

});