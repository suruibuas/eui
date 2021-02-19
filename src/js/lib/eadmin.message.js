/**
 * eadmin 消息组件
 */

class Message{

	/**
	 * 普通提示
	 */
	static info(param = {}){
		this._createHtml({
			content  : param.content,
			icon     : 'ri-error-warning-fill info',
			duration : param.duration
		});
	}

	/**
	 * 成功提示
	 */
	static success(param = {}){
		this._createHtml({
			content  : param.content,
			icon     : 'ri-checkbox-circle-fill success',
			duration : param.duration
		});
	}

	/**
	 * 错误提示
	 */
	static error(param = {}){
		this._createHtml({
			content  : param.content,
			icon     : 'ri-close-circle-fill error',
			duration : param.duration
		});
	}

	/**
	 * 初始化
	 */
	static _createHtml(param = {}){
		let v = {
			top : module.conf.message_top
		};
		v.top += $('.message').length * 42;
		v.html = `<div class="message animated faster fadeInDown">
			<i class="${param.icon}"></i>${param.content}
		</div>`;
		body.append(v.html);
		v.box = $('.message:last');
		v.box.css({
			'top' : v.top,
			'margin-left' : -(v.box.outerWidth() / 2)
		});
		v.duration = (param.duration != undefined) ? 
						param.duration : 
						module.conf.message_duration;
		setTimeout(() => {
			fadeOut(v.box, () => {
				v.box.nextAll('.message').animate({
					'top': '-=42'
				}, 150);
				v.box.remove();
			});
		},  v.duration * 1000);
	}
	
}