/**
 * eadmin 通知消息组件
 */

class Notice{

	/**
	 * 普通
	 */
	static info(param = {}){
		this._createHtml({
			title    : param.title,
			desc     : param.desc,
			icon     : param.icon === null ? null : 'ri-error-warning-fill info',
			href     : param.href,
			duration : param.duration,
			callback : param.close
		});
	}

	/**
	 * 成功
	 */
	static success(param = {}){
		this._createHtml({
			title    : param.title,
			desc     : param.desc,
			icon     : 'ri-checkbox-circle-fill success',
			href     : param.href,
			duration : param.duration,
			callback : param.close
		});
	}

	/**
	 * 失败
	 */
	static error(param = {}){
		this._createHtml({
			title    : param.title,
			desc     : param.desc,
			icon     : 'ri-close-circle-fill error',
			href     : param.href,
			duration : param.duration,
			callback : param.close
		});
	}

	/**
	 * 初始化
	 */
	static _createHtml(param = {}){
		// 私有变量
		let _var = {
			html : `<div class="notice animated faster fadeInRight">`,
			ml   : '',
			iconTop : ''
		};
		let _func = {
			close : (box) => {
				box.
					addClass('fadeOutRight').
					on('animationend', () => {
						box.remove();
						if (param.callback != undefined && 
							_.isFunction(param.callback))
							param.callback();
					});
			}
		};
		if (param.desc == undefined || param.desc == '')
		{
			_var.iconTop = ' style="top:12px;"';
		}
		if (param.icon != null)
		{
			_var.html += `<i class="title-icon ${param.icon}"${_var.iconTop}></i>`;
			_var.ml = ' style="margin-left:32px"';
		}
		_var.html += `<i class="ri-close-line close"></i>
			<div class="box"${_var.ml}>
				<div class="notice-title">${param.title}</div>`;
		if (param.desc != undefined)
			_var.html += `<div class="desc">${param.desc}</div>`;
		if (param.href != undefined && 
			_.isArray(param.href))
		{
			for (let _i in param.href)
			{
				let native = param.href[_i].native != undefined ? ' data-native="1"' : '';
				let target = param.href[_i].target != undefined ? ' target="' + param.href[_i].target + '"' : '';
				_var.html += `<div class="href">
					<a href="${param.href[_i].href}"${native}${target}>${param.href[_i].txt}</a>
				</div>`;
			}
		}
		_var.html += `</div></div>`;
		$('#notice').append(_var.html);
		let _box = $('.notice:last');
		// 移除
		let _duration = (param.duration != undefined) ? 
							param.duration : 
							module.conf.notice_duration;
		_box.
		children('.close').
		on('click', function(){
			_func.close(_box);
		});
		if (_duration == 0) return;
		setTimeout(() => {
			_func.close(_box);
		},  _duration * 1000);
	}
	
}