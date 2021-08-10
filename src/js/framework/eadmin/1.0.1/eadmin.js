/*
 * =================================
 * eadmin
 * 用途： 核心类
 * 开发人员：surui / 317953536@qq.com
 * 版本：V2.0.1
 * =================================
 * 功能：核心类
 * =================================
 */

// 定义主容器DOM缓存
let box;

/**
 * 定义核心类
 */
let eadmin = class Eadmin{

    /**
     * 构造，执行一些初始化操作
     */
    constructor(){
        box = $('#container');
        // 禁止选中
        if ( ! module.conf.allow_user_select)
        {
            userselect(0);
            selectEnabled = false;
        }
        // 禁止右键
        if ( ! module.conf.allow_right_click)
        {
            disabledRight();
        }
        // 当前链接
        this.href = '';
        // 实时链接，这个链接和this.href的区别是，这个链接可能是弹窗内的链接或者TAB中的链接
        this.currentHref = '';
        // 大盒子的滚动条对象
        this.boxScroll = null;
        // 默认响应链接跳转
        this.jumpHref();
        // 如果有通知消息则设置默认顶部距离
        $('body').append('<div id="notice"></div>');
        $('#notice').css('top', module.conf.notice_top);
        // 预加载错误图片
        if (module.conf.error_default_img != undefined && 
            module.conf.error_default_img != '')
        {
            $('body').append(`<img id="error-default-img" src="${module.conf.error_default_img}" class="dn">`);
            $('#error-default-img').on('error', () => {
                module.conf.error_default_img = '';
                console.log('默认缺省图' + module.conf.error_default_img + ' 不可用');
            });
        }
        // 双击回顶
        if (module.conf.dblclick_goto_top)
        {
            box.on('dblclick', () => {
                let dblclick = store('dblclick');
                if (dblclick === '0')
                {
                    return;
                }
                if (dblclick === '1')
                {
                    box.scrollTop(0);
                    return;
                }
                Popup.confirm({
                    content : '是否同意开启双击回顶功能，本消息仅提示一次',
                    submit  : () => {
                        store('dblclick', '1');
                        Popup.success({
                            content : '双击回顶设置成功',
                            submit  : () => {box.scrollTop(0);}
                        });
                    },
                    cancel : () => {
                        store('dblclick', '0');
                    }
                });
            });
        }
        if (module.plugin == undefined)
            module.plugin = [];
        // 遮罩
        $('body').append('<div class="mask dn"></div>');
        // 加载进度条
        $('body').append(`<div id="loading-progress"></div>`);
    }

    /**
     * 页面加载顶部进度条
     * @type 类型，1：显示 0：隐藏
     */
    loadingProgress(type = 1)
    {
        let dom = $('#loading-progress');
        if (type == 1)
        {
            dom.css('opacity', 1).animate({
                width : innerW()
            }, 10000);
            return;
        }
        dom.stop().width(innerW()).animate({
            opacity : 0
        });
    }

    /**
     * 打开遮罩层
     */
    mask(){
        let mask = $('.mask');
        mask.empty();
        if (mask.is(':hidden'))
        {
            mask.show();
            return false;
        }
        let window = $('.window:visible').length;
        if (window > 0)
        {
            let zindex = 9998 + window;
            mask.css('z-index', zindex);
            return zindex;
        }
        return false;
    }

    /**
     * 隐藏遮罩层
     */
    maskHide(){
        let [mask, window] = [
            $('.mask'), 
            $('.window:visible').length
        ];
        if (window > 0)
        {
            mask.css('z-index', '-=1');
        }
        else
        {
            mask.css('z-index', 9998).hide();
        }
    }

    /**
     * 启动页
     */
    homepage(){
        let _this = this;
        // 设置容器滚动区域高度
        box.height(innerH() - $('header').outerHeight() - 30);
        // 如果配置了启动页，则默认加载启动页
        if(module.conf == undefined || 
            module.conf.homepage == undefined || 
            module.conf.homepage == '') return;
        // 加载动画
        this.loadingProgress();
        // 判断默认主页
        let homepage = getRoute();
        if ( ! homepage)
        {
            homepage = module.conf.homepage;
            store.remove('main_nav_id');
            store.remove('sub_nav_id');
        }
        else
        {
            _this.href = homepage;
            _this.currentHref = homepage;
        }
        // 延迟
        if (module.conf.load_page_timeout != undefined && 
            module.conf.load_page_timeout > 0)
        {
            setTimeout(() => {
                // 加载
                box.
                load(homepage, () => {
                    _this.load();
                });
            }, module.conf.load_page_timeout);
        }
        else
        {
            // 加载
            box.load(homepage, () => {
                _this.load();
            });
        }
    }

    /**
     * 框架内部链接跳转
     */
    jumpHref(){
        // 判断容器是否正常
        if (module.conf.homepage !== false && 
            box.length == 0)
        {
            // 这里后面会替换成框架内的弹框
            console.log('没有找到id为container的容器div，请检查!');
            return false;
        }
        let _this = this;
        $('body').on('click', 'a:not(.ql-action), button.href', function(){
            let v = {
                this   : $(this),
                subnav : $('.sub-nav')
            };
            v.href = v.this.attr('href');
            _this.href = _this.currentHref = v.href;
            // 一级导航
            if (v.this.hasClass('nav'))
            {
                // 切换样式
                addClassExc(v.this, 'active');
                // 判断是否有子导航
                v.id  = v.this.data('id'),
                v.sub = window.nav[v.id].sub;
                store('main_nav_id', v.id.toString());
                if (v.sub == undefined)
                {
                    if (window.nav[v.id].href == undefined)
                    {
                        console.log('当前分类既没有子分类，也没有指定链接');
                        return false;
                    }
                    $('.sub-nav div').eq(1).empty();
                }
                else
                {
                    // 子分类内容处理
                    v.navHtml = '<ul>';
                    for (let id in v.sub)
                    {
                        v.navHtml += '<a href="' + v.sub[id].href + '" data-id="' + id + '"';
                        if (v.sub[id].native != undefined)
                        {
                            v.navHtml += ` data-native target="_blank">`;
                        }
                        else
                        {
                            v.navHtml += ` class="nav-sub"`;
                            if (v.sub[id].container != undefined)
                                navHtml += ` data-container="${v.sub[id].container}"`;
                            v.navHtml += `>`;
                        }
                        v.navHtml += `<li>`;
                        if (v.sub[id].icon != undefined && v.sub[id].icon != '')
                            v.navHtml += '<i class="' + v.sub[id].icon + '"></i>';
                        v.navHtml += v.sub[id].name;
                        v.navHtml += '</li></a>';
                    }
                    v.navHtml += '</ul>';
                    v.subnav.
                        show().
                        children('div').
                        eq(1).
                        html(v.navHtml);
                    // 判断是否需要自动点击第一个子分类
                    if (module.conf.auto_click_sub_nav != undefined && 
                        module.conf.auto_click_sub_nav)
                    {
                        // 如果第一个链接是原生跳转则返回
                        if(v.sub[0].native != undefined) return;
                        v.subnav.find('a:first').trigger('click');
                        store('sub_nav_id', '0');
                        return false;
                    }
                }
            }
            // 二级导航
            else if(v.this.hasClass('nav-sub'))
            {
                addClassExc(v.this, 'active');
                store('sub_nav_id', v.this.data('id').toString());
            }
            // 阻止框架内跳转
            if (_this.href == 'javascript:;' || 
                v.this.data('native') != undefined) return true;
            // 设置URL
            setRoute(_this.href);
            let storeKey = md5(_this.href);
            store.remove(storeKey + '_page');
            // 重载
            let container = v.this.data('container');
            container = container ? '#' + container : false;
            _this.refresh(container);
            return false;
        });
    }

    /**
     * 刷新当前页面
     */
    refresh(container = false){
        let _this = this;
        let _box  = ! container ? box : $(container);
        _box.empty();
        // 加载动画
        this.loadingProgress();
        // 需要销毁的元素
        let destroy = [
            '.window',
            '.datepicker',
            '.citypicker',
            '.dz-hidden-input',
            '.dropdown:not(.fixed)'
        ];
        for (let i in destroy)
            $(destroy[i]).remove();
        if (Mount.dropzone.length > 0)
        {
            _.each(Mount.dropzone, (d) => {
                d.disable();
            });
            Mount.dropzone = [];
        }
        Mount.window = null;
        // 清理定时器
        if (Mount.timeout.length > 0)
        {
            _.each(Mount.timeout, (val) => {
                clearTimeout(val);
            });
        }
        if (Mount.interval.length > 0)
        {
            _.each(Mount.interval, (val) => {
                clearInterval(val);
            });
        }
        // 加载
        setTimeout(() => {
            Method = {};
            _this.href = _this.href == '' ? module.conf.homepage : _this.href;
            $(window).off();
            _box.off().
            load(_this.href, () => {
                _this.load();
                if (container != '#right-frame')
                    return;
                let contents = `<div class="contents"><ul>`;
                _box.find('h2').
                each(function(i){
                    $(this).attr('id', 'h2-'+ i);
                    let h2 = $(this).html();;
                    contents += `<li>${h2}</li>`;
                });
                contents += `</ul></div>`;
                _box.append(contents);
                // 代码高亮
                $('code').each(function(){
                    let v  = {this : $(this)};
                    v.html = v.this.html();
                    v.html = v.html.replace(/[<>]/g, (c) => {
                        return {'<':'&lt;', '>':'&gt;'}[c];
                    });
                    v.html = v.html.replace(/^\s+|\s+$/g, '');
                    v.this.html(v.html);
                    if ( ! v.this.hasClass('hljs')) return true;
                    hljs.highlightBlock(v.this[0]);
                    hljs.lineNumbersBlock(v.this[0]);
                });
            });
        }, module.conf.load_page_timeout);
    }

    /**
     * 框架一、二级导航处理
     */
    nav(){
        if (module.conf.homepage === false)
            return;
        // 私有函数
        let create = (data) => {
            let navHtml = '<ul>';
            // 遍历主导航数据
            let i = 0;
            let main_nav_id = store('main_nav_id');
            for (let id in data)
            {
                let href = (data[id].sub == undefined) ? data[id].href : 'javascript:;';
                let act  = '';
                if (main_nav_id == undefined)
                {
                    if (i == 0) 
                        act = ' active';
                }
                else
                {
                    if (id == main_nav_id) 
                        act = ' active';
                }
                navHtml += `<a href="${href}"`;
                if (data[id].native == undefined)
                {
                    navHtml += `class="nav${act}" data-id="${id}"`;
                    if (data[id].container != undefined)
                        navHtml += ` data-container="${data[id].container}"`;
                    navHtml += `>`;
                }
                else
                {
                    navHtml += ` data-native target="_blank">`;
                }
                navHtml += `<li>${data[id].name}<div class="nav-slider"></div></li></a>`;
                i++;
            }
            navHtml += '</ul>';
            // 主导航交互
            $('.nav').html(navHtml);
            // 二级导航默认显示处理
            if (main_nav_id == undefined) return;
            let sub = window.nav[main_nav_id].sub;
            if (sub == undefined) return;
            // 子分类内容处理
            navHtml = '<ul>';
            let sub_nav_id = store('sub_nav_id');
            for (let id in sub)
            {
                navHtml += '<a href="' + sub[id].href + '" data-id="' + id + '"';
                if (sub[id].native != undefined)
                {
                    navHtml += ` data-native target="_blank">`;
                }
                else
                {
                    navHtml += ` class="nav-sub`;
                    if (id == sub_nav_id)
                        navHtml += ' active';
                    navHtml += '">';
                }
                navHtml += `<li>`;
                if (sub[id].icon != undefined && 
                    sub[id].icon != '')
                    navHtml += '<i class="' + sub[id].icon + '"></i>';
                navHtml += sub[id].name;
                navHtml += '</li></a>';
            }
            navHtml += '</ul>';
            $('.sub-nav').
                show().
                children('div').
                eq(1).
                html(navHtml);
        }
        // 实体文件数据源
        if (module.conf.nav_data_source == 'local')
        {
            loader.load(_ROOTPATH + 'js/data/nav.js', () => {
                create(window.nav);
            });
            return;
        }
        // 接口数据源
        if (module.conf.nav_api_url == '')
        {
            console.log('导航接口地址不能为空，导航创建失败');
            return;
        }
        this.get({
            url  : module.conf.nav_api_url,
            then : (data) => {
                window.nav = data;
                create(data);
            }
        });
    }

    /**
     * 加载页面
     */
    load(){
        if (this.boxScroll != null)
        {
            this.boxScroll.destroy();
            this.boxScroll = null;
        }
        this.loadingProgress(0);
        // 默认图
        defaultImg(box);
        // 块
        block(box);
        // 表单渲染
        this.form();
        // 按钮渲染
        Button.run(box);
        // 标签
        Tag.run(box);
        // 监听滚动
        this.onscroll();
        // 滚动条处理
        let scroll = $('body').find('.iscroll');
        if(scroll.length > 0)
        {
            let _this = this;
            scroll.
            each(function(){
                _this.scroll($(this)[0]);
            });
        }
        this.boxScroll = this.scroll(box[0]);
        // 进度条
        Progress.run(box);
    }

    /**
     * 滚动条
     */
    scroll(dom, scroll = 'y'){
        let param = {
            wheelPropagation: (scroll == 'y' ? false : true),
        };
        if (scroll == 'y')
        {
            param.suppressScrollX = true;
        }
        else
        {
            param.suppressScrollY = true;
        }
        return new PerfectScrollbar(dom, param);
    }

    /**
     * 表单
     */
    form(dom = null){
        Form.init(dom);
        return this;
    }

    /**
     * 日期选择
     */
    datepicker(dom, param){
        new Datepikcer(dom, param);
        return this;
    }

    /**
     * 城市选择
     */
    citypicker(dom, param){
        new Citypikcer(dom, param);
        return this;
    }

    /**
     * 弹窗
     */
    window(dom, param){
        new Window(dom, param);
        return this;
    }

    /**
     * 滑块
     */
    slider(dom, param){
        new Slider(dom, param);
        return this;
    }

    /**
     * 穿梭框
     */
    transfer(dom, param){
        new Transfer(dom, param);
        return this;
    }

    /**
     * 评分
     */
    rate(dom, param){
        new Rate(dom, param);
        return this;
    }

    /**
     * 颜色选择
     */
    colorpicker(dom, param){
        new Colorpicker(dom, param);
        return this;
    }

    /**
     * 表格
     */
    table(dom, param){
        return new Table(dom, param);
    }

    /**
     * 自定义分页
     */
    page(param){
        new Page(param);
        return this;
    }

    /**
     * 上传
     */
    upload(dom, param){
        new Upload(dom, param);
        return this;
    }

    /**
     * 图表
     */
    chart(dom, param){
        new EChart(dom, param);
        return this;
    }

    /**
     * 树形
     */
    tree(dom, param){
        new Tree(dom, param);
        return this;
    }

    /**
     * 选项卡
     */
    tab(dom, param){
        new Tab(dom, param);
        return this;
    }

    /**
     * 编辑器
     */
    editor(dom, param){
        new Editor(dom, param);
        return this;
    }

    /**
     * 下拉菜单
     * @param {*} dom 
     * @param {*} param 
     */
    dropdown(dom, param){
        new Dropdown(dom, param);
        return this;
    }

    /**
     * 模版
     */
    template(dom, data, callback){
        try{
            template != undefined;
            let v = {
                html : template(dom, data),
                box  : scope('[data-template="' + dom + '"]')
            };
            if (v.box.length == 0)
            {
                console.log('没有找到对应的模版容器 data-template="' + dom + '"，渲染失败');
                return;
            }
            v.box.html(v.html);
            if (_.isFunction(callback))
                callback();
        }
        catch(e){
            console.log(e);
        }
    }

    /**
     * 通用获取GET参数
     */
    request(name = ''){
        // 获取参数原始值
        if (dom.length == 0)
        {
            return {};
        }
        let val = dom.val();
        if (val == '')
        {
            return {};
        }
        val = JSON.parse(val);
        if (name == '')
        {
            return val;
        }
        return val[name];
    }

    /**
     * 滚动条滚动响应
     */
    onscroll(){
        let hide = [
            '.datepicker',
            '.citypicker',
            '.dropdown'
        ];
        box.on('scroll', () => {
            if ( ! clear) return;
            for (let i in hide)
                $(hide[i]).hide();
            $(':focus').trigger('blur');
            clear = false;
        });
    }

    /**
     * 发送GET请求
     */
    get(param = {})
    {
        if (param.url == undefined)
        {
            console.log('请指定接口地址');
            return;
        }
        if (param.param == undefined)
            param.param = {};
        axios.get(param.url, {
            params : param.param
        }).
        then((response) => {
            let data;
            if (_.isFunction(module.conf.http.response))
                data = module.conf.http.response(response.data);
            else
                data = response.data;
            // 没有执行码
            if (data[module.conf.http.code_field] == undefined)
            {
                console.log('接口返回结果中没有找到定义的code码字段');
                return;
            }
            let msg = '';
            if (data[module.conf.http.msg_field] != undefined)
                msg = data[module.conf.http.msg_field];
            // 执行失败
            if (data[module.conf.http.code_field] != module.conf.http.code_success)
            {
                if (msg == '') msg = '操作执行失败';
                Message.error({
                    content : msg
                });
                if (_.isFunction(param.error))
                    param.error();
                return;
            }
            if (param.popup !== true)
            {
                if (_.isFunction(param.then))
                    param.then(data[module.conf.http.data_field]);
                return;
            }
            msg = msg || '操作执行成功';
            // 提示
            let conf = {content : msg};
            if (_.isFunction(param.then))
            {
                conf.callback = () => {
                    param.then(data);
                };
            }
            // 自定义提醒模式
            if (data.remind == undefined)
            {
                conf.submit = conf.callback;
                Popup.success(conf);
                return;
            }
            if (data.remind == 'no')
            {
                if (conf.callback != undefined) 
                    conf.callback();
                return;
            }
            switch (data.remind)
            {
                case 'notice':
                    Notice.success({
                        title : '消息提醒',
                        desc  : msg
                    });
                    if (conf.callback != undefined) 
                        conf.callback();
                break;
                case 'message':
                    Message.success({
                        content : msg
                    });
                    if (conf.callback != undefined) 
                        conf.callback();
                break;
                case 'popup':
                    conf.submit = conf.callback;
                    Popup.success(conf);
                break;
            }
        }).
        catch((e) => {console.log(e);});
    }

    /**
     * 发送POST请求
     */
    post(param = {})
    {
        if (param.url == undefined)
        {
            console.log('请指定接口地址');
            return;
        }
        if (param.form == undefined)
        {
            console.log('请指定需要提交的POST数据');
            return;
        }
        axios.post(param.url, param.form, module.conf.http.headers).
        then((response) => {
            let data;
            if (_.isFunction(module.conf.http.response))
                data = module.conf.http.response(response.data);
            else
                data = response.data;
            if (data[module.conf.http.code_field] == undefined)
            {
                console.log('接口返回结果中没有找到定义的code码字段');
                return;
            }
            let msg = '';
            if (data[module.conf.http.msg_field] != undefined)
                msg = data[module.conf.http.msg_field];
            // 执行失败
            if (data[module.conf.http.code_field] != module.conf.http.code_success)
            {
                msg = msg || '操作执行失败';
                Message.error({
                    content : msg
                });
                if (_.isFunction(param.error))
                    param.error(data);
                return;
            }
            if (_.isFunction(param.close))
                param.close();
            msg = msg || '操作执行成功';
            // 提示
            let conf = {content : msg};
            if (_.isFunction(param.then))
            {
                conf.callback = () => {
                    param.then(data);
                };
            }
            // 自定义提醒模式
            if (data.remind == undefined)
            {
                conf.submit = conf.callback;
                Popup.success(conf);
                return;
            }
            if (data.remind == 'no')
            {
                if (conf.callback != undefined) 
                    conf.callback();
                return;
            }
            switch (data.remind)
            {
                case 'notice':
                    Notice.success({
                        title : '消息提醒',
                        desc  : msg
                    });
                    if (conf.callback != undefined) 
                        conf.callback();
                break;
                case 'message':
                    Message.success({
                        content : msg
                    });
                    if (conf.callback != undefined) 
                        conf.callback();
                break;
                case 'popup':
                    conf.submit = conf.callback;
                    Popup.success(conf);
                break;
            }
        }).
        catch((error) => {
            console.log(error);
            if (_.isFunction(param.error))
                param.error();
        });
    }

}

// 实例化
let Eadmin = new eadmin();

loader.ready(() => {
    // 识别配色
    Mount.skin = body.css('background-color').indexOf(245) == -1 ? 'dark' : 'light';
    // 全局图表配置
    if (module.framework.chart != undefined)
    {
        Chart.defaults.fontColor = '#FFF';
        Chart.defaults.scale.gridLines.color = '#151935';
    }
    // 注册HTTP请求全局参数
    if(module.framework.axios != undefined)
    {
        _.each(module.conf.http, (val, key) => {
            axios.defaults[key] = val;
        });
    }
    // 全局上传处理
    if(module.plugin.indexOf('dropzone') != -1)
        Dropzone.autoDiscover = false;
    // 导航
    Eadmin.nav();
    // 主界面
    Eadmin.homepage();
    // TIPS
    Tips.run();
    // POPUP
    Eadmin.popup = Popup;
    // MESSAGE
    Eadmin.message = Message;
    // NOTICE
    Eadmin.notice = Notice;
    // BUTTON
    Eadmin.button = Button;
    Button.event();
    // 表单事件
    Form.event();
    // 表单验证
    Validate.run();
    // 图片查看器
    Imageview.run();
    // 点击遮罩关闭弹窗
    if ( ! module.conf.window_close_by_shade) return;
    $('.mask').on('click', () => {
        if ($('.window').length == 0) 
            return;
        // 如果有弹出框则不做动作
        if ($('.popup:visible').length > 0)
            return;
        let window = $('.window:last');
        window.children('.window-close').trigger('click');
    });
});