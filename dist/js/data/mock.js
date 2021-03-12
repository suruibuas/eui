/**
 * mock数据
 */

loader.ready(() => {
    // 演示表格数据
    Mock.mock(/table/, {
        code : 100,
        msg  : '请求成功',
        data : {
            count : 100,
            'list|10' : [{
                'id|+1'   : 1,
                'emp'     : '会员',
                'name'    : '注销账号',
                'icon'    : '',
                'pic'	  : '',
                'plan'    : 1,
                'api'     : '/member/cancel/',
                'create'  : '管理员',
                'addtime' : "@date('yyyy-MM-dd')",
                'tag'     : 'api,微服务,后端',
                'audit'   : '管理员',
                'type'    : 'GET',
                'state'   : 1,
                'view'    : 3,
                'use'     : 99
            }]
        }
    });
});