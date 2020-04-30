/**
 * eadmin 选项卡组件
 */

class Tab{

	constructor(dom, param){
		this.dom = scope(dom);
		// 选项卡面板
		this.panel  = this.dom.children('.tab-panel');
		// 当前活动面板的index
		this.active = null;
		if (this.panel.length == 0)
		{
			console.log('容器内没有找到.tab-panel元素，构建选项卡失败');
			return;
		}
		let _param = {
			// 模式
			module : 1,
			// 配置
			tabs : []
		};
		this.param = $.extend(_param, param);
		this.run();
	}

	run(){
		this._create();
		this._init();
		this._event();
	}

	/**
	 * 构建结构
	 */
	_create()
	{
		if (this.param.tabs.length == 0)
		{
			console.log('请至少指定1个选项卡');
			return;
		}
		let v = {
			html : ''
		};
		// 模式一
		if (this.param.module == 1)
		{
			v.html += `<div class="tab tab-module-1">`;
			_.each(this.param.tabs, (row, key) => {
				v.html += `<span`;
				if (row.active === true)
				{
					v.html += ` class="active"`;
					this.active = key;
				}
				v.html += `>`;
				if (row.icon != undefined)
				{
					v.html += `<i class="fa fa-${row.icon}"></i>`;
				}
				v.html += row.name;
				v.html += `<div></div>`;
				v.html += `</span>`;
			});
			v.html += `</div>`;
		}
		else
		{
			v.html += `<div class="tab tab-module-2"><div class="tab-box">`;
			_.each(this.param.tabs, (row, key) => {
				v.html += `<span`;
				if (row.active === true)
				{
					v.html += ' class="active"';
					this.active = key;
				}
				v.html += `>`;
				v.html += row.name;
				v.html += `</span>`;
			});
			v.html += `</div></div>`;
		}
		this.dom.prepend(v.html);
		this.tab = this.dom.children('.tab');
	}

	/**
	 * 初始化
	 */
	_init()
	{
		if (this.active == null)
		{
			this.active = 0;
		}
		this.panel.eq(this.active).show();
	}

	/**
	 * 事件
	 */
	_event()
	{
		let that = this;
		this.tab.
		on('click', 'span:not(.active)', function(){
			let v = {
				this : $(this)
			};
			v.index = v.this.index();
			addClassExc(v.this, 'active');
			that.panel.hide();
			that.panel.eq(v.index).show();
		});
	}
	
}