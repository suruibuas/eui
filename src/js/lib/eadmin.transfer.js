/**
 * eadmin 穿梭框组件
 */

class Transfer{

	constructor(dom, param){
		// 原始DOM名称
		this.dom = dom;
		// DOM缓存
		this.domCache = scope(this.dom);
		if (this.domCache.length == 0)
		{
			console.log('没有找到' + this.dom + '穿梭框容器，创建失败');
			return;
		}
		// 判断参数
		if (param == undefined || 
			param.data == undefined)
		{
			console.log('穿梭框' + this.dom + '没有指定数据源：data，创建失败');
			return;
		}
		// 默认参数
		let _param   = {
			// 数据源
			data   : {},
			// 支持搜索
			search : false,
			// 自定义宽度
			width  : 0,
			// 自定义高度
			height : 0,
			// 用来取值的表单的name值
			bind   : 'transfer'
		}
		// 数据源
		if (_.isString(param.data))
		{
			if ( ! _.startsWith(param.data, 'http'))
				param.data = module.conf.http.baseURL + param.data;
			$.ajax({
				url      : param.data,
				type     : 'get',
				async    : false,
				dataType : 'json',
				success  : (data) => {
					// 没有执行码
					if (data[module.conf.http.code_field] == undefined)
					{
						console.log('接口返回结果中没有找到定义的code码字段');
						return;
					}
					// 没有数据体
					if (data[module.conf.http.data_field] == undefined)
					{
						console.log('接口返回结果中没有找到定义的数据体字段');
						return;
					}
					param.data = data[module.conf.http.data_field];
				}
			});
		}
		if (param.data.length == 0)
		{
			console.log('穿梭框' + this.dom + '数据源为空，创建失败');
			return;
		}
		// 配置参数
		this.param = $.extend(_param, param);
		this.domCache.addClass('transfer-box');
		// 运行
		this.run();
	}

	/**
	 * 运行
	 */
	run(){
		this._create();
		this._event();
	}

	/**
	 * 创建结构
	 */
	_create(){
		// 私有变量
		let v = {
			// 左侧数据
			from   : [],
			// 右侧数据
			to     : [],
			// 主体默认高度
			height : 226,
			// 自定义样式
			style  : ' style="',
			// 搜索HTML代码
			search : '',
			// 完整HTML
			html   : ''
		};
		// 组装数据
		for (let i in this.param.data)
		{
			let data = this.param.data[i];
			if (data.checked == undefined || 
				! data.checked)
			{
				v.from.push(data);
			}
			else
			{
				v.to.push(data);
			}
		}
		// 自定义宽度
		if (this.param.width > 0)
		{
			v.style += 'width:' + this.param.width + 'px;';
		}
		// 自定义高度
		if (this.param.height > 0)
		{
			v.style += 'height:' + this.param.height + 'px;';
			v.height = this.param.height - 40;
		}
		v.style += `"`;
		// 搜索
		if (this.param.search)
		{
			v.search  = ' transfer-body-search';
			v.height -= 32;
		}
		v.html = `<div class="transfer-box-list"${v.style}>
					<div class="transfer-header">
						<label>
							<input type="checkbox" data-num="0"> 源列表
						</label>
						<span class="count">
							<em>0</em> / <em>${v.from.length}</em>
						</span>
					</div>
					<div class="iscroll transfer-body${v.search}" style="height:${v.height}px;"><ul>`;
		for (let i in v.from)
		{
			let d = (v.from[i].disabled == true) ? ' class="disabled"' : '';
			v.html += `<li${d}>
							<label>
								<input data-num="0" value="${v.from[i].val}" type="checkbox" ${d}> ${v.from[i].txt}
							</label>
						</li>`;
		}
		v.html += `</ul></div>`;
		if (this.param.search)
		{
			v.html += `<div class="transfer-search">
							<label>
								<input data-num="0" class="search-input" type="text" placeholder="请输入搜索内容" data-icon="ri-search-line|right">
							</label>
						</div>`;
		}
		v.html += `</div><div class="transfer-button">
						<button disabled class="hl" data-num="0">
							<i class="ri-arrow-left-s-line"></i>
						</button>
						<button disabled class="hl" data-num="1">
							<i class="ri-arrow-right-s-line"></i>
						</button>
					</div>`;
		v.html += `<div class="transfer-box-list"${v.style}>
					<div class="transfer-header">
						<label>
							<input type="checkbox" data-num="1"> 目标列表
						</label>
						<span class="count"><em>0</em> / <em>${v.to.length}</em></span>
					</div>
					<div class="iscroll transfer-body${v.search}" style="height:${v.height}px;"><ul>`;
		v.default = [];
		for (let i in v.to)
		{
			let d = (v.to[i].disabled == true) ? 'disabled' : '';
			v.html += `<li class="${d}">
							<label>
								<input data-num="1" value="${v.to[i].val}" type="checkbox" ${d}> ${v.to[i].txt}
							</label>
						</li>`;
			v.default.push(v.to[i].val);
		}
		v.html += `</ul></div>`;
		if (this.param.search)
		{
			v.html += `<div class="transfer-search">
							<label>
								<input data-num="1" class="search-input" type="text" placeholder="请输入搜索内容" data-icon="ri-search-line|right">
							</label>
						</div>`;
		}
		v.html += `</div><input type="hidden" name="${this.param.bind}" value="${_.join(v.default, ',')}">`;
		this.domCache.html(v.html);
	}

	/**
	 * 事件监听
	 */
	_event(){
		let dom = [
			// 全选反选
			'.transfer-header :checkbox',
			// 单选
			'.transfer-body :checkbox',
			// 左右移动
			'.transfer-button button'
		];
		let that = this;
		// 变量
		let [body, header, button] = [
			this.domCache.find('.transfer-body'),
			this.domCache.find('.transfer-header'),
			this.domCache.find('.transfer-button')
		];
		this.domCache.
		// 全选反选
		on('click', dom[0], function(){
			let _this = $(this);
			let v = {
				eq : +_this.data('num')
			};
			// 互斥EQ，用来取另一个
			v.neq = v.eq == 1 ? 0 : 1;
			v.checkbox = body.eq(v.eq).find(':checkbox').not(':disabled');
			if (_this.is(':checked'))
			{
				Form.checkbox(v.checkbox, 1);
				// 总数
				header.eq(v.eq).find('em:first').html(v.checkbox.length);
				// 右移按钮
				button.children('button').eq(v.neq).prop('disabled', false);
			}
			else
			{
				Form.checkbox(v.checkbox, 0);
				// 总数
				header.eq(v.eq).find('em:first').html(0);
				// 右移按钮
				button.children('button').eq(v.neq).prop('disabled', true);
			}
		}).
		// 单选
		on('click', dom[1], function(){
			let _this = $(this);
			let v = {
				eq : +_this.data('num')
			};
			v.neq = v.eq == 1 ? 0 : 1;
			v.all      = body.eq(v.eq).find(':checkbox').length;
			v.checked  = body.eq(v.eq).find(':checked').length;
			v.checkall = header.eq(v.eq).find(':checkbox');
			// 总数
			header.eq(v.eq).find('em:first').html(v.checked);
			// 全选按钮
			Form.checkbox(v.checkall, v.checked == v.all ? 1 : 0);
			// 移动按钮
			v.disabled = v.checked > 0 ? false : true;
			button.children('button').eq(v.neq).prop('disabled', v.disabled);
		}).
		// 左右移动
		on('click', dom[2], function(){
			let _this = $(this);
			let v = {
				eq : +_this.data('num')
			};
			v.neq = v.eq == 1 ? 0 : 1;
			_this.prop('disabled', true);
			v.checked = body.eq(v.neq).find(':checkbox:checked').parent().parent();
			// 选中选项的克隆对象
			v.clone    = v.checked.clone();
			v.checkbox = v.clone.find(':checkbox');
			// 复位克隆对象复选框
			v.checkbox.data('num', v.eq);
			Form.checkbox(v.checkbox, 0);
			// 移动
			body.eq(v.eq).children('ul').prepend(v.clone);
			// 删除原始
			v.checked.remove();
			// 总数复位
			header.eq(v.neq).find('em:first').html(0);
			header.eq(v.neq).find('em:last').html(body.eq(v.neq).find(':checkbox').length);
			header.eq(v.eq).find('em:last').html(body.eq(v.eq).find(':checkbox').length);
			// 全选按钮复位
			v.checkbox = header.eq(v.neq).find(':checkbox');
			Form.checkbox(v.checkbox, 0);
			// 赋值
			v.val = [];
			body.eq(1).
				find(':checkbox').
				each(function(){
					v.val.push($(this).val());
				});
			that.domCache.
				children("input[type='hidden']").
				val(_.join(v.val, ','));
			// 复位搜索结果
			if(that.param.search)
			{
				that.domCache.find('.search-input').eq(v.neq).val('');
				body.eq(v.neq).find('li').show();
			}
		});
		if ( ! that.param.search) 
			return;
		// 搜索
		keyup(that.domCache.find('.search-input'), (_this) => {
			let v = {
				eq   : +_this.data('num'),
				val  : _this.val(),
				body : that.domCache.find('.transfer-body')
			};
			if (v.val == '')
			{
				v.body.eq(v.eq).find('li').show();
				return;
			}
			v.body.eq(v.eq).
				find('li').
				each(function(){
					let _this = $(this);
					if(_this.text().indexOf(v.val) == -1)
					{
						_this.hide();
						return;
					}
					_this.show();
				});
		});
	}

}