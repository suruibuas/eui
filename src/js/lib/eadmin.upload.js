/**
 * eadmin 上传组件
 */

class Upload{

	constructor(dom, param){
		this.dom = dom;
		this.domCache = scope(this.dom);
		// 组成不会重复的元素名
		this.dom += (new Date()).valueOf();
		this.domCache.attr('id', this.dom.replace('#', ''));
		this.upload = null;
		this.pic    = [];
		// 默认参数
		let _param   = {
			// 表单名
			filename : 'file',
			// 允许的格式
			doc : ['.jpg', '.gif', '.png', '.jpeg'],
			// 自动上传
			autoupload : true,
			// 最大尺寸
			maxsize : 5000,
			// 最大文件数量
			maxfile : null,
			// 默认值
			default : '',
			// 绑定的隐藏域，用来后端取值
			bind : '',
			// mini显示
			mini : false
		}
		// 配置参数
		this.param = $.extend(_param, param);
		if (this.param.mini)
		{
			this.param.maxfile = 1;
			this.param.autoupload = true;
		}
		if (this.param.api == undefined)
		{
			console.log('请指定后端接收上传数据的API地址');
			return;
		}
		this.param.maxsize /= 1000;
		// 拼接接口
		if ( ! _.startsWith(this.param.api, 'http') && 
			_.startsWith(module.conf.http.baseURL, 'http'))
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
		let [msg, _class] = ['', ''];
		if (this.param.mini)
		{
			// 说明html
			msg = `<div class="dz-message dz-mini">
						<i class="ri-image-add-line"></i>
					</div>`;
			_class = ' dropzone-mini';
		}
		else
		{
			// 说明html
			msg = `<div class="dz-message">
						<i class="ri-upload-cloud-2-line"></i>
						将文件拖至此处或点击上传
					</div>
					<div class="dz-button">
						<span>待上传：<em></em></span>
						<button class="highlight small dz-upload-btn">开始上传</button>
					</div>`;
		}
		this.domCache.
			addClass('dropzone' + _class).
			html(msg);
		// 绑定的隐藏域
		if (this.param.bind != '')
			this.domCache.after(`<input type="hidden" name="${this.param.bind}" value="${this.param.default}">`);
	}
	
	/**
	 * 初始化
	 */
	_init()
	{
		let v = {
			button : this.domCache.children('.dz-button')
		};
		// 上传消息模版
		v.uploadTmp = `<div class="dz-preview dz-image-preview${this.param.mini ? ' dz-preview-mini' : ''}">
							<div class="dz-image">
								<img data-dz-thumbnail />
							</div>
							<div class="dz-details">
								<div class="dz-filename"><span data-dz-name></span></div>
								<div class="dz-size" data-dz-size></div>
							</div>
							<div class="dz-progress">
								<span class="dz-upload" data-dz-uploadprogress></span>
							</div>
							<i class="ri-checkbox-circle-fill dz-success-i"></i>
							<i class="ri-close-circle-fill dz-error-i"></i>
							<i class="ri-close-line dz-remove-i" data-dz-remove></i>
						</div>`;
		this.upload = new Dropzone(this.dom, {
			url 		     	 : this.param.api,
			paramName        	 : this.param.filename,
			maxFilesize      	 : this.param.maxsize,
			acceptedFiles    	 : _.join(this.param.doc, ','),
			autoProcessQueue 	 : this.param.autoupload,
			parallelUploads  	 : 1000,
			previewTemplate  	 : v.uploadTmp,
			maxFiles 		 	 : this.param.maxfile,
			dictFileTooBig   	 : '允许上传文件的最大限制为：{{maxFilesize}}MB',
			dictInvalidFileType  : '上传的文件格式不被允许',
			dictResponseError    : '上传文件失败，返回码：{{statusCode}}',
			dictMaxFilesExceeded : '上传的文件数量超出限制'
		});
		// 默认值，一般用在编辑场景下的默认赋值
		if (this.param.default != '')
		{
			v.default = this.param.default.split(',');
			this.pic  = v.default;
			_.each(v.default, (val) => {
				let thumb = {
					name : val,
					accepted : true
				};
				this.upload.emit('addedfile', thumb);
				this.upload.emit('thumbnail', thumb, val);
				this.upload.emit('success', thumb);
				this.upload.emit('complete', thumb);
				this.upload.files.push(thumb);
			});
		}
		// 挂载上传组件实例化的类，用来切换页面时销毁使用
		Mount.dropzone.push(this.upload);
	}

	/**
	 * 事件
	 */
	_event()
	{
		let _this = this;
		let v = {
			button : _this.domCache.find('.dz-button')
		};
		_this.upload.
		on('addedfile', (file) => {
			if (file.type.indexOf('image') == -1)
				_this.domCache.find('.dz-details').show();
			if (_this.param.autoupload) return;
			if (v.button.is(':hidden'))
			{
				_this.domCache.css('padding-bottom', 40);
				v.button.show();
			}
			// 上传文件总数
			let fileCount = _this.domCache.find('.dz-preview:not(.dz-complete)').length;
			v.button.
				find('em').
				html(fileCount);
		}).
		on('removedfile', (file) => {
			if (file.status == 'error') return;
			// 上传文件总数
			let fileCount = _this.domCache.find('.dz-preview:not(.dz-complete)').length;
			v.button.find('em').html(fileCount);
			fileCount = _this.domCache.find('.dz-preview').length;
			if (fileCount == 0)
			{
				_this.domCache.css('padding-bottom', 10);
				v.button.hide();
			}
			let _file;
			if (file.xhr != undefined)
			{
				let json = JSON.parse(file.xhr.response);
				_file = json.pic;
			}
			else
			{
				_file = file.name;
			}
			_file = [_file];
			_this.pic = _.xor(_this.pic, _file);
			if (_this.param.bind != '')
			{
				let input = _this.domCache.next('input');
				input.val(_.split(_this.pic, ','));
			}
		}).
		on('success', (file, response) => {
			let fileCount = parseInt(v.button.find('em').html());
			v.button.find('em').html(fileCount - 1);
			_this.pic.push(response.pic);
		}).
		on('error', (file, msg) => {
			_this.upload.removeFile(file);
			Eadmin.message.error({
				content : msg
			});
		}).
		on('queuecomplete', () => {
			if (_this.param.bind != '')
			{
				let input = _this.domCache.next('input');
				input.val(_.split(_this.pic, ','));
			}
		});
		if (_this.param.autoupload) return;
		$(_this.dom + ' .dz-upload-btn').on('click', () => {
			_this.upload.processQueue();
			return false;
		});
	}
	
}