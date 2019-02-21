

; (function (jQuery) {
    jQuery.fn.LoadMoreAjax = function (opt) {
        var classid = opt.ClassId;
        var pageIndex = opt.PageIndex;
        var pageSize = opt.PageSize;
        var totalpage = opt.Totalpage;
        var con = opt.Con;
        var _this = this;
        var ver = opt.Ver;
        var list = opt.List;
        var Fun = opt.ObjFun;
        Fun.Query(classid, pageIndex, pageSize, ver, function (res) {
            if (res && res.value) {
                totalpage = res.value.TotalPages;
                var html = '';
                for (i in res.value.msg.Items) {
                    //html += list(res.value.msg.Items[i]);
                    html += list(res.value.msg.Items[i]);
                }
                con.append(html);
                pageIndex++;
                if (pageIndex > totalpage) {
                    _this.hide();
                } else {
                    _this.show();
                }
            }

            laypage({
                cont: _this, //容器。值支持id名、原生dom对象，jquery对象,
                pages: totalpage, //总页数
                groups: 0, //连续分数数0
                prev: false, //不显示上一页
                //next: '查看更多',
                next: '',
                skin: 'flow', //设置信息流模式的样式
                jump: function (obj, first) {
                    if (!first) {
                        _this.LoadMoreAjax({
                            ObjFun: Fun,
                            ClassId: classid,
                            PageIndex: pageIndex,
                            PageSize: pageSize,
                            Totalpage: totalpage,
                            Con: con,
                            Ver: ver,
                            List: list
                        });
                    }
                }
            });
        })

    }
})(jQuery);



function GetDateTime(Dtime) {
    var NewDtime = new Date(parseInt(Dtime.slice(6, 19)));
    return formatDate(NewDtime);
}


function formatDate(dt) {
    var year = dt.getFullYear();
    var month = dt.getMonth() + 1;
    var date = dt.getDate();
    var hour = dt.getHours();
    var minute = dt.getMinutes();
    var second = dt.getSeconds();
    return year + "-" + fd(month); + "-" + fd(date); //+ " " + fd(hour) + ":" + fd(minute) + ":" + fd(second);
}

function fd(v) {
    if (v < 10)
        return '0' + v;
    return v;
}