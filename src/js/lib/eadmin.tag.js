/**
 * eadmin 按钮组件
 */

class Button{	

	/**
	 * 按钮
	 */
	static run(dom){
		let v = {
			// 延迟按钮
			delay : dom.find('button[data-delay]'),
			// 图标按钮
			icon  : dom.find('button[data-icon]')
		};
		// 延迟按钮处理
		v.delay.each(function(){
			// 私有变量组
			let _var = {
				this : $(this)
			};
			_var.html  = _var.this.html();
			_var.delay = _var.this.data('delay');
			// 按钮状态与赋值
			_var.this.
				attr('disabled', true).
				html(`倒计时（${_var.delay}）秒后可操作`);
			_var.time = setInterval(() => {
				_var.delay--;
				_var.this.html(`倒计时（${_var.delay}）秒后可操作`);
				if (_var.delay == 0)
				{
					clearInterval(_var.time);
					_var.this.
						attr('disabled', false).
						html(_var.html);
				}
			}, 1000);
		});
		// 图标按钮处理
		v.icon.each(function(){
			let _var = {
				this : $(this)
			};
			_var.class = 'fa';
			if ( ! _var.this.is(':empty'))
				_var.class += ' mr10';
			_var.html = `<i class="${_var.class} ${_var.this.data('icon')}"></i>`;
			_var.this.prepend(_var.html);
		});
	}

	/**
	 * 事件
	 */
	static event(){
		let that = this;
		// 加载按钮点击事件
		body.
		on('click', 'button[data-loading]', function(){
			let v = {
				this : $(this)
			};
			// 如果是提交表单的按钮则不进行后续处理
			if (v.this.data('submit') != undefined)
			{
				return;
			}
			that.loading(v.this);
			// 回调
			v.do = v.this.data('do');
			if (v.do == undefined)
			{
				return;
			}
			try{
				Method != undefined;
				if ( ! _.isFunction(Method[v.do]))
				{
					console.log('指定的' + v.do + '不是一个可被调用的函数');
					return;
				}
				Method[v.do](v.this);
			}
			catch(e){
				console.log(e);
			}
		});
	}

	/**
	 * 重置
	 */
	static reset(btn){
		btn.
			attr('disabled', false).
			html(btn.data('source'));
	}

	/**
	 * 加载中
	 */
	static loading(btn){
		let v = {
			this : btn,
			icon : `<i class="fa fa-spinner fa-pulse mr5"></i>`
		};
		v.this.
			attr('disabled', true).
			data('source', v.this.html()).
			html(v.icon + v.this.data('loading'));
	}
	
}