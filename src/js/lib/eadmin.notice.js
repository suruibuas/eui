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
			icon     : param.icon === null ? null : 'exclamation-circle color-warning',
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
			icon     : 'check-circle color-success',
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
			icon     : 'times-circle color-error',
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
			mb   : ' mb5px',
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
			_var.mb = '';
		}
		if (param.icon != null)
		{
			_var.html += `<i class="title-icon fa fa-${param.icon}"${_var.iconTop}></i>`;
			_var.ml = ' style="margin-left:28px"';
		}
		_var.html += `<i class="fa fa-close close"></i>
			<div class="box${_var.mb}"${_var.ml}>
				<div class="font-h3">${param.title}</div>`;
		if (param.desc != undefined)
			_var.html += `<div class="font-h5 desc">${param.desc}</div>`;
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