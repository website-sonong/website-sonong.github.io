$(function () {
    $("form.feedback2").each(function () {
        var form = $(this);
        var classid = $(this).attr("classid") - 0;
        var error = $(this).attr("error");
        var success = $(this).attr("success");
        var field = $(this).attr("rel").split(',');
        //for (i in field) {
        //    tempvalue = '';
        //    $("[name='" + field[i] + "']", $(this)).blur(function () {
        //        tempvalue = $(this).val();
        //        if ($(this).hasClass("required") && isNull(tempvalue)) {
        //            layer.msg($(this).attr("msg"));
        //            return false;
        //        }
        //        if (
        //            ($(this).hasClass("email") && !isEmail(tempvalue)) ||
        //            ($(this).hasClass("phone") && !isPhone(tempvalue))) {
        //            layer.msg($(this).attr("title") + "格式不正确");
        //            return false;
        //        }
        //    });
        //}
        //$(".codeimg", form).click(function () {
        //    $(this).find("img").eq(0).attr("src", "/ashx/feedbackCode.ashx?" + new Date().getTime());

        //});
        $(this).submit(function () {
            var obj = {}, code = '';
            obj.ClassId = classid;
            for (i in field) {
                temp = $("[name='" + field[i] + "']", $(this));
                if (temp.length > 1) {
                    $("[name='" + field[i] + "']:checked", $(this)).each(function () {
                        obj[field[i]] = $(this).val();
                    });
                }
                obj[field[i]] = temp.val();
                if (temp.hasClass("required") && isNull(obj[field[i]])) {
                    layer.msg(temp.attr("msg"));
                    return false;
                }
                if (
                    (temp.hasClass("email") && !isEmail(obj[field[i]])) ||
                    (temp.hasClass("phone") && !isPhone(obj[field[i]]))) {
                    layer.msg(temp.attr("title") + "格式不正确");
                    return false;
                }
            }
            //if ($(".code", $(this)).length > 0) {
            //    code = $(".code", $(this)).val();
            //    if (isNull(code) || code.length < 4) {
            //        layer.msg("验证码不正确");
            //        return false;
            //    }
            //}//没有验证码，暂时注释

            if (typeof Feedback == "Function") {
                Submit(Feedback, obj);
            } else {
                $.getScript("/ajax/Feedback.ashx", function () {
                    Submit(Feedback, obj);
                });
            }
            return false;
        });

        //不需要验证码
        function Submit(Feedback, obj) {
            Feedback.SendFeedback(obj, function (res) {
                if (res && res.value) {
                    if (res.value.state) {
                        layer.msg(success, 2, 9);

                        form[0].reset();
                    } else {
                        layer.msg(res.value.msg);
                    }
                } else {
                    layer.msg(error);
                }
            })
        }

    });

    function isEmail(str) {
        var reg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,6})+$/;
        return reg.test(str);
    }
    function isPhone(str) {
        var reg = /^(13[0-9]|14[0-9]|15[0-9]|170|18[0-9])\d{8}$/;
        return reg.test(str);
    }
    function isNull(str) {
        if (str != null && str != undefined && str.length > 0)
            return false;
        return true;
    }
});
