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
			icon  : 'ri-error-warning-fill alert',
			txt   : param.content,
			btn   : '<button id="close" class="hl middle">确定 (<em>3</em>)</button>'
		});
		let popup = $('.popup');
		fadeIn(popup);
		this._countdown(popup, param);
	}

	/**
	 * 成功提示
	 */
	static success(param = {})
	{
		this._createHtml({
			title : '操作成功',
			icon  : 'ri-checkbox-circle-fill success',
			txt   : param.content,
			btn   : '<button id="close" class="hl middle">确定 (<em>3</em>)</button>'
		});
		let popup = $('.popup');
		fadeIn(popup);
		this._countdown(popup, param);
	}

	/**
	 * 失败提示
	 */
	static error(param = {})
	{
		this._createHtml({
			title : '操作失败',
			icon  : 'ri-close-circle-fill error',
			txt   : param.content,
			btn   : '<button id="close" class="hl middle">确定 (<em>3</em>)</button>'
		});
		let popup = $('.popup');
		fadeIn(popup);
		this._countdown(popup, param);
	}

	/**
	 * 确认提示
	 */
	static confirm(param = {})
	{
		this._createHtml({
			title : '操作确认',
			icon  : 'ri-question-fill confirm',
			txt   : param.content,
			btn   : `<button id="sure" class="hl middle" style="margin-right:5px;">确定</button>
					<button id="close" class="middle">取消</button>`
		});
		Eadmin.mask();
		let popup = $('.popup');
		fadeIn(popup);
		popup.find('#close').
		on('click', function(){
			Eadmin.maskHide();
			fadeOut(popup);
			if (_.isFunction(param.cancel))
				param.cancel();
		});
		popup.find('#sure').
		on('click', function(){
			$(this).html('执行中...').attr('disabled', true);
			if (_.isFunction(param.submit))
				param.submit();
		});
	}

	/**
	 * 初始化
	 */
	static _createHtml(param = {}){
		if ($('.popup').length == 1)
		{
			let popup = $('.popup');
			if (popup.is(':visible'))
				popup.hide();
			let v = {
				title : popup.children('.title'),
				icon  : popup.children('i'),
				txt   : popup.children('.txt'),
				btn   : popup.children('.btn')
			};
			v.title.html(param.title);
			v.icon.attr('class', param.icon);
			v.txt.html(param.txt);
			v.btn.html(param.btn);
		}
		else
		{
			let html = `<div class="popup animated faster dn">
				<span class="title">${param.title}</span>
				<i class="${param.icon}"></i>
				<span class="txt">${param.txt}</span>
				<div class="btn">${param.btn}</div>
			</div>`;
			$('body').append(html);
		}
		let window = $('.window:visible').length;
		if (window > 0)
			$('.popup').css('z-index', 9999 + window);
	}

	/**
	 * 倒计时
	 */
	static _countdown(popup, param){
		let func = {
			close : () => {
				Eadmin.maskHide();
				fadeOut(popup);
				clearInterval(this.Timer);
				this.Timer = null;
				if (_.isFunction(param.submit))
					param.submit();
				if (param.refresh === true)
					Eadmin.refresh();
			}
		}
		Eadmin.mask();
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
		popup.find('#close').
		on('click', () => {
			func.close();
		});
	}
	
}