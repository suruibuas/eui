/**
 * eadmin 颜色选择器组件
 */

class Colorpicker{

	constructor(dom, param){
		this.domCache = scope(dom);
		if (this.domCache.length == 0)
		{
			console.log('没有找到' + dom + '元素，颜色选择器创建失败');
			return;
		}
		let _param = {
			color : [
				'#5EBA00', '#7BD235', '#F1C40F', '#FE9644', '#CD2020',
				'#F66D9B', '#A55EEA', '#6573CD', '#45AAF2'
			],
			change  : null,
			bind    : null,
			default : ''
		};
		this.param = $.extend(_param, param);
		this.domCache.addClass('colorpicker');
		this.run();
	}

	run(){
		this._create();
		this._event();
	}

	_create(){
		if (this.param.color.length == 0) return;
		let v = {
			html : ''
		};
		for (let i in this.param.color)
		{
			let style = '';
			if (this.param.color[i] == this.param.default)
				style = 'style="display:inline-block;"';
			v.html += `<div data-color="${this.param.color[i]}">
				<div class="color" style="background:${this.param.color[i]}">
				</div>
				<i class="ri-check-line"${style}></i>
			</div>`;
		}
		if (this.param.bind != null)
			v.html += `<input 
							type="hidden" 
							value="${this.param.default}" 
							name="${this.param.bind}" 
							id="colorpicker-input-${this.param.bind}"
						>`;
		this.domCache.html(v.html);
	}

	_event(){
		let that = this;
		this.domCache.
		// 选择颜色
		on('click', '>div:not(.active)', function(){
			let v = {
				this : $(this)
			};
			that.domCache.
				find('i').
				hide();
			that.domCache.
				children('input').
				val(v.this.data('color'));
			addClassExc(v.this, 'active');
			v.this.
				children('i').
				show();
			v.color = v.this.data('color');
			// 是否需要绑定隐藏域
			if (that.param.bind != null)
			{
				$('#colorpicker-input-' + that.param.bind).val(v.color);
			}
			if (that.param.change != null && 
				_.isFunction(that.param.change))
				that.param.change(v.color);
		});
	}

}