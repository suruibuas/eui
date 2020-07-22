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
			let v = {
				this : $(this),
				html : `<div class="bg"></div>`
			};
			v.percent = v.this.data('percent');
			v.width = v.this.data('percent-width');
			if (v.width != undefined)
			{
				v.this.width(v.width);
			}
			else
			{
				v.width = v.this.width();
			}
			// 计算进度宽度
			let width = _.floor(v.width / 100 * v.percent);
			// 自定义颜色
			v.color = v.this.data('percent-color');
			let color = v.color == undefined ? '' : ' color-' + v.color;
			v.html += `<div class="percent${color}" style="width:${width}px;"></div>`;
			if (v.this.data('show-percent') != undefined)
				v.html += `<div class="point">${v.percent}%</div>`;	
			v.this.
				addClass('progress').
				html(v.html);
		});
	}
	
}