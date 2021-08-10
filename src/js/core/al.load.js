/*
 * =================================
 * al.js
 * 用途： 核心加载器
 * 开发人员：surui / 317953536@qq.com
 * 版本：V1.1.2
 * =================================
 * 功能：核心加载器
 * =================================
 */

(function(win, undefined){
    var doc        = win.document,
        domWaiters = [],
        handlers   = {},
        assets     = {},
        //判断当前浏览器是否支持非阻塞加载文件
        isAsync    = 'async' in doc.createElement('script') || 'MozAppearance' in doc.documentElement.style || win.opera,
        isDomReady,
        headVar    = 'loader',
        //默认执行ready
        api = win[headVar] = (win[headVar] || function(){
        	api.ready.apply(null, arguments);
        }),
        PRELOADING = 1,
        PRELOADED  = 2,
        LOADING    = 3,
        LOADED     = 4;
    //定义方法黑洞
    function noop(){}
	//遍历对象
    function each(arr, callback)
    {
        if ( ! arr)
        {
            return;
        }
        if (typeof arr === "object")
        {
            arr = [].slice.call(arr);
        }
        for (var i = 0, l = arr.length; i < l; i++)
        {
            callback.call(arr, arr[i], i);
        }
    }
	//校验对象类型，网上大神的写法
    function is(type, obj)
    {
        var clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    }
	//是不是函数
    function isFunction(item)
    {
        return is("Function", item);
    }
	//是不是数组
    function isArray(item)
    {
        return is("Array", item);
    }
	//解析URL
    function toLabel(url)
    {
        var items = url.split("/"),
            name  = items[items.length - 1],
            i     = name.indexOf("?");
        return i !== -1 ? name.substring(0, i) : name;
    }
    //执行一次
    function one(callback) {
        callback = callback || noop;
        if (callback._done)
        {
            return;
        }
        callback();
        callback._done = 1;
    }
    function getAsset(item)
    {
        var asset = {};
        if (typeof item === "object")
        {
            for (var label in item)
            {
                if (!!item[label])
                {
                    asset = {
                        name : label,
                        url  : item[label]
                    };
                }
            }
        }
        else
        {
            asset = {
                name : toLabel(item),
                url  : item
            };
        }
        var existing = assets[asset.name];
        if (existing && existing.url === asset.url)
        {
            return existing;
        }
        assets[asset.name] = asset;
        return asset;
    }
    function allLoaded(items)
    {
        items = items || assets;
        for (var name in items)
        {
            if (items.hasOwnProperty(name) && items[name].state !== LOADED)
            return false;
        }
        return true;
    }
    function apiLoadAsync()
    {
        var args     = arguments,
            callback = args[args.length - 1],
            items    = {};
        if ( ! isFunction(callback))
        {
            callback = null;
        }
        if (isArray(args[0]))
        {
            args[0].push(callback);
            api.load.apply(null, args[0]);
            return api;
        }
        each(args, function(item, i){
            if (item !== callback)
            {
                item             = getAsset(item);
                items[item.name] = item;
            }
        });
        each(args, function(item, i){
            if (item !== callback)
            {
                item = getAsset(item);
                load(item, function(){
                    if (allLoaded(items))
                    one(callback);
                });
            }
        });
        return api;
    }
    function load(asset, callback)
    {
        callback = callback || noop;
        if (asset.state === LOADED)
        {
            callback();
            return;
        }
        if (asset.state === LOADING)
        {
            api.ready(asset.name, callback);
            return;
        }
        if (asset.state === PRELOADING)
        {
            asset.onpreload.push(function(){
                load(asset, callback);
            });
            return;
        }
        asset.state = LOADING;
        loadAsset(asset, function(){
            asset.state = LOADED;
            callback();
            each(handlers[asset.name], function(fn){
                one(fn);
            });
            if (isDomReady && allLoaded())
            {
                each(handlers.ALL, function(fn){
                    one(fn);
                });
            }
        });
    }
    function getExtension(url)
    {
        url = url || "";
        var items = url.split("?")[0].split(".");
        return items[items.length-1].toLowerCase();
    }
    function loadAsset(asset, callback)
    {
        callback = callback || noop;
        function error(event)
        {
            event = event || win.event;
            ele.onload = ele.onreadystatechange = ele.onerror = null;
            callback();
        }
        function process(event)
        {
            event = event || win.event;
            if (event.type === "load" || (/loaded|complete/.test(ele.readyState) && (!doc.documentMode || doc.documentMode < 9)))
            {
                win.clearTimeout(asset.errorTimeout);
                win.clearTimeout(asset.cssTimeout);
                ele.onload = ele.onreadystatechange = ele.onerror = null;
                callback();
            }
        }
        function isCssLoaded()
        {
            if (asset.state !== LOADED && asset.cssRetries <= 20)
            {
                for (var i = 0, l = doc.styleSheets.length; i < l; i++)
                {
                    if (doc.styleSheets[i].href === ele.href)
                    {
                        process({
                        	"type" : "load"
                        });
                        return;
                    }
                }
                asset.cssRetries++;
                asset.cssTimeout = win.setTimeout(isCssLoaded, 250);
            }
        }
        var ele;
        var ext = getExtension(asset.url);
        if (ext === "css")
        {
            ele      = doc.createElement("link");
            ele.type = "text/" + (asset.type || "css");
            ele.rel  = "stylesheet";
            ele.href = asset.url;
            asset.cssRetries = 0;
            asset.cssTimeout = win.setTimeout(isCssLoaded, 500);         
        }
        else
        {
            ele      = doc.createElement("script");
            ele.type = "text/" + (asset.type || "javascript");
            ele.src = asset.url;
        }
        ele.onload  = ele.onreadystatechange = process;
        ele.onerror = error;
        ele.async   = false;
        ele.defer   = false;
        asset.errorTimeout = win.setTimeout(function(){
            error({ type: "timeout" });
        }, 7e3);
        var head = doc.head || doc.getElementsByTagName("head")[0];    
        head.insertBefore(ele, head.lastChild);
    }
    function init()
    {
        var items = doc.getElementsByTagName("script");
        for (var i = 0, l = items.length; i < l; i++)
        {
            var dataMain = items[i].getAttribute("init");
            if (!!dataMain)
            {
                api.load(dataMain);
                return;
            }
        }
    }
    function ready(key, callback)
    {
        if (key === doc)
        {
            if (isDomReady)
            {
                one(callback);
            }
            else
            {
                domWaiters.push(callback);
            }
            return api;
        }
        if (isFunction(key))
        {
            callback = key;
            key      = "ALL";
        }
        if (isArray(key))
        {
            var items = {};
            each(key, function (item)
            {
                items[item] = assets[item];
                api.ready(item, function(){
                    if (allLoaded(items))
                    one(callback);
                });
            });
            return api;
        }
        if (typeof key !== "string" || !isFunction(callback))
        return api;
        var asset = assets[key];
        if (asset && asset.state === LOADED || key === "ALL" && allLoaded() && isDomReady) 
        {
            one(callback);
            return api;
        }
        var arr = handlers[key];
        if ( ! arr) 
        {
            arr = handlers[key] = [callback];
        }
        else
        {
            arr.push(callback);
        }
        return api;
    }
    function domReady()
    {
        if ( ! doc.body)
        {
            win.clearTimeout(api.readyTimeout);
            api.readyTimeout = win.setTimeout(domReady, 50);
            return;
        }
        if (!isDomReady)
        {
            isDomReady = true;
            init();
            each(domWaiters, function(fn){
                one(fn);
            });
        }
    }
    function domContentLoaded()
    {
        if (doc.addEventListener)
        {
            doc.removeEventListener("DOMContentLoaded", domContentLoaded, false);
            domReady();
        }
        else if (doc.readyState === "complete")
        {
            doc.detachEvent("onreadystatechange", domContentLoaded);
            domReady();
        }
    }
    
    if (doc.readyState === "complete")
    {
    	domReady();
    }
    else if (doc.addEventListener)
    {
        doc.addEventListener("DOMContentLoaded", domContentLoaded, false);
        win.addEventListener("load", domReady, false);
    }
    else {
        doc.attachEvent("onreadystatechange", domContentLoaded);
        win.attachEvent("onload", domReady);
        var top = false;
        try
        {
            top = !win.frameElement && doc.documentElement;
        }
        catch(e){}
        if (top && top.doScroll)
        {
            (function doScrollCheck(){
                if ( ! isDomReady)
                {
                    try
                    {
                        top.doScroll("left");
                    }
                    catch(error)
                    {
                        win.clearTimeout(api.readyTimeout);
                        api.readyTimeout = win.setTimeout(doScrollCheck, 50);
                        return;
                    }
                    domReady();
                }
            }());
        }
    }
    api.load  = api.js = isAsync ? apiLoadAsync : apiLoadHack;
    api.ready = ready;
    api.ready(doc, function(){
        if (allLoaded())
        {
            each(handlers.ALL, function (callback){
                one(callback);
            });
        }
        if (api.feature)
        {
            api.feature("domloaded", true);
        }
    });
}(window));