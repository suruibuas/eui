/**
 * eadmin 模态组件
 */

class Popup{

	constructor(){
		this.Timer = null;
	}

	/**
	 * 默认提示
	 */
	static alert(param = {})
	{
		this._createHtml({
			title : '消息提示',
			icon  : 'exclamation-circle color-warning',
			txt   : param.content,
			btn   : '<button id="close" class="highlight middle">确定 (<em>3</em>)</button>'
		});
		let _popup = $('.popup');
		fadeIn(_popup);
		this._countdown(_popup, param);
	}

	/**
	 * 成功提示
	 */
	static success(param = {})
	{
		this._createHtml({
			title : '操作成功',
			icon  : 'check-circle color-success',
			txt   : param.content,
			btn   : '<button id="close" class="highlight middle">确定 (<em>3</em>)</button>'
		});
		let _popup = $('.popup');
		fadeIn(_popup);
		this._countdown(_popup, param);
	}

	/**
	 * 失败提示
	 */
	static error(param = {})
	{
		this._createHtml({
			title : '操作失败',
			icon  : 'times-circle color-error',
			txt   : param.content,
			btn   : '<button id="close" class="highlight middle">确定 (<em>3</em>)</button>'
		});
		let _popup = $('.popup');
		fadeIn(_popup);
		this._countdown(_popup, param);
	}

	/**
	 * 确认提示
	 */
	static confirm(param = {})
	{
		this._createHtml({
			title : '操作确认',
			icon  : 'question-circle color-warning',
			txt   : param.content,
			btn   : `<button id="sure" class="highlight middle" style="margin-right:5px;">确定</button>
					<button id="close" class="middle">取消</button>`
		});
		let window = $('.window:visible'),
			length = window.length;
		if (length > 0)
		{
			window.hide();
		}
		else
		{
			Eadmin.mask();
		}
		let popup = $('.popup');
		fadeIn(popup);
		popup.
		find('#close').
		on('click', function(){
			if (length > 0)
			{
				window.show();
			}
			else
			{
				Eadmin.maskHide();
			}
			fadeOut(popup);
		});
		popup.
		find('#sure').
		on('click', function(){
			$(this).
				html('执行中...').
				attr('disabled', true);
			if (param.callback != undefined && 
				_.isFunction(param.callback))
				param.callback();
		});
	}

	/**
	 * 初始化
	 */
	static _createHtml(param = {}){
		param.icon = 'fa fa-' + param.icon;
		if ($('.popup').length == 1)
		{
			let _popup = $('.popup');
			if (_popup.is(':visible'))
				_popup.hide();
			let _var = {
				title : _popup.children('.title'),
				icon  : _popup.children('i'),
				txt   : _popup.children('.txt'),
				btn   : _popup.children('.btn')
			};
			_var.title.html(param.title);
			_var.icon.attr('class', param.icon);
			_var.txt.html(param.txt);
			_var.btn.html(param.btn);
		}
		else
		{
			let _html = `<div class="popup animated faster dn">
				<span class="title">${param.title}</span>
				<i class="${param.icon}"></i>
				<span class="txt">${param.txt}</span>
				<div class="btn">${param.btn}</div>
			</div>`;
			$('body').append(_html);
		}
	}

	/**
	 * 倒计时
	 */
	static _countdown(popup, param){
		let window = $('.window:visible'),
			length = window.length;
		let func = {
			close : () => {
				if (length == 0)
				{
					Eadmin.maskHide();
				}
				else
				{
					window.show();
				}
				fadeOut(popup);
				clearInterval(this.Timer);
				this.Timer = null;
				if (_.isFunction(param.callback))
					param.callback();
				if (param.refresh === true)
					Eadmin.refresh();
			}
		}
		if (length > 0)
		{
			window.hide();
		}
		else
		{
			Eadmin.mask();
		}
		let second = 3;
		this.Timer = setInterval(() => {
			second--;
			if (second == 0)
			{
				func.close();
				return;
			}
			popup.
				find('em').
				html(second);
		}, 1000);
		popup.
		find('#close').
		on('click', () => {
			func.close();
		});
	}
	
}