/**
 * eadmin 上传组件
 */

class Upload{

	constructor(dom, param){
		this.dom = dom;
		this.domCache = scope(this.dom);
		this.dom += (new Date()).valueOf();
		this.domCache.attr('id', this.dom.replace('#', ''));
		this.upload = null;
		// 默认参数
		let _param   = {
			// 表单名
			filename : 'file',
			// header
			headers  : {},
			// 允许的格式
			doc : '.jpg, .gif, .png, .jpeg',
			// 自动上传
			autoupload : true,
			// 最大尺寸
			maxsize : 5000,
			// 最大文件数量
			maxfile : null,
			// 成功回调
			success : null
		}
		// 配置参数
		this.param = $.extend(_param, param);
		if (this.param.api == undefined)
		{
			console.log('请指定后端接收上传数据的API地址');
			return;
		}
		this.param.maxsize /= 1000;
		// 拼接接口
		if (_.startsWith(module.conf.http.baseURL, 'http'))
		{
			this.param.api = module.conf.http.baseURL + this.param.api;
		}
		this.run();
	}
	
	/**
	 * 执行上传
	 */
	run(){
		this._create();
		this._init();
		this._event();
	}

	/**
	 * 构建
	 */
	_create()
	{
		// 说明html
		let msg = `<div class="dz-message">
					<i class="fa fa-cloud-upload"></i>
					将文件拖至此处或点击上传
				</div>
				<div class="dz-button">
					<span>待上传：<em></em></span>
					<button class="highlight small dz-upload-btn">开始上传</button>
				</div>`;
		this.domCache.
			addClass('dropzone').
			html(msg);
	}
	
	/**
	 * 初始化
	 */
	_init()
	{
		let v = {};
		v.button = this.domCache.children('.dz-button');
		// 上传消息模版
		v.uploadTmp = `<div class="dz-preview dz-image-preview">
							<div class="dz-image">
								<img data-dz-thumbnail />
							</div>
							<div class="dz-progress">
								<span class="dz-upload" data-dz-uploadprogress></span>
							</div>
							<i class="fa fa-check-circle dz-success-i"></i>
							<i class="fa fa-times-circle dz-error-i"></i>
							<i class="fa fa-times dz-remove-i" data-dz-remove></i>
						</div>`;
		this.upload = new Dropzone(this.dom, {
			url 		     : this.param.api,
			paramName        : this.param.filename,
			maxFilesize      : this.param.maxsize,
			headers          : this.param.headers,
			acceptedFiles    : this.param.doc,
			autoProcessQueue : this.param.autoupload,
			parallelUploads  : 1000,
			previewTemplate  : v.uploadTmp,
			maxFiles 		 : this.param.maxfile,
			dictFileTooBig   : '允许上传文件的最大限制为：{{maxFilesize}}MB',
			dictInvalidFileType : '上传的文件格式不被允许',
			dictResponseError : '上传文件失败，返回码：{{statusCode}}',
			dictMaxFilesExceeded : '上传的文件数量超出限制'
		});
		Mount.dropzone.push(this.upload);
	}

	/**
	 * 事件
	 */
	_event()
	{
		let that = this;
		let v = {
			button : that.domCache.find('.dz-button')
		};
		that.upload.
		on('addedfile', () => {
			if (that.param.autoupload) return;
			if (v.button.is(':hidden'))
			{
				that.domCache.css('padding-bottom', 50);
				v.button.show();
			}
			// 上传文件总数
			let fileCount = that.domCache.find('.dz-preview:not(.dz-complete)').length;
			v.button.find('em').html(fileCount);
		}).
		on('removedfile', () => {
			// 上传文件总数
			let fileCount = that.domCache.find('.dz-preview:not(.dz-complete)').length;
			v.button.find('em').html(fileCount);
			if (fileCount == 0)
			{
				that.domCache.css('padding-bottom', 10);
				v.button.hide();
			}
		}).
		on('success', (file, response) => {
			if (_.isFunction(that.param.success))
				that.param.success(response);
			let fileCount = parseInt(v.button.find('em').html());
			v.button.find('em').html(fileCount - 1);
		}).
		on('error', (file, msg) => {
			Eadmin.message.error({
				content : msg
			});
		}).
		on('queuecomplete', () => {
			if (_.isFunction(that.param.complete))
				that.param.complete();
		});
		if (that.param.autoupload)
		{
			return;
		}
		$(that.dom + ' .dz-upload-btn').on('click', () => {
			that.upload.processQueue();
			return false;
		});
	}
	
}