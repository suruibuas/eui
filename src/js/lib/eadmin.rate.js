/**
 * eadmin 评分组件
 */

class Rate{

	constructor(dom, param){
		this.domCache = $(dom);
		if (this.domCache.length == 0)
		{
			console.log('没有找到' + dom + '，创建评分失败');
			return;
		}
		this.domCache.addClass('rate');
		this.dom = dom;
		// 默认参数
		let _param   = {
			// 默认分数
			default  : 0,
			// 禁用
			disabled : false,
			// 总分数
			num 	 : 5,
			// 回调
			change   : null
		}
		// 配置参数
		this.param = $.extend(_param, param);
		if (this.param.default > 0)
			this.domCache.data('level', this.param.default);
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
	 * 创建
	 */
	_create(){
		let html = '';
		for (let i = 1; i <= this.param.num; i++)
		{
			let full = (this.param.default >= i) ? ' full' : '';
			html += `<div class="animated faster star fa fa-star
						${this.param.disabled ? ' disabled' : ''}
						${full}" 
						data-level="${i}">
					</div>`;
		}
		this.domCache.html(html);
	}

	/**
	 * 事件
	 */
	_event(){
		let v = {
			prev  : 0,
			level : 0
		};
		let that = this;
		this.domCache.
		// 移入
		on('mouseover', '.star', function(){
			let _var = {
				this : $(this)
			};
			_var.parent = _var.this.parent();
			v.level  = _var.this.data('level');
			if (v.level == 1)
			{
				_var.this.addClass('full');	
			}
			else
			{
				_var.parent.
					children('.star:lt(' + v.level + ')').
					addClass('full');
			}
			// 向左移动
			if (v.level - v.prev < 0)
			{
				_var.parent.
					children('.star:gt(' + (v.level - 1) + ')').
					removeClass('full');
			}
		}).
		// 移出
		on('mouseout', '.star', function(){
			v.prev = v.level;
		}).
		// 选中
		on('click', '.star:not(.disabled)', function(){
			let _var = {
				this : $(this)
			};
			_var.this.
				removeClass('pulse').
				addClass('pulse').
				one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
					_var.this.removeClass('pulse');
				});
			_var.this.
				parent().
				data('level', v.level);
			if (that.param.change != null && 
				_.isFunction(that.param.change))
				that.param.change(v.level);
		}).
		on('mouseleave', function(){
			v.this   = $(this);
			v.choose = v.this.data('level');
			if (v.choose == undefined)
			{
				v.this.
					children('.star').
					removeClass('full');
				return;
			}
			v.this.
				children('.star').
				removeClass('full');
			v.this.
				children('.star:lt(' + v.choose + ')').
				addClass('full');
		});
	}

}