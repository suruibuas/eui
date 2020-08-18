/**
 * eadmin 树形组件
 */

class Tree{

	constructor(dom, param){
		this.dom = $(dom);
		let _param = {
			// 复选框
			checkbox : false,
			// 数据
			data : []
		};
		// 配置参数
		this.param = $.extend(_param, param);
		this.dom.addClass('tree');
		if (this.param.data.length == 0)
		{
			this.dom.html('<span class="note mt20">没有树形菜单数据</span>');
			return;
		}
		this.run();
	}

	/**
	 * 执行
	 */
	run()
	{
		this._create();
		this._event();
	}

	/**
	 * 创建
	 */
	_create()
	{
		let v = {
			html : ''
		};
		let create = (level, data) => {
			_.each(data, (row, key) => {
				let ul = '';
				// 第一级
				if (level == 0)
				{
					if (row.children == undefined)
						ul = ' style="margin-left:0;"';
				}
				else
				{
					if (this.param.checkbox)
						ul = ' class="tree-checkbox"';
					if (row.children == undefined)
						ul += ' style="padding-left:45px;"';
				}
				v.html += `<ul${ul}><li data-level="${level}" data-key="${key}">`;
				if (row.children != undefined)
					v.html += `<i class="ri-arrow-right-s-line"></i>`;
				// 判断是否有复选
				if (this.param.checkbox)
				{
					v.html += `<label>
									<input name="fruit" type="checkbox"> ${row.name}
								</label>`;
				}
				else
				{
					v.html += `<span>${row.name}</span>`;
				}
				if (row.children != undefined)
					create(level + 1, row.children);
				v.html += `</li></ul>`;
			});
		};
		create(0, this.param.data);
		this.dom.html(v.html);
	}

	/**
	 * 事件
	 */
	_event()
	{

	}
	
}