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
		let v = {
			html : `<div class="notice animated faster fadeInRight">`,
			ml   : '',
			iconTop : ''
		};
		let func = {
			close : (box) => {
				box.addClass('fadeOutRight').
				on('animationend', () => {
					box.remove();
					if (param.callback != undefined && 
						_.isFunction(param.callback))
						param.callback();
				});
			}
		};
		if (param.desc == undefined || 
			param.desc == '')
		{
			v.iconTop = ' style="top:12px;"';
		}
		if (param.icon != null)
		{
			v.html += `<i class="title-icon ${param.icon}"${v.iconTop}></i>`;
			v.ml = ' style="margin-left:32px"';
		}
		v.html += `<i class="ri-close-line close"></i>
			<div class="box"${v.ml}>
				<div class="notice-title">${param.title}</div>`;
		if (param.desc != undefined)
			v.html += `<div class="desc">${param.desc}</div>`;
		if (param.href != undefined && 
			_.isArray(param.href))
		{
			for (let i in param.href)
			{
				let native = param.href[i].native != undefined ? ' data-native="1"' : '';
				let target = param.href[i].target != undefined ? ' target="' + param.href[i].target + '"' : '';
				v.html += `<div class="href">
					<a href="${param.href[i].href}"${native}${target}>${param.href[i].txt}</a>
				</div>`;
			}
		}
		v.html += `</div></div>`;
		$('#notice').append(v.html);
		let box = $('.notice:last');
		// 移除
		let duration = (param.duration != undefined) ? 
							param.duration : 
							module.conf.notice_duration;
		box.children('.close').
		on('click', function(){
			func.close(box);
		});
		if (duration == 0) return;
		setTimeout(() => {
			func.close(box);
		},  duration * 1000);
	}
	
}