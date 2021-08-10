/**
 * eadmin 进度条组件
 */

class Progress{	

	/**
	 * 进度条
	 */
	static run(dom){
		dom = dom == null ? body : $(dom);
		let progress = dom.find('[data-percent]');
		if (progress.length == 0) 
			return;
		progress.each(function(){
			let [_this, v] = [$(this), {}];
			v.html    = `<div class="bg"></div>`;
			v.percent = _this.data('percent');
			v.width   = _this.data('percent-width');
			if (v.width != undefined)
			{
				_this.width(v.width);
			}
			else
			{
				v.width = _this.width();
			}
			// 计算进度宽度
			let width = _.floor(v.width / 100 * v.percent);
			// 自定义颜色
			let color = _this.data('percent-color');
			v.color = color == undefined ? '' : ' linear-' + color;
			v.html += `<div class="percent${v.color}" style="width:${width}px;"></div>`;
			if (_this.data('show-percent') != undefined)
				v.html += `<div class="point">${v.percent}%</div>`;	
			_this.addClass('progress').html(v.html);
		});
	}
	
}