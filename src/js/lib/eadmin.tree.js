/**
 * eadmin 树形组件
 */

class Tree{

	constructor(dom, param){
		this.dom = $(dom);
		this.domName = dom;
		let _param = {
			// 复选框
			checkbox : false,
			// 半选
			halfcheck : false,
			// 显示图标
			icon : true,
			// 数据
			data : {}
		};
		// 配置参数
		this.param = $.extend(_param, param);
		this.dom.addClass('ztree');
		this.run();
	}

	run(){
		let option = {
			view : {
				showIcon: this.param.icon
			},
			check : {
				enable : this.param.checkbox,
				chkDisabledInherit: true
			},
			data : {
				simpleData : {
					enable : true
				}
			}
		};
		if (this.param.checkbox)
		{
			if ( ! this.param.halfcheck)
			{
				option.check.chkboxType = {'Y' : 'ps', 'N' : 'ps'};
			}
			else
			{
				option.check.chkboxType = {'Y' : 's', 'N' : 's'};
			}
		}
		$.fn.zTree.init(this.dom, option, this.param.data);
	}

	getChecked(){
		let obj = this.getZtree();
        return obj.getCheckedNodes(true);
	}

	getZtree(){
		let dom = this.domName.replace('#', '', this.domName);
		dom = dom.replace('.', '', dom);
		return $.fn.zTree.getZTreeObj(dom);
	}
	
}