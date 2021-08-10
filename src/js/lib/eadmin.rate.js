/**
 * eadmin 评分组件
 */

class Rate{

	constructor(dom, param){
		this.dom = dom;
		this.domCache = scope(dom);
		if (this.domCache.length == 0)
		{
			console.log('没有找到' + dom + '，创建评分失败');
			return;
		}
		this.domCache.addClass('rate');
		// 默认参数
		let _param   = {
			// 默认分数
			default  : 0,
			// 禁用
			disabled : false,
			// 总分数
			num 	 : 5,
			// 回调
			change   : null,
			// 隐藏域
			bind     : null
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
			html += `<div class="animated faster star ri-star-line
						${this.param.disabled ? ' disabled' : ''}
						${full}" 
						data-level="${i}">
					</div>`;
		}
		this.domCache.html(html);
		if (this.param.bind != null)
			this.domCache.after(`<input name="${this.param.bind}" type="hidden" value="${this.param.default}">`);
	}

	/**
	 * 事件
	 */
	_event(){
		let [prev, level, that] = [0, 0, this];
		that.domCache.
		// 移入
		on('mouseover', '.star', function(){
			let _this = $(this);
			let v = {
				parent : _this.parent()
			};
			level = _this.data('level');
			if (level == 1)
			{
				_this.addClass('full');	
			}
			else
			{
				v.parent.children('.star:lt(' + level + ')').addClass('full');
			}
			// 向左移动
			if (level - prev < 0)
			{
				v.parent.children('.star:gt(' + (level - 1) + ')').removeClass('full');
			}
		}).
		// 移出
		on('mouseout', '.star', function(){
			prev = level;
		}).
		// 选中
		on('click', '.star:not(.disabled)', function(){
			let _this = $(this);
			_this.
				removeClass('pulse').
				addClass('pulse').
				one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
					_this.removeClass('pulse');
				});
			_this.parent().data('level', level);
			if (_.isFunction(that.param.change))
				that.param.change(level);
			if (that.param.bind != null)
				that.domCache.next('input').val(level);
		}).
		// 离开
		on('mouseleave', function(){
			let _this  = $(this);
			let choose = _this.data('level');
			if (choose == undefined)
			{
				_this.children('.star').removeClass('full');
				return;
			}
			_this.children('.star').removeClass('full');
			_this.children('.star:lt(' + choose + ')').addClass('full');
		});
	}

}