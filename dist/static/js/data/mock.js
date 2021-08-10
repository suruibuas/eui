/**
 * mock数据
 */

loader.ready(() => {
    // 登录
    Mock.mock(/api\/login/, (options) => {
        let post = query(options.body, true);
        let code = 100;
        let msg  = '登录成功，页面正在跳转';
        if (post.verify != 'mkl0')
        {
            code = 101;
            msg  = '验证码输入有误';
        }
        else if (post.uname != 'eadmin')
        {
            code = 101;
            msg  = '账号输入错误';
        }
        else if (post.pword != '888888')
        {
            code = 101;
            msg  = '密码输入错误';
        }
        return {
            code   : code,
            msg    : msg,
            remind : 'message'
        };
    });

    // 清理缓存
    Mock.mock(/api\/clearCache/, {
        code   : 100,
        msg    : '缓存清理成功',
        // 自定义弹出提示使用message模式，默认是popup
        remind : 'message'
    });

    // 修改密码
    Mock.mock(/api\/editpass/, {
        code   : 100,
        msg    : '密码修改成功',
        // 自定义弹出提示使用message模式，默认是popup
        remind : 'message'
    });

    // 联动菜单子菜单数据
    Mock.mock(/api\/select/, (options) => {
        let get  = query(options.url, true);
        let data = {};
        if (get.fruit == 1)
        {
            data = {
                1 : '苹果',
                2 : '香蕉',
                3 : '西瓜',
                4 : '菠萝',
                5 : '梨',
                6 : '柚子'
            };
        }
        else
        {
            data = {
                1 : '足球',
                2 : '篮球',
                3 : '乒乓球',
                4 : '羽毛球'
            };
        }
        return {
            code : 100,
            data : data
        };
    });

    // 穿梭框
    Mock.mock(/api\/transfer/, () => {
        let data = [];
        for (var i = 1; i <= 10; i++)
        {
            data.push({
                // 显示的文本
                txt  : '选项 ' + i,
                // 真实取值
                val  : i
            });
        }
        return {
            code : 100,
            data : data
        }
    });

    // 表格
    Mock.mock(/api\/table/, (options) => {
        let get  = query(options.url, true);
        let list = [];
        for (var i = 1; i <= get.size; i++)
        {
            list.push({
                id      : i,
                emp     : 'eadmin',
                name    : '演示',
                icon    : '',
                pic     : '',
                api     : '/api/table/',
                plan    : 1,
                tag     : 'js,css,vue',
                create  : 'eadmin',
                addtime : 1628081989,
                audit   : 'admin',
                type    : 'GET',
                status  : 1,
                view    : 100,
                use     : 88
            });
        }
        return {
            code : 100,
            data : {
                count : 100,
                list  : list
            }
        }
    });

    // 自定义分页
    Mock.mock(/api\/page/, (options) => {
        let get  = query(options.url, true);
        let list = [];
        for (var i = 1; i <= get.size; i++)
        {
            list.push({
                id      : i,
                title   : 'eadmin',
                cate    : '演示',
                hit     : 10,
                comment : 20,
                good    : 50,
                icon    : '//cdn.eadmin.com.cn/upload/1.jpg',
                pic     : '//cdn.eadmin.com.cn/upload/3.jpg',
                name    : '管理员',
                addtime : 1628081989,
                status  : 1
            });
        }
        return {
            code : 100,
            data : {
                count : 100,
                list  : list
            }
        }
    });

    // 状态
    Mock.mock(/api\/status/, {
        code : 100,
        msg  : '状态更新成功'
    });

    // 删除
    Mock.mock(/api\/delete/, {
        code : 100,
        msg  : '数据删除成功'
    });

    // 综合演示
    Mock.mock(/api\/demo/, (options) => {
        let get  = query(options.url, true);
        let list = [];
        for (var i = 1; i <= get.size; i++)
        {
            list.push({
                id      : i,
                emp     : 'eadmin',
                name    : '演示',
                icon    : '',
                pic     : '',
                api     : '/api/demo/',
                plan    : 1,
                tag     : 'js,css,vue',
                create  : 'eadmin',
                addtime : 1628081989,
                audit   : 'admin',
                type    : 'GET',
                status  : 1,
                view    : 100,
                use     : 88
            });
        }
        return {
            code : 100,
            data : {
                count : 100,
                list  : list,
                num   : 100,
                money : 8593,
                back  : 129,
                repay : 1128
            }
        }
    });

    // 新建数据
    Mock.mock(/api\/add/, {
        code : 100,
        msg  : '数据新建成功'
    });

    // 编辑资料
    Mock.mock(/api\/editinfo/, {
        code : 100,
        msg  : '资料编辑成功'
    });

});