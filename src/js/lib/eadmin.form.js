/**
 * eadmin 表单组件
 */

class Form{

	/**
	 * 表单初始化
	 * v2.0.1
	 */
	static init(dom = null){
		// 定义需要处理的容器，默认处理BOX内的所有表单
		// 设置这个值是因为有时候只需要针对某一容器内部的表单进行处理，比如window中load的页面
		// 只需要针对处理即可，减少开销
		let form  = dom || box;
		let input = form.find('input[type="text"]');
		// 是否需要去掉自动完成
		if (module.conf.close_autocomplete)
			input.attr('autocomplete', 'off');
		// 文本框
		input.each(function(){
			let _this = $(this);
			let v = {
				// 带图标的input默认样式名
				class    : 'icon-input',
				// 是否是加减框
				numinput : _this.hasClass('num-input')
			};
			// 是否需要图标，数字加减不支持图标
			v.icon = _this.data('icon');
			if (v.icon != undefined && ! v.numinput)
			{
				// 判断是否是右侧图标
				if (v.icon.indexOf('|') != -1)
				{
					v.arr   = v.icon.split('|');
					v.icon  = v.arr[0];
					v.class = v.arr[1] == 'right' ? v.class + '-right' : v.class;
				}
				if( ! _this.parent().is('label'))
				{
					_this.before(`<label class="${v.class}"></label>`);
					v.label = _this.prev('label');
					$(`<i class="${v.icon}"></i>`).appendTo(v.label);
					_this.appendTo(v.label);
				}
				else
				{
					_this.before(`<i class="${v.icon}"></i>`);
					_this.
						parent().
						addClass(v.class);	
				}
			}
			// 前方有固定文本
			v.prepend = _this.data('prepend');
			if (v.prepend != undefined)
			{
				let html = `<div class="input-group">
								<span class="prepend">${v.prepend}</span>
							</div>`;
				_this.before(html);
				_this.appendTo(_this.prev('.input-group'));
			}
			// 后方有固定文本
			v.append = _this.data('append');
			if (v.append != undefined)
			{
				if( ! _this.parent().is('.input-group'))
				{
					let html = `<div class="input-group"></div>`;
					_this.before(html);
					_this.appendTo(_this.prev('.input-group'));
				}
				$(`<span class="append">${v.append}</span>`).appendTo(_this.parent());
			}
			// 带数字加减功能的文本框
			if (v.numinput)
			{
				if (_this.val() == '')
				{
					_this.val(0);
					v.val = 0;
				}
				else
				{
					v.val = _this.val();
				}
				// 最小值
				v.min  = _this.data('min') || 0,
				// 最大值
				v.max  = _this.data('max') || 0,
				// 加
				v.add  = (v.max > 0 && v.val >= v.max) ? 'disabled' : '',
				// 减
				v.cut  = (v.val <= v.min) ? 'disabled' : '',
				v.html = `<span class="num-add-cut">
							<i class="ri-arrow-up-s-line add ${v.add}"></i>
							<i class="ri-arrow-down-s-line cut ${v.cut}"></i>
						</span>`;
				_this.before(`<div class="input-group"></div>`);
				v.group = _this.prev('.input-group');
				_this.appendTo(v.group);
				$(v.html).appendTo(v.group);
				if (v.val < v.min) _this.val(v.min);
				if (v.max > 0 && v.val > v.max) _this.val(v.max);
			}
			// 日期选择框处理
			v.date = _this.data('default-date');
			if (v.date != undefined && 
				_this.next('input').length == 0)
			{
				let name = _this.attr('name');
				if (name != undefined)
				{
					_this.removeAttr('name').
						after(`<input type="hidden" name="${name}" value="${v.date}">`);
				}
				else
				{
					console.log('没有为日期文本框指定name属性，这将影响后端取值');
				}
			}
		});
		// 文本域
		form.find('textarea[maxlength]').each(function(){
			let _this = $(this);
			// 字数限制
			let [max, len] = [
				_this.attr('maxlength'),
				_this.text().length
			];
			let html = `<span class="font-num">${len} / ${max}</span>`;
			_this.addClass('no-resize textarea-max').after(html);
		});
		// 下拉菜单
		let select = form.find("select:not([class^='ql-'])");
		if (select.length > 0)
		{
			select.each(function(){
				let _this = $(this);
				let v = {
					li 		 : '',
					default  : '',
					multiple : _this.data('multiple'),
					disabled : '',
					class    : '',
					index    : _this.find(':selected').index(),
					selected : null,
					txtArr   : []
				};
				// 可多选
				if (v.multiple != undefined)
				{
					v.name = _this.attr('name');
					if (v.name == undefined)
						console.log('下拉菜单上没有指定name,后端无法取值');
					v.default = _this.data('selected') || '';
					v.default = v.default.toString();
					_this.removeAttr('name').
						before(`<input type="hidden" name="${v.name}" value="${v.default}">`);
					v.default = v.default.split(',');
				}
				if (_this.is(':disabled'))
					v.disabled = ' select-disabled';
				v.class = v.index == 0 || v.disabled != '' ? '' : 'selected';
				// 判断是否有绑定的子菜单
				v.bind  = _this.data('bind');
				if (v.bind != undefined)
				{
					v.child = form.find('#' + v.bind);
					if (v.child.length == 0)
					{
						console.log('没有找到绑定的ID为' + v.bind + '的子菜单');
					}
					else if (v.class == '')
					{
						v.child.attr('disabled', true);
					}
				}
				// 定义真实宽度
				if (_this.data('width') != undefined)
				{
					v.width = _this.data('width');
					if ( ! _.endsWith(v.width, '%'))
						v.width += 'px';
				}
				else
				{
					v.width = _this.outerWidth() + 'px';
				}
				// 遍历下拉选项
				_this.children('option').
				each(function(index){
					let _this = $(this);
					let [val, txt, _class] = [
						_this.val(),
						_this.text(),
						''
					];
					if (index == 0) return true;
					if (_this.is(':disabled'))
					{
						_class = 'disabled';
					}
					else if (_this.is(':selected'))
					{
						v.selected = index;
						if (v.bind == undefined) _class = 'active';
					}
					// 多选下拉菜单
					if (v.multiple != undefined)
					{
						let checked = '';
						if (v.default != '' && 
							v.default.indexOf(val) != -1)
						{
							checked = ' checked';
							v.txtArr.push(txt);
						}
						txt = `<label>
									<input type="checkbox" value="${val}" ${checked} data-txt="${txt}"> ${txt}
								</label>`;
						_class += ' multiple';
					}
					v.li += `<li class="${_class}" data-val="${val}">${txt}</li>`;
				});
				if (v.multiple == undefined)
				{
					v.txt = _this.find(':selected').text();
				}
				else
				{
					if (v.txtArr.length == 0)
						v.txt = '请选择';
					else
						v.txt = _.join(v.txtArr, '、');
				}
				v.html = `<div style="width:${v.width};" class="select${v.disabled}" data-open="0">
								<span class="${v.class}">${v.txt}</span>
								<i class="ri-arrow-down-s-line rotate-0"></i>
								<i class="ri-close-circle-fill select-clear"></i>
							</div>
							<div style="width:${v.width};" class="select-option animated faster${v.multiple != undefined ? ' select-multiple' : ''}">
								<ul class="iscroll">${v.li}</ul></div>`;
				_this.after(v.html);
				if (v.class != '' && 
					v.bind != undefined)
				{
					_this.next().
						next().
						find('li').
						eq(v.selected - 1).
						trigger('click');
				}
				Mount.observer.observe(_this[0], {
					attributeFilter : ['disabled']
				});
			});
		}
		// 单选框
		let radio = form.find(':radio');
		if (radio.length > 0)
		{
			radio.each(function(){
				let _this = $(this);
				let v = {
					class : 'radio',
					model : _this.data('model'),
					icon  : [
						'ri-radio-button-line',
						'ri-checkbox-blank-circle-line'
					]
				}
				if (v.model == 'switch')
				{
					_this.prop('checked', true);
					v.checked = '';
					if (_this.val() == 1)
						v.checked = ' switch-open';
					v.disabled = _this.is(':disabled') ? ' switch-disabled' : '';
					v.html = `<div class="checkbox-switch${v.checked}${v.disabled}">
								<span></span>
							</div>`;
					_this.parent().append(v.html);
				}
				else
				{
					v.class += _this.is(':disabled') ? '-disabled' : '';
					v.class += _this.is(':checked') ? '-checked' : '';
					if (v.model == 'tag')
					{
						v.class += '-tag';
					}
					else
					{
						_this.before(`<i class="${_this.is(':checked') ? v.icon[0] : v.icon[1]}"></i>`);
					}
					_this.parent().addClass(v.class);
				}
				Mount.observer.observe(_this[0], {
					attributeFilter : ['disabled']
				});
			});
		}
		// 复选框
		let checkbox = form.find(':checkbox');
		if (checkbox.length > 0)
		{
			checkbox.each(function(){
				let _this = $(this);
				let v = {
					class : 'checkbox'
				}
				v.class += _this.is(':disabled') ? '-disabled' : '';
				v.class += _this.is(':checked') ? '-checked' : '';
				_this.parent().addClass(v.class);
				v.icon = _this.is(':checked') ? 'ri-checkbox-line' : 'ri-checkbox-blank-line';
				if (_this.hasClass('checkbox-half'))
					v.icon = 'ri-checkbox-indeterminate-line';
				v.html = `<i class="${v.icon}"></i>`;
				_this.before(v.html);
				Mount.observer.observe(_this[0], {
					attributeFilter : ['disabled']
				});
			});
		}
	}

	/**
	 * 交互事件
	 * v2.0.1
	 */
	static event(){
		// 定义需要响应事件的DOM
		let dom = [
			// 下拉菜单
			'.select:not(.select-disabled)',
			// 下拉菜单选项
			'.select-option',
			// 下拉菜单选项
			'.select-option li:not(.disabled):not(.active):not(.multiple)',
			// 数字加减
			'.add, .cut',
			// 单选
			':radio',
			// 复选
			':checkbox',
			// 开关
			'.checkbox-switch:not(.switch-disabled)',
			// 多选下拉
			'.select-multiple',
			// 多选下拉复选框
			'.select-multiple :checkbox',
			// 清空下拉菜单
			'.select-clear',
			// 数字加减
			'.num-input'
		];
		// 下拉菜单
		body.
		on('click', dom[0], function(){
			let _this = $(this);
			let v = {
				// 位置
				p : _this.position(),
				// 选项
				o : _this.next('.select-option')
			};
			// 选项容器的真实高度
			v.oHeight = v.o.outerHeight() + 10;
			// 自动定位
			v.o.css('left', v.p.left);
			if (distance(_this, 'bottom') < v.oHeight)
				v.o.css('top', v.p.top - v.oHeight);
			v.open = _this.data('open') == 1 ? 0 : 1;
			_this.data('open', v.open);
			// 下拉图标对象缓存
			v.i = _this.children('i:first');
			// 判断是展开还是关闭
			if (v.open == 0)
			{
				// 下拉按钮处理
				v.i.removeClass('rotate-180').addClass('rotate-0');
				// 选项处理
				fadeOut(v.o);
				return;
			}
			// 箭头旋转
			v.i.removeClass('rotate-0').addClass('rotate-180');
			// 选项处理
			fadeIn(v.o);
			v.o.attr('tabindex', 0).trigger('focus');
		}).
		on('mouseenter', dom[0], function(){
			let _this = $(this);
			let v = {
				index : _this.prev().find(':selected').index()
			};
			_this.next('.select-option').data('active', 1);
			if (v.index == 0) return;
			_this.
				find('.select-clear').
				show().
				prev().
				hide();
		}).
		on('mouseleave', dom[0], function(){
			let _this = $(this);
			let v = {
				index : _this.prev().find(':selected').index()
			};
			_this.next('.select-option').data('active', 0);
			if (v.index == 0) return;
			_this.
				find('.select-clear').
				hide().
				prev().
				show();
		}).
		on('mouseover', dom[7], function(){
			$(this).data('active', 1);
		}).
		on('mouseout', dom[7], function(){
			$(this).data('active', 0);
		}).
		on('blur', dom[1], function(){
			let _this = $(this);
			if (_this.data('active') == 1) return;
			// 下拉按钮处理
			_this.
				prev().
				data('open', 0).
				children('i').
				removeClass('rotate-180').
				addClass('rotate-0');
			// 选项处理
			fadeOut(_this);
		}).
		// 下拉菜单选项点击
		on('click', dom[2], function(){
			let _this = $(this);
			let v = {
				val    : _this.data('val'),
				txt    : _this.html(),
				select : _this.parent().parent().prev().prev() 
			};
			v.first = v.select.find('option:first');
			v.select.
				val(v.val).
				next().
				children('span').
				addClass('selected').
				html(v.txt);
			// 样式设置
			_this.
				addClass('active').
				siblings('.active').
				removeClass('active');
			// 关闭
			_this.
				parent().
				parent().
				trigger('blur');
			v.select.trigger('change');
			// 判断是否有绑定的子菜单
			v.bind = v.select.data('bind');
			if (v.bind == undefined) return false;
			// 联动菜单
			v.api = v.select.data('api');
			if (v.api == undefined || 
				v.api == '')
			{
				console.log('没有设置子菜单数据调用的API地址');
				return;
			}
			v.child = $('#' + v.bind);
			v.child.
				next('.select').
				children('span').
				html('<i class="ri-loader-4-line rotate"></i>');
			Eadmin.get({
				url  : v.api += v.val,
				then : (data) => {
					let [option, li, selected, txt] = [
						`<option value="${v.first.val()}">${v.first.text()}</option>`,
						'',
						v.child.data('selected'),
						v.first.text()
					];
					_.each(data, (val, key) => {
						let [s, c] = ['', ''];
						if (key == selected)
						{
							s   = ' selected';
							c   = ' class="active"';
							txt = val; 
						}
						option += `<option value="${key}"${s}>${val}</option>`;
						li += `<li data-val="${key}"${c}>${val}</li>`;
					});
					v.child.html(option);
					v.child.
						attr('disabled', false).
						next('.select').
						removeClass('select-disabled').
						children('span').
						html(txt);
					v.child.
						next().
						next().
						children('ul').
						html(li);
				}
			});
		}).
		// 清空下拉
		on('click', dom[9], function(){
			let _this = $(this);
			let v = {
				span : _this.prev().prev()
			};
			v.select = v.span.parent();
			v.real   = v.select.prev();
			v.option = v.select.next();
			v.first  = v.real.find('option:first');
			v.span.html(v.first.text());
			v.real.val(v.first.val());
			v.option.find('.active').removeClass('active');
			_this.hide();
			if (v.select.data('open') == 1)
			{
				_this.
					prev().
					show().
					removeClass('rotate-180').
					addClass('rotate-0');
				v.select.data('open', 0);
				fadeOut(v.option);
			}
			else
			{
				_this.prev().show();
			}
			// 判断是否有绑定的子菜单
			v.bind = v.real.data('bind');
			if (v.bind == undefined) return false;
			v.child = $('#' + v.bind);
			v.first = v.child.find('option:first');
			v.child.attr('disabled', true).val(v.first.val());
			v.child.next().children('span').html(v.first.text());
			return false;
		}).
		// 多选下拉
		on('click', dom[8], function(){
			let _this = $(this);
			let v = {
				txt : [],
				val : [],
				ul  : _this.parent().parent().parent()
			};
			v.ul.find(':checked').each(function(){
				let _this = $(this);
				v.txt.push(_this.data('txt'));
				v.val.push(_this.val());
			});
			v.txt = _.join(v.txt, '、');
			v.val = _.join(v.val, ',');
			v.select = v.ul.parent().prev();
			if (v.txt == '')
				v.txt = v.select.prev().children('option:first').text();
			v.select.
				children('span').
				html(v.txt);
			v.select.
				prev().
				prev().
				val(v.val);
		}).
		// 数字加减框
		on('click', dom[3], function(){
			let _this = $(this);
			if (_this.hasClass('disabled'))
				return;
			let v = {
				input : _this.parent().prev()
			};
			if (v.input.is(':disabled'))
				return;
			v.min  = v.input.data('min') || 0,
			v.max  = v.input.data('max') || 0,
			v.step = v.input.data('step') || 1,
			v.val  = +v.input.val();
			if (_this.hasClass('add'))
			{
				v.val += +v.step;
				if (v.max > 0 && v.val == v.max)
					_this.addClass('disabled');
				v.input.val(v.val);
				_this.next().removeClass('disabled');
				return;
			}
			v.val -= +v.step;
			if (v.val <= v.min)
				_this.addClass('disabled');
			v.input.val(v.val);
			_this.prev().removeClass('disabled');
		}).
		on('mousedown', dom[3], (e) => {
			e.preventDefault();
		}).
		on('blur', dom[10], function(){
			let _this = $(this);
			let v = {
				val : _this.val(),
				min : _this.data('min'),
				max : _this.data('max'),
				btn : _this.next().children('i')
			};
			if (v.min != undefined && v.val < v.min)
			{
				_this.val(v.min);
				v.btn.eq(0).removeClass('disabled');
				v.btn.eq(1).addClass('disabled');
				return;
			}
			if (v.max != undefined && v.val > v.max)
			{
				_this.val(v.max);
				v.btn.eq(0).addClass('disabled');
				v.btn.eq(1).removeClass('disabled');
			}
		}).
		// 单选按钮
		on('click', dom[4], function(){
			let [_this, v] = [$(this), {}];
			v.radio = _this.parent();
			v.icon  = [
				'ri-radio-button-line',
				'ri-checkbox-blank-circle-line'
			];
			if(_this.data('model') === 'switch' || 
				v.radio.hasClass('radio-checked') || 
				v.radio.hasClass('radio-checked-tag'))
				return;
			if (_this.data('model') == 'tag')
			{
				v.radio.
					attr('class', 'radio-checked-tag').
					siblings('.radio-checked-tag').
					attr('class', 'radio-tag');
				return;
			}
			v.radio.
				removeClass('radio').
				addClass('radio-checked').
				children('i').
				attr('class', v.icon[0]);
			v.radio.
				siblings('.radio-checked').
				addClass('radio').
				removeClass('radio-checked').
				children('i').
				attr('class', v.icon[1]);
		}).
		// 复选按钮
		on('click', dom[5], function(){
			let _this  = $(this);
			let v = {
				checkbox : _this.parent()
			};
			if(_this.is(':checked'))
			{
				v.checkbox.
					attr('class', 'checkbox-checked').
					children('i').
					attr('class', 'ri-checkbox-line');
			}
			else
			{
				_this.removeClass('checkbox-half');
				v.checkbox.
					attr('class', 'checkbox').
					children('i').
					attr('class', 'ri-checkbox-blank-line');
			}
		}).
		// 开关
		on('click', dom[6], function(){
			let _this  = $(this);
			let v = {
				radio : _this.prev(':radio')
			}
			if(v.radio.val() == 1)
			{
				_this.removeClass('switch-open');
				v.radio.val(0);
			}
			else
			{
				_this.addClass('switch-open');
				v.radio.val(1);
			}
		}).
		// 表单提交
		on('submit', 'form', function(){
			let _this = $(this);
			let v = {
				action : _this.attr('action') || Eadmin.currentHref
			};
			// 验证提交表单
			Validate.submit(_this);
			if(_this.find('span.error').length > 0)
				return false;
			// 提交按钮处理
			v.submit = _this.find('[data-submit]');
			if (v.submit.length > 0 && 
				v.submit.data('loading') != undefined)
				Eadmin.button.loading(v.submit);
			if (_this.data('native') != undefined)
				return true;
			// 提交数据
			v.formData = _this.serialize();
			v.callback = _this.data('callback');
			// 表单提交回调函数抽离
			let callback = (data) => {
				// 回调
				if (v.callback == undefined) return;
				try
				{
					Method != undefined;
					if ( ! _.isFunction(Method[v.callback]))
					{
						console.log('指定的' + v.callback + '不是一个可被调用的函数');
						return;
					}
					Method[v.callback](data);
				}
				catch(e){console.log(e);}
			}
			Eadmin.post({
				url  : v.action,
				form : v.formData,
				then : (data) => {
					// 清除编辑器的本地缓存
					let editor = _this.find('.editor');
					if (editor.length > 0)
					{
						let storeKey = editor.data('store');
						if (storeKey != undefined)
							store.remove(storeKey);
					}
					Eadmin.button.reset(v.submit);
					callback(data);
				},
				error : (data) => {
					Eadmin.button.reset(v.submit);
					callback(data);
				}
			});
			return false;
		}).
		on('keyup', '.textarea-max', function(){
			let _this = $(this);
			let max = _this.attr('maxlength'),
				len = _this.val().length;
			if (len > max) return;
			_this.
				next().
				html(len + ' / ' + max);
		});
	}

	/**
	 * 复选框手动设置状态，用在表格全选，穿梭框等
	 * v2.0.1
	 * @param {*} dom 
	 * @param {*} action 
	 */
	static checkbox(dom, action, half = false) {
		let param = {};
		if (action == 1)
		{
			param = {
				checked : true,
				i_class : 'ri-checkbox-line',
				class   : 'checkbox-checked'
			};
			if (half)
			{
				param.i_class = 'ri-checkbox-indeterminate-line';
				dom.addClass('checkbox-half');
			}
			else
			{
				dom.removeClass('checkbox-half');
			}
		}
		else
		{
			param = {
				checked : false,
				i_class : 'ri-checkbox-blank-line',
				class   : 'checkbox'
			};
			dom.removeClass('checkbox-half');
		}
		dom.
			prop('checked', param.checked).
			prev('i').
			attr('class', param.i_class).
			parent('label').
			attr('class', param.class);
	}

	/**
	 * 下拉菜单手工设置状态，用在表格搜索项重置
	 * v2.0.1
	 * @param {*} dom 
	 */
	static select(dom)
	{
		let select = dom.find('select');
		if (select.length == 0)
			return;
		select.
		each(function(){
			let _this = $(this);
			let v = {
				txt : _this.children('option:first').text(),
				default : _this.find('option:first').val()
			};
			_this.
				val(v.default).
				next().
				children('span').
				removeClass('selected').
				html(v.txt);
			_this.
				next().
				next().
				find('.active').
				removeClass('active');
		});
	}

	/**
	 * 设置文本框的状态
	 * v2.0.1
	 * @param {*} dom 
	 * @param {*} init 
	 */
	static input(dom, success = false){
		if (success)
		{
			dom.removeClass('error-input');
			return;
		}
		dom.addClass('error-input');
	}

	/**
	 * 设置文本域的状态
	 * v2.0.1
	 * @param {*} dom 
	 * @param {*} init 
	 */
	static textarea(dom, success = false){
		if (success)
		{
			dom.removeClass('error-input');
			return;
		}
		dom.addClass('error-input');
	}

}