/**
 * eadmin tips提示组件
 */

class Tips{

	/**
	 * 执行
	 */
	static run(){
		// 定时器
		let timer;
		// 元素
		let dom = [
			'[data-tips]:not(.tips-disabled)'
		];
		body.
		// 移入
		on('mouseenter', dom[0], function(){
			clearTimeout(timer);
			Tips.show($(this));
		}).
		// 移出
		on('mouseleave', dom[0], function(){
			let [_this, v] = [$(this), {
				tips : $('.tips')
			}];
			v.pt = _this.data('tips-position') || 'top';
			switch (v.pt)
			{
				case 'top':
					v.class = 'fadeOutUp';
				break;
				case 'down':
					v.class = 'fadeOutDown';
				break;
				case 'left':
					v.class = 'fadeOutLeft';
				break;
				case 'right':
					v.class = 'fadeOutRight';
				break;
			}
			v.tips.addClass(v.class);
			timer = setTimeout(() => {
				v.tips.remove();
			}, 200);
		});
	}

	/**
	 * 显示TIPS
	 */
	static show(dom, param = null){
		let v = {
			tips : $('.tips')
		};
		if (param == null)
		{
			param = {
				center   : dom.data('tips-center'),
				position : dom.data('tips-position'),
				tips     : dom.data('tips'),
				offset   : dom.data('tips-offset')
			};
		}
		if (v.tips.length == 0)
		{
			v.style = param.center != undefined ? ' text-align:center;' : '';
			let zindex;
			if (Mount.window != null)
			{
				zindex   = $('#' + Mount.window).css('z-index');
				zindex   = zindex == undefined ? '' : `z-index:${zindex};`;
				v.style += zindex;
			}
			v.html  = `<div style="${v.style}" class="tips animated faster">
						<div></div>
						<div class="tips-arrow"></div>
					</div>`;
			$('body').append(v.html);
			v.tips = $('.tips');
		}
		v.offset = dom.offset();
		v.left   = v.offset.left;
		v.top    = v.offset.top;
		// 方位
		v.pt  = param.position || 'top';
		// 文案
		v.txt = param.tips;
		if (v.txt == undefined) v.txt = '默认文案';
		v.tips.children('div:first').html(v.txt);
		// 判断空间
		if (v.pt == 'right' && 
			distance(dom, 'right') < v.tips.outerWidth() + 30)
		{
			v.pt = 'left';
			dom.data('tips-position', 'left');
		}
		else if (v.pt == 'left' && 
			distance(dom, 'left') < v.tips.outerWidth() + 30)
		{
			v.pt = 'right';
			dom.data('tips-position', 'right');
		}
		switch (v.pt)
		{
			case 'top':
				v.class = 'fadeInDown';
				v.arrow = 'down';
			break;
			case 'down':
				v.class = 'fadeInUp';
				v.arrow = 'top';
			break;
			case 'left':
				v.class = 'fadeInLeft';
				v.arrow = 'right';
			break;
			case 'right':
				v.class = 'fadeInRight';
				v.arrow = 'left';
			break;
		}
		v.tips.
			attr('class', 'tips animated faster ' + v.class).
			children('div:last').
			attr('class', 'tips-arrow ' + v.arrow);
		// 居中偏移
		if (v.pt == 'top' || v.pt == 'down')
			v.offset = v.tips.outerWidth() / 2 - dom.outerWidth() / 2;
		else
			v.offset = v.tips.outerHeight() / 2 - dom.outerHeight() / 2;
		switch (v.pt)
		{
			case 'top':
				v.top = v.top - v.tips.outerHeight() - 10;
				v.left -= v.offset;
			break;
			case 'down':
				v.top = v.top + dom.outerHeight() + 10;
				v.left -= v.offset;
			break;
			case 'left':
				v.left = v.left - v.tips.outerWidth() - 10;
				v.top -= v.offset;
			break;
			case 'right':
				v.left = v.left + dom.outerWidth() + 10;
				v.top -= v.offset;
			break;
		}
		v.tips.css({
			left : v.left,
			top  : v.top
		});
	}

	/**
	 * 重置
	 */
	static reset(dom, param = {}){
		let v = {
			tips : $('.tips')
		}
		v.txt  = dom.data('tips');
		v.tips.children('div:first').html(v.txt);
		v.left = _.floor(dom.offset().left);
		// 处理偏移
		v.offset = param.offset;
		if (v.offset == 'middle')
			v.offset = v.tips.outerWidth() / 2 - dom.outerWidth() / 2;
		v.left -= v.offset;
		v.tips.css({
			left : v.left
		});
	}

	/**
	 * 销毁
	 */
	static destory(dom){
		dom.trigger('mouseleave');
	}

}