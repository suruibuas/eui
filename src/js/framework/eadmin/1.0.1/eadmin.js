/**
 * eadmin核心通用框架
 */

// 定义主容器DOM缓存和导航数据
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
        if ( ! module.conf.allow_select_text)
        {
            selectText(0);
            selectEnabled = false;
        }
        // 禁止右键
        if ( ! module.conf.allow_right_click)
        {
            disabledRight();
        }
        // 当前链接
        this.href = '';
        // 实时链接
        this.currentHref = '';
        // 大盒子的滚动条对象
        this.boxScroll = null;
        // 默认响应链接跳转
        this.jumpHref();
        // 如果有通知消息则设置默认顶部距离
        if (module.lib.indexOf('notice') != -1)
        {
            $('body').append('<div id="notice"></div>');
            $('#notice').css('top', module.conf.notice_top);
        }
    }

    /**
     * 加载中
     */
    loading(msg = ''){
        this.mask();
        $('.mask').html(`<i class="ri-loader-4-line rotate"></i>${msg == '' ? '页面加载中，请稍候...' : msg}`);
    }

    /**
     * 关闭加载中
     */
    loadingHide(){
        if(Mount.page) return;
        this.maskHide();
    }

    /**
     * 打开遮罩层
     */
    mask(){
        if ($('.mask').length == 0)
            $('body').append('<div class="mask"></div>');
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
        let mask = $('.mask');
        if ($('.window:visible').length > 0)
        {
            mask.css('z-index', '-=1');
        }
        else
        {
            mask.hide();   
        }
    }

    /**
     * 启动页
     */
    homepage(){
        let that = this;
        // 设置容器滚动区域高度
        box.height(innerH() - $('header').outerHeight() - 40);
        // 如果配置了启动页，则默认加载启动页
        if(module.conf == undefined || 
            module.conf.homepage == undefined || 
            module.conf.homepage == '') return;
        // 加载动画
        this.loading();
        // 延迟
        if (module.conf.load_page_timeout != undefined && 
            module.conf.load_page_timeout > 0)
        {
            setTimeout(() => {
                // 加载
                box.
                load(module.conf.homepage, () => {
                    that.load();
                });
            }, module.conf.load_page_timeout);
        }
        else
        {
            // 加载
            box.
            load(module.conf.homepage, () => {
                that.load();
            });
        }
    }

    /**
     * 框架内部链接跳转
     */
    jumpHref(){
        // 判断容器是否正常
        if (box.length == 0)
        {
            // 这里后面会替换成框架内的弹框
            console.log('没有找到id为container的容器div，请检查!');
            return false;
        }
        let that = this;
        $('body').on('click', 'a:not(.ql-action)', function(){
            let v = {
                this   : $(this),
                subnav : $('.sub-nav')
            };
            if (v.this.hasClass('active')) return false;
            that.href = v.this.attr('href');
            that.currentHref = that.href;
            // 一级导航
            if (v.this.hasClass('nav'))
            {
                // 切换样式
                addClassExc(v.this, 'active');
                // 判断是否有子导航
                v.id  = v.this.data('id'),
                v.sub = window.nav[v.id].sub;
                if (v.sub == undefined)
                {
                    if (window.nav[v.id].href == undefined)
                    {
                        console.log('当前分类既没有子分类，也没有指定链接');
                        return false;
                    }
                    $('.sub-nav div').
                        eq(1).
                        empty();
                }
                else
                {
                    // 子分类内容处理
                    v.subnav.show();
                    v.navHtml = '<ul>';
                    for (let id in v.sub)
                    {
                        v.navHtml += '<a href="' + v.sub[id].href + '"';
                        if (v.sub[id].native != undefined)
                        {
                            v.navHtml += ` data-native target="_blank">`;
                        }
                        else
                        {
                            v.navHtml += ` class="nav-sub">`;
                        }
                        v.navHtml += `<li>`;
                        if (v.sub[id].icon != undefined && v.sub[id].icon != '')
                            v.navHtml += '<i class="' + v.sub[id].icon + '"></i>';
                        v.navHtml += v.sub[id].name;
                        v.navHtml += '</li></a>';
                    }
                    v.navHtml += '</ul>';
                    $('.sub-nav div').
                        eq(1).
                        html(v.navHtml);
                    // 判断是否需要自动点击第一个子分类
                    if (module.conf.auto_click_sub_nav != undefined && 
                        module.conf.auto_click_sub_nav)
                    {
                        // 如果第一个链接是原生跳转则返回
                        if(v.sub[0].native != undefined) return;
                        v.subnav.
                            find('a:first').
                            trigger('click');
                        return false;
                    }
                }
            }
            // 二级导航
            else if(v.this.hasClass('nav-sub'))
            {
                addClassExc(v.this, 'active');
            }
            // 阻止框架内跳转
            if (that.href == 'javascript:;' || 
                v.this.data('native') != undefined) return true;
            let storeKey = md5(that.href);
            store.remove(storeKey + '_page');
            // 重载
            that.refresh();
            return false;
        });
    }

    /**
     * 刷新当前页面
     */
    refresh(){
        let that = this;
        box.empty();
        // loading
        that.loading();
        let destroy = [
            '.window',
            '.datepicker',
            '.citypicker',
            '.dz-hidden-input'
        ];
        for (let i in destroy)
        {
            $(destroy[i]).remove();
        }
        if (Mount.dropzone.length > 0)
        {
            _.each(Mount.dropzone, (d) => {
                d.disable();
            });
            Mount.dropzone = [];
        }
        Mount.window = null;
        Mount.data   = null;
        // 加载
        setTimeout(() => {
            Method = {};
            that.href = that.href == '' ? module.conf.homepage : that.href;
            box.
                off().
                load(that.href, () => {
                    that.load();
                });
        }, module.conf.load_page_timeout);
    }

    /**
     * 框架一、二级导航处理
     */
    nav(){
        // 私有函数
        let create = (data) => {
            let navHtml = '<ul>';
            // 遍历主导航数据
            let i = 0;
            for (let id in data)
            {
                let href = (data[id].sub == undefined) ? data[id].href : 'javascript:;',
                    act  = (i == 0) ? ' active' : '';
                navHtml += `<a href="${href}"`
                if (data[id].native == undefined)
                {
                    navHtml += `class="nav${act}" data-id="${id}">`;
                }
                else
                {
                    navHtml += ` data-native="1" target="_blank">`;
                }
                navHtml += `<li>${data[id].name}<div class="nav-slider"></div></li></a>`;
                i++;
            }
            navHtml += '</ul>';
            let nav = $('.nav');
            // 主导航交互
            nav.html(navHtml);
        }
        // 实体文件数据源
        if (module.conf.nav_data_source == 'local')
        {
            loader.load(_ROOTPATH + 'data/nav.js', () => {
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
        axios.get(module.conf.nav_api_url).
        then((response) => {
            window.nav = response.data;
            create(response.data);
        }).
        catch((error) => {
            console.log(error);
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
        this.loadingHide();
        // 表单渲染
        this.form();
        // 按钮渲染
        Button.run(box);
        // 状态
        Status.run(box);
        // 标签
        Tag.run(box);
        // 进度条
        Progress.run(box);
        // 监听滚动
        this.onscroll();
        // 滚动条处理
        let scroll = $('body').find('.iscroll');
        if(scroll.length > 0)
        {
            let that = this;
            scroll.
            each(function(){
                that.scroll($(this)[0]);
            });
        }
        this.boxScroll = this.scroll(box[0]);
        // 块
        block(box);
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
    window(dom, param, bind = true){
        new Window(dom, param, bind);
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
        new Table(dom, param);
        return this;
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
     * 改变窗口大小响应
     */
    resize(){
        $(window).on('resize', _.debounce(() => {
            if (innerW() < 1152)
            {

            }
        }, 200));
    }

    /**
     * 滚动条滚动响应
     */
    onscroll(){
        let hide = [
            '.datepicker',
            '.citypicker'
        ];
        box.on('scroll', () => {
            if ( ! clear) return;
            for (let i in hide)
                $(hide[i]).hide();
            $(':focus').blur();
            clear = false;
        });
    }

}

// 实例化
let Eadmin = new eadmin();

loader.ready(() => {
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
    // 上传处理
    if(module.plugin.indexOf('dropzone') != -1)
        Dropzone.autoDiscover = false;
    // 导航
    Eadmin.nav();
    // 主界面
    Eadmin.homepage();
    // 响应resize
    Eadmin.resize();
    // TIPS
    if(module.lib.indexOf('tips') != -1)
    {
        Tips.run();
    }
    // POPUP
    if(module.lib.indexOf('popup') != -1)
        Eadmin.popup = Popup;
    // MESSAGE
    if(module.lib.indexOf('message') != -1)
        Eadmin.message = Message;
    // NOTICE
    if(module.lib.indexOf('notice') != -1)
        Eadmin.notice = Notice;
    // BUTTON
    if(module.lib.indexOf('button') != -1)
    {
        Eadmin.button = Button;
        Button.event();
    }
    // 表单事件
    if(module.lib.indexOf('form') != -1)
        Form.event();
    // 表单验证
    if(module.lib.indexOf('validate') != -1)
        Validate.run();
    // 点击遮罩关闭弹窗
    if ( ! module.conf.window_close_by_shade) return;
    $('.mask').on('click', () => {
        if ($('.window').length == 0) return;
        let window = $('.window:last');
        window.
            children('.window-close').
            trigger('click');
    });
});