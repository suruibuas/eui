/**
 * eadmin 树形组件
 */

class Tree{

	constructor(dom, param){
		this.dom = scope(dom);
		this.dom.addClass('tree');
		this.data = _.cloneDeep(param.data);
		let _param = {
			// 数据
			data : [],
			// 复选框
			checkbox : false,
			// 默认展开
			open : false,
			// 选中复选框触发回调
			oncheck : null,
			// 点击菜单时的回调，该回调只有checkbox为false会触发
			onclick : null
		};
		if (param.data.length == 0)
		{
			this.dom.html('<span class="note mt20">没有树形菜单数据</span>');
			return;
		}
		// 格式化数据
		let arr = [];
		let formatTree = (id, tmp, data) => {
			let newArr = data.filter(item => item.pid === id);
			newArr.forEach(item => {
			  	let arr = [];
			  	item.children = formatTree(item.id, arr, data);
			  	tmp.push(item);
			});
			return tmp;
		};
		formatTree(0, arr, this.data);
		// 格式化半选
		let formatHalf = (data) => {
			_.each(data, (row) => {
				let len = row.children.length;
				if (len == 0)
					return true;
				let checked = _.filter(row.children, ['checked', true]).length;
				if (checked > 0 && len > checked)
					row.half = true;
				formatHalf(row.children);
			});
		}
		formatHalf(arr);
		// 配置参数
		this.param = $.extend(_param, param);
		this.param.data = arr;
		this.data  = param.data;
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
		let create = (level, data, open = false, disabled = false) => {
			if (level > 0)
			{
				v.html += '<div';
				if (open !== true && ! this.param.open)
					v.html += ' class="dn"';
				v.html += '>';
			}
			_.each(data, (row) => {
				let ul 	   = '',
				 	isopen = 0,
					child  = row.children.length;
				// 第一级
				if (level == 0)
				{
					if (child == 0)
						ul = ' style="padding-left:20px;"';
					if (this.param.open || 
						row.open === true) 
						isopen = 1;
				}
				else
				{
					if (row.open === true || 
						this.param.open)
						isopen = 1;
					if (this.param.checkbox)
						ul += ' class="tree-checkbox"';
					if (child == 0)
						ul += ` style="padding-left:${this.param.checkbox ? 46 : 38}px;"`;
				}
				v.html += `<ul${ul}><li>`;
				if (child > 0)
				{
					let rotate = isopen == 1 ? 'rotate-90' : 'rotate-0';
					v.html += `<i data-open="${isopen}" class="ri-arrow-right-s-line ${rotate}"></i>`;
				}
				// 判断是否有复选
				if (this.param.checkbox)
				{
					let param = '';
					if (row.checked === true || 
						row.half === true)
						param += ' checked';
					if (row.disabled === true || 
						disabled === true)
						param += ' disabled';
					if (row.half === true)
						param += ' class="checkbox-half"';
					v.html += `<label>
									<input 
										id="${row.id}" 
										data-pid="${row.pid}"
										type="checkbox" 
										${param}> ${row.name}
								</label>`;
				}
				else
				{
					v.html += `<span 
									data-tree-node="${row.id}" 
									${this.param.checkbox ? '' : ' class="cp"'}>${row.name}
								</span>`;
				}
				if (child > 0)
				{
					if (disabled === true)
						row.disabled = disabled;
					create(level + 1, row.children, row.open, row.disabled);
				}
				v.html += `</li></ul>`;
			});
			if (level > 0) 
				v.html += '</div>';
		};
		create(0, this.param.data);
		this.dom.html(v.html);
	}

	/**
	 * 事件
	 */
	_event()
	{
		// 定义需要响应事件的DOM
		let dom = [
			// 展开收起
			'[data-open]',
			// 复选
			':checkbox',
			// 菜单
			'[data-tree-node]'
		];
		let that = this;
		that.dom.
		// 展开收起菜单
		on('click', dom[0], function(){
			let v = {
				this : $(this)
			};
			v.open  = v.this.data('open');
			v.child = v.this.next().next();
			if (v.open == 0)
			{
				v.this.
					data('open', 1).
					removeClass('rotate-0').
					addClass('rotate-90');
				v.child.slideDown(200);
				return;
			}
			v.this.
				data('open', 0).
				removeClass('rotate-90').
				addClass('rotate-0');
			v.child.slideUp(200);
		}).
		// 选中
		on('click', dom[1], function(){
			let v = {
				this : $(this)
			};
			let func = {
				// 向下选择
				checkChild : (id) => {
					let child = that.dom.find('input[data-pid="' + id + '"]:not(:disabled)');
					if (child.length == 0)
						return;
					Form.checkbox(child, v.check);
					child.each(function(){
						func.checkChild($(this).attr('id'));
					});
				},
				// 向上选择
				checkParent : (id) => {
					let parent = that.dom.find('#' + id);
					if (parent.length == 0)
						return;
					let b = that.dom.find('input[data-pid="' + id + '"]').length,
						b_checked = that.dom.find('input[data-pid="' + id + '"]:not(.checkbox-half):checked').length;
					if (b == b_checked)
					{
						Form.checkbox(parent, true);
					}
					else if (b_checked == 0)
					{
						let b_half = that.dom.find('.checkbox-half[data-pid="' + id + '"]:checked').length;
						b_half > 0 ? 
							Form.checkbox(parent, true, true) : 
							Form.checkbox(parent, false);
					}
					else
					{
						Form.checkbox(parent, true, true);
					}
					parent.each(function(){
						func.checkParent($(this).data('pid'));
					});
				}
			};
			v.check = v.this.is(':checked');
			v.pid   = v.this.data('pid');
			v.id 	= v.this.attr('id');
			// 向下选择
			func.checkChild(v.id);
			// 向上选择
			func.checkParent(v.pid);
			if (that.param.oncheck == null)
				return;
			v.checked = that.dom.find(':checked');
			let tmp = [];
			v.checked.each(function(){
				tmp.push(parseInt($(this).attr('id')));
			});
			// 取值
			let node = that.data.filter(item => tmp.indexOf(item.id) != -1);
			if (that.param.oncheck == null)
				return;
			that.param.oncheck(node);
		});
		if (that.param.checkbox || 
			that.param.onclick == null)
			return;
		that.dom.on('click', dom[2], function(){
			let node = $(this).data('tree-node');
			let data = that.data.filter(item => item.id === node);
			// 取值
			that.param.onclick(data[0]);
		});
	}
	
}