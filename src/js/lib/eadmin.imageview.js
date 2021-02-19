/**
 * eadmin 图片查看器
 */

class Imageview{

	/**
	 * 执行图片查看器
	 */
	static run(){
		let [scale, imageview, time] = [1];
		let resize = (dom, param) => {
			dom.css('transform', 'translate(' + param.left + 'px, ' + param.top + 'px) scale(' + scale + ')');
		}
		body.on('click', '.imageview', function(){
			scale = 1;
			let [_this, v] = [$(this), {}];
			let func  = () => {
				let i = 1;
				let set = setInterval(() => {
					if (v.Image.width > 0 || 
						v.Image.height > 0)
					{
						clearInterval(set);
						let _class = v.Image.width >= v.Image.height ? 'imgW' : 'imgH';
						let html = `<img 
										ondragstart="return false;" 
										src="${v.src}" 
										class="${_class}" 
										style="transform:translate(0px, 0px) scale(1)">`;
						imageview.find('li').html(html);
						return;
					}
					i++;
					if (i > 50)
					{
						clearInterval(set);
						Eadmin.popup.error({
							content : '大图加载失败'
						});
					}
				}, 40);
			}
			v.src = _this.data('src');
			if (body.find('#imageview').length == 0)
			{
				body.append(`<div id="imageview">
								<ul>
									<li></li>
								</ul>
								<div class="imageview-close">
									<i class="ri-close-line"></i>
								</div>
								<div class="imageview-tips"></div>
							</div>`);
				imageview = $('#imageview');
			}
			else
			{
				imageview.show();
			}
			v.Image = new Image;
			v.Image.src = v.src;
			func();
		}).
		on('click', '.imageview-close', () => {
			imageview.find('li').empty();
			imageview.hide();
		}).
		on('mousedown', '#imageview img', function(event){
			let [_this, v] = [$(this), {}];
			v.offset = _this.offset();
			v.x = event.clientX;
			v.y = event.clientY;
			v.transform = _this.css('transform').replace(/[^0-9\-,]/g,'').split(',');
			v.t = parseInt(v.transform[5]);
			v.l = parseInt(v.transform[4]);
			//鼠标移动事件
			$(document).on('mousemove', (event) => {
				let top  = v.t + (event.clientY - v.y),
					left = v.l + (event.clientX - v.x);
				resize(_this, {
					top  : top,
					left : left
				});
			});
		}).
		on('mouseup', '#imageview img', () => {
			$(document).off('mousemove');
		}).
		on('mousewheel DOMMouseScroll', '#imageview img', function(event){
			clearTimeout(time);
			let [_this, v] = [$(this), {
				e : event.originalEvent,
				tips : imageview.find('.imageview-tips')
			}];
			v.delta = v.e.detail && (v.e.detail > 0 ? -1 : 1) ||
						v.e.wheelDelta && (v.e.wheelDelta > 0 ? -1 : 1);
			scale += v.delta == -1 ? 0.1 : -0.1;
			if (scale < 1) scale = 1;
			if (scale > 3) scale = 3;
			v.transform = _this.css('transform').replace(/[^0-9\-,]/g,'').split(',');
			resize(_this, {
				top  : v.transform[5],
				left : v.transform[4]
			});
			v.tips.html((scale * 100).toFixed(0) + '%').show();
			time = setTimeout(() => {
				v.tips.hide();
			}, 1000);
		});
	}

}