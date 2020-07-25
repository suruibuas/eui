/**
 * eadmin 滑块组件
 */

class Slider{

	constructor(dom, param = {}){
		// 原始DOM名称
		this.dom = dom;
		// DOM缓存
		this.domCache = scope(this.dom);
		if (this.domCache.length == 0)
		{
			console.log('没有' + this.dom + '元素，滑块不再创建');
			return;
		}
		setTimeout(() => {
			// 外层容器真实宽度
			this.width     = this.domCache.width();
			// 滑块按钮宽度
			this.btnWidth  = 16;
			// 最大偏移值，用来控制滑块的真实可移动范围，避免移出滑动条
			this.maxLeft   = this.width - this.btnWidth;
			// 盒子的X轴偏移值
			this.offsetX   = this.domCache.offset().left;
			// 步长宽度
			this.stepWidth = 0;
			// 默认参数
			let _param = {
				// 默认值
				value    : 0,
				// 禁用
				disabled : false,
				// 步长
				step 	 : 0,
				// 最小值
				min 	 : 0,
				// 最大值
				max 	 : 100,
				// 是否需要提示
				tips 	 : '',
				// 回调
				change 	 : null
			};
			// 配置参数
			this.param = $.extend(_param, param);
			// 运行
			this.run();
		}, 50);
	}

	/**
	 * 运行控件
	 */
	run(){
		// 构建结构
		this._create();
		// 事件执行
		if (this.param.disabled) 
			return;
		this._event();
	}

	/**
	 * 创建结构
	 */
	_create(){
		// 私有方法，创建结构
		let create = (dom) => {
			// 添加默认样式
			if ( ! dom.hasClass('slider')) 
				dom.addClass('slider');
			// 判断是否禁用
			if (this.param.disabled) 
				dom.addClass('slider-disabled');
			// 创建结构
			let html = '', left;
			// 如果固定步长，则增加步长点
			if (this.param.step > 0)
			{
				console.log(this.width);
				// 设置步长点的左偏移值
				this.stepWidth = _.round(this.width / this.param.step);
				for (let i = 1; i < this.param.step; i++)
					html += `<div class="step" style="left: ${this.stepWidth * i}px;"></div>`;
				left = (this.param.value / this.param.step) * this.stepWidth;
				left -= 8;
				if (left < 0) left = 0;
				if (left > this.maxLeft) left = this.maxLeft;
			}
			else
			{
				left = _.floor(this.maxLeft / 
					(this.param.max - this.param.min) * 
					this.param.value);
			}
			// tips提示内容
			let tips = this.param.value;
			if (tips == 0) tips = this.param.min;
			// 自定义TIPS处理
			if (this.param.tips != '')
				tips = _.replace(this.param.tips, '[val]', tips);
			// 如果滑块为禁用状态，则增加tips-disabled的class
			// 因为TIPS组件不会监听tips-disabled的事件
			html += `<div class="slider-btn${this.param.disabled ? ' tips-disabled' : ''}" data-tips="${tips}" data-tips-offset="middle" 
						data-tips-center="1" style="left:${left}px;">
					</div>
					<div class="slider-bar" style="width:${left + this.btnWidth}px;"></div>`;
			dom.html(html);
		}
		// 生成HTML结构
		if (this.domCache.length == 1)
		{
			create(this.domCache);
		}
		else
		{
			this.domCache.each(function(){
				create($(this));
			});
		}
	}

	/**
	 * 事件
	 */
	_event(){
		let that = this;
		let left = 0;
		// 事件处理
		this.domCache.
		// 状态激活
		on('mouseenter', '.slider-btn', function(){
			$(this).data('active', 1);
		}).
		// 状态锁定
		on('mouseleave', '.slider-btn', function(){
			$(this).data('active', 0);
		}).
		// 滑块按钮点击
		on('mousedown', '.slider-btn', function(event){
			// 私有变量
			let v = {
				this : $(this),
				clientX : null,
				clientXClone : event.clientX,
				// 定义当前移动是否在合法范围内
				allow : true,
				timer : null,
				val   : 0
			}
			v.left = parseInt(v.this.css('left'));
			v.bar  = v.this.next('.slider-bar');
			// 增加禁止CLASS，避免tips来回触发
			v.this.addClass('tips-disabled');
			// 如果没有配置全局禁止选中文本，则处理禁止选中文本
			// 避免在鼠标移动的过程中选中文本
			if(selectEnabled) selectText(0);
			// 可视区域内鼠标移动事件
			$(document).bind('mousemove', (event) => {
				// 当前鼠标X轴位置
				v.clientX = event.clientX - v.clientXClone;
				left = v.left + v.clientX;
				if (left < 0 || 
					left > that.maxLeft)
				{
					if ( ! v.allow) return;
					// 校验LEFT
					left = that._checkLeft(left);
					v.allow = false;
				}
				else
				{
					v.allow = true;
				}
				// 有步长的情况处理
				if (that.param.step > 0)
				{
					if (left == that.maxLeft)
					{
						left  = that.maxLeft;
						v.val = that.param.max;
					}
					else
					{
						let data = that._stepVal(left);
						v.val = data.val;
						left  = data.left;
					}
					v.this.css('left', left);
					v.bar.width(left + that.btnWidth);
				}
				else
				{
					v.this.css('left', left);
					v.bar.width(left + that.btnWidth);
					// 获取真实值
					v.val  = that._val(left);
					v.val += that.param.min;
				}
				clearTimeout(v.timer);
				// TIPS赋值
				that._tips(v.val, v.this);
				// TIPS重置
				Tips.reset(v.this, {
					offset : 'middle'
				});
				// 回调
				v.timer = setTimeout(() => {
					if (that.param.change != null && _.isFunction(that.param.change))
						that.param.change(v.val);			
				}, 400);
			}).bind('mouseup', function(){
				v.this.removeClass('tips-disabled');
				// 销毁TIPS
				if (v.this.data('active') == 0)
					Tips.destory(v.this);
				// 移除事件
				$(this).
					unbind('mousemove').
					unbind('mouseup');
			});
		}).
		// 还原
		on('mouseup', '.slider-btn', function(){
			// 如果没有配置全局禁止选中文本，则处理允许选中文本
			if(selectEnabled) selectText(1);
			// 设置这个值是表示当前滑块刚被移动过，防止click的重复触发
			$(this).
				parent().
				data('btn', true);
		}).
		// 点击选择位置
		on('click', function(event){
			// 私有变量
			let v = {
				this : $(this),
				val  : 0
			};
			if (v.this.data('btn') == true)
			{
				v.this.data('btn', false);
				return;
			}
			left  = _.floor(event.clientX - that.offsetX);
			left -= that.btnWidth / 2;
			// 校验LEFT
			left = that._checkLeft(left);
			let btn = v.this.children('.slider-btn'),
				bar = v.this.children('.slider-bar');
			// 没有步长的处理
			if (that.param.step == 0)
			{
				v.val = that._val(left);
			}
			else
			{
				if (left != that.maxLeft)
				{
					let data = that._stepVal(left); 
					v.val = data.val;
					left  = data.left;
				}
				else
				{
					v.val = that.param.max;
				}
			}
			btn.css('left', left);
			bar.width(left + that.btnWidth);
			// TIPS赋值
			that._tips(v.val, btn);
			if (that.param.change != null && 
				_.isFunction(that.param.change))
			that.param.change(v.val);
		});
	}

	/**
	 * 赋值tips
	 */
	_tips(tips, dom){
		if (this.param.tips != '')
			tips = _.replace(this.param.tips, '[val]', tips);
		dom.data('tips', tips);
	}

	/**
	 * 校验LEFT值在合法范围内
	 */
	_checkLeft(left){
		if (left < 0) left = 0;
		if (left > this.maxLeft) left = this.maxLeft;
		return left;
	}

	/**
	 * 取值
	 */
	_val(left){
		return _.floor(
			(this.param.max - this.param.min) / 
			this.maxLeft * 
			left
		);
	}

	/**
	 * 有步长的滑块获取真实值
	 */
	_stepVal(left)
	{
		let _left = 0;
		let _step = parseInt(
						(left + this.btnWidth / 2) / this.stepWidth
					);
		_left = _step * this.stepWidth;
		if (_left > 0) _left -= this.btnWidth / 2;
		return {
			val  : _step * this.param.step,
			left : _left
		};
	}

}