/**
 * eadmin 图表组件
 */

class EChart{	

	constructor(dom, param){
		this.dom = $(dom);
		this.ctx = this.dom[0].getContext('2d');
		// 配置色值
		let color = [
			'rgba(0, 132, 255',
			'rgba(255, 24, 68',
			'rgba(118, 255, 2',
			'rgba(255, 255, 1',
			'rgba(255, 142, 1',
			'rgba(105, 240, 174',
			'rgba(224, 64, 252',
			'rgba(254, 87, 34'
		];
		this.gradient = [];
		this.color = [];
		for (let i in color)
		{
			let gradient = this.ctx.createLinearGradient(0, 0, 0, 300);
			gradient.addColorStop(0, color[i] + ', 0.5)');
			gradient.addColorStop(1, color[i] + ', 0)');
			this.gradient.push(gradient);
			this.color.push(color[i] + ')');
		}
		// 默认参数
		let _param = {
			// 类型
			type  : 'line',
			title : {
				show : true,
				text : '默认图表'
			},
			legend : true,
			// 自动响应高度宽度
			responsive : true
		}
		// 配置参数
		this.param = $.extend(true, _param, param);
		// 提示框
		this.tooltips = {
			backgroundColor : 'rgba(0, 0, 0, 0.8)',
			intersect : false,
			mode : 'index',
			titleFontSize : 14,
			bodySpacing : 4,
			xPadding : 10,
			yPadding : 10,
			titleMarginBottom : 8
		};
		// 布局
		this.layout = {
			padding: {
				top : 20
			}
		};
		// 移入
		this.hover = {
			mode : 'nearest',
			intersect : true
		};
		// 色值
		this.skin = {
			fontColor : '#36495C',
			lineColor : '#DCE8F2'
		};
		if (Mount.skin == 'dark')
		{
			this.skin = {
				fontColor : '#FFF',
				lineColor : '#151935'
			};
		}
		this.run();
	}

	/**
	 * 执行
	 */
	run(){
		switch(this.param.type)
		{
			case 'line':
				this._line();
			break;
			case 'bar':
				this._bar();
			break;
			case 'pie':
				this._pie();
			break;
		}
	}

	/**
	 * 线型图
	 */
	_line(){
		let config = {
			type : 'line',
			data : {
				labels   : this.param.labels,
				datasets : []
			},
			options : {
				hover    : this.hover,
				tooltips : this.tooltips,
				title    : {
					display   : this.param.title.show,
					fontSize  : 14,
					text 	  : this.param.title.text,
					fontColor : this.skin.fontColor,
					padding   : 0
				},
				responsive : this.param.responsive,
				maintainAspectRatio : this.param.responsive,
				legend     : {
					display : this.param.legend,
					labels  : {
						fontColor : this.skin.fontColor
					}
				},
				layout : this.layout,
				scales : {
					xAxes : [{
						gridLines : {
							drawBorder: true,
							color: this.skin.lineColor
						},
						ticks: {
							fontColor: this.skin.fontColor
						}
					}],
					yAxes : [{
						gridLines : {
							drawBorder: true,
							color: this.skin.lineColor
						},
						ticks: {
							fontColor: this.skin.fontColor
						}
					}]
				}
			}
		};
		if (this.param.labels == undefined || 
			this.param.labels.length == 0)
		{
			console.log('请指定图表X轴');
			return;
		}
		if (this.param.datas == undefined || 
			this.param.datas.length == 0)
		{
			console.log('请指定图表具体数据');
			return;
		}
		if (this.param.title.show)
		{
			this.layout.padding.top = 0;
		}
		_.each(this.param.datas, (row, key) => {
			config.data.datasets.push({
				label : row.label,
				data  : row.data,
				backgroundColor : this.gradient[key],
				borderColor : this.color[key],
				pointBackgroundColor : '#FFF',
				pointRadius : 4,
				borderWidth : 2,
				fill : true
			});
		});
		new Chart(this.ctx, config);
	}

	/**
	 * 柱状图
	 */
	_bar(){
		let config = {
			type : 'bar',
			data : {
				labels : this.param.labels,
				datasets : []
			},
			options : {
				hover : this.hover,
				tooltips : this.tooltips,
				title : {
					display   : this.param.title.show,
					fontSize  : 14,
					text 	  : this.param.title.text,
					fontColor : this.skin.fontColor,
					padding   : 0
				},
				responsive : this.param.responsive,
				maintainAspectRatio : this.param.responsive,
				legend : {
					display : this.param.legend,
					labels  : {
						fontColor : this.skin.fontColor
					}
				},
				scales : {
					xAxes : [{
						gridLines : {
							drawBorder: true,
							color: this.skin.lineColor
						},
						ticks: {
							fontColor: this.skin.fontColor
						}
					}],
					yAxes : [{
						gridLines : {
							drawBorder: true,
							color: this.skin.lineColor
						},
						ticks: {
							fontColor: this.skin.fontColor
						}
					}]
				},
				maintenanceAspectRatio : false
			}
		};
		if (this.param.labels == undefined || 
			this.param.labels.length == 0)
		{
			console.log('请指定图表X轴');
			return;
		}
		if (this.param.datas == undefined || 
			this.param.datas.length == 0)
		{
			console.log('请指定图表具体数据');
			return;
		}
		if (this.param.title.show)
		{
			this.layout.padding.top = 0;
		}
		_.each(this.param.datas, (row, key) => {
			config.data.datasets.push({
				label : row.label,
				data  : row.data,
				backgroundColor : this.gradient[key],
				borderColor : this.color[key],
				pointBackgroundColor : '#FFF',
				pointRadius : 4,
				borderWidth : 2,
				fill : true
			});
		});
		new Chart(this.ctx, config);
	}
	
	/**
	 * 饼状图
	 */
	_pie(){
		this.tooltips.mode = 'nearest';
		let config = {
			type : 'pie',
			data : {
				labels : this.param.labels,
				datasets : [
					{
						data : [],
						backgroundColor : [],
						borderColor : [],
						borderWidth : 2
					}
				]
			},
			options : {
				hover : '',
				tooltips : this.tooltips,
				title : {
					display   : this.param.title.show,
					fontSize  : 14,
					text 	  : this.param.title.text,
					fontColor : this.skin.fontColor,
					padding   : 0
				},
				responsive : this.param.responsive,
				maintainAspectRatio : this.param.responsive,
				legend : {
					display : this.param.legend,
					labels  : {
						fontColor : this.skin.fontColor
					}
				},
				maintenanceAspectRatio : false
			}
		};
		if (this.param.labels == undefined || 
			this.param.labels.length == 0)
		{
			console.log('请指定图表块');
			return;
		}
		if (this.param.datas == undefined || 
			this.param.datas.length == 0)
		{
			console.log('请指定图表具体数据');
			return;
		}
		if (this.param.title.show)
		{
			this.layout.padding.top = 0;
		}
		_.each(this.param.datas, (row, key) => {
			config.data.datasets[0].data.push(row);
			config.data.datasets[0].backgroundColor.push(this.gradient[key]);
			config.data.datasets[0].borderColor.push(this.color[key]);
		});
		new Chart(this.ctx, config);
	}

}