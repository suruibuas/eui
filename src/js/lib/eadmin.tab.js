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
		this.param = param;
		this.run();
	}

	/**
	 * 运行
	 */
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
		if (this.param.length == 0)
		{
			console.log('请至少指定1个选项卡');
			return;
		}
		let v = {
			html : ''
		};
		v.html += `<div class="tab">`;
		_.each(this.param, (row, key) => {
			v.html += `<span`;
			if (row.active === true)
			{
				v.html += ` class="active"`;
				this.active = key;
			}
			v.html += `>`;
			if (row.icon != undefined)
			{
				v.html += `<i class="${row.icon}"></i>`;
			}
			v.html += row.name;
			v.html += `</span>`;
		});
		v.html += `</div>`;
		this.dom.prepend(v.html);
		this.tab = this.dom.children('.tab');
	}

	/**
	 * 初始化
	 */
	_init()
	{
		if (this.active == null)
			this.active = 0;
		this.panel.
			eq(this.active).
			show();
		// 加载页面
		this._load();
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
			that.active = v.index;
			that.panel.
				hide().
				eq(v.index).
				show();
			that._load();
		});
	}

	/**
	 * 加载
	 */
	_load()
	{
		let load = this.param[this.active].load;
		if (load == undefined)
			return;
		if (this.param[this.active].loaded != undefined)
			return;
		this.param[this.active].loaded = true;
		let panel = this.panel.eq(this.active);
		let id = 'tab-window-' + createId();
		panel.attr('id', id);
		Mount.window = id;
		panel.html(`
			<div class="panel-loading">
				<i class="ri-loader-4-line rotate"></i>页面加载中，请稍候...
			</div>
		`);
		Eadmin.currentHref = load;
		panel.
			load(load, () => {
				// 表单处理
				Eadmin.form(panel);
				// 延迟按钮
				Button.run(panel);
				// 状态
				Status.run(panel);
				// 标签
				Tag.run(panel);
				// 进度条
				Progress.run(panel);
				// 滚动条处理
				let scroll = body.find('.iscroll');
				if(scroll.length > 0)
				{
					scroll.
					each(function(){
						if ($(this).hasClass('ps')) return true;
						Eadmin.scroll($(this)[0]);
					});
				}
				// 块
				block(panel);
			});
	}
	
}