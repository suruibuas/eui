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
        data   : {
            success : 1
        },
        // 自定义弹出提示使用message模式，默认是popup
        remind : 'message'
    });

    // 修改密码
    Mock.mock(/api\/editpass/, {
        code   : 100,
        msg    : '密码修改成功',
        data   : {
            success : 1
        },
        // 自定义弹出提示使用message模式，默认是popup
        remind : 'message'
    });
});