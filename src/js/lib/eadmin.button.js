/**
 * eadmin 按钮组件
 */

class Button{	

	/**
	 * 按钮
	 */
	static run(dom){
		let [delay, icon] = [
			dom.find('button[data-delay]'),
			dom.find('button[data-icon]:not([data-delay])')
		];
		// 延迟按钮处理
		delay.each(function(){
			let _this = $(this);
			// 私有变量组
			let v = {
				html  : _this.html(),
				delay : _this.data('delay')
			};
			// 按钮状态与赋值
			_this.attr('disabled', true).html(`倒计时（${v.delay}）秒后可操作`);
			v.time = setInterval(() => {
				v.delay--;
				_this.html(`倒计时（${v.delay}）秒后可操作`);
				if (v.delay == 0)
				{
					clearInterval(v.time);
					if ( ! _.isUndefined(_this.data('icon')))
						v.html = `<i class="${_this.data('icon')}"></i>` + v.html;
					_this.attr('disabled', false).html(v.html);
				}
			}, 1000);
		});
		// 图标按钮处理
		icon.each(function(){
			let _this = $(this);
			let style = '';
			if (_this.is(':empty'))
				style += ' style="margin-right:0;"';
			_this.prepend(`<i${style} class="${_this.data('icon')}"></i>`);
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
			let _this = $(this);
			let _do   = _this.data('do');
			// 如果是提交表单的按钮则不进行后续处理
			if (_this.data('submit') != undefined)
				return;
			that.loading(_this);
			if (_do == undefined) return;
			try{
				Method != undefined;
				if ( ! _.isFunction(Method[_do]))
				{
					console.log('指定的' + _do + '不是一个可被调用的函数');
					return;
				}
				Method[_do](_this);
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
		btn.attr('disabled', false).html(btn.data('source'));
	}

	/**
	 * 加载中
	 */
	static loading(btn){
		let v = {
			this : btn,
			icon : `<i class="ri-loader-4-line rotate"></i>`
		};
		v.this.
			attr('disabled', true).
			data('source', v.this.html()).
			html(v.icon + v.this.data('loading'));
	}
	
}