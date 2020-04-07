/**
 * eadmin 上传组件
 */

class Upload{	

	/**
	 * 上传
	 */
	static run(dom, param = {}){
		if (param.api == undefined)
		{
			console.log('请指定后端接收上传数据的API地址');
			return;
		}
		if (param.filename == undefined)
		{
			param.filename = 'file';
		}
		if (param.headers == undefined)
		{
			param.headers = {};
		}
		if (param.doc == undefined)
		{
			param.doc = '.jpg, .gif, .png, .jpeg';
		}
		if (param.autoupload == undefined)
		{
			param.autoupload = true;
		}
		if (param.maxsize == undefined)
		{
			param.maxsize = 5000;
		}
		param.maxsize /= 1000;
		let v = {
			this : $(dom)
		};
		// 说明html
		v.msg = `<div class="dz-message">
					<i class="fa fa-cloud-upload"></i>
					将文件拖至此处或点击上传
				</div>
				<div class="dz-button">
					<span>待上传：<em></em></span>
					<button class="highlight small dz-upload-btn">开始上传</button>
				</div>`;
		v.this.
			addClass('dropzone').
			html(v.msg);
		v.button = v.this.children('.dz-button');
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
		v.upload = new Dropzone(dom, {
			url 		     : module.conf.http.baseURL + param.api,
			paramName        : param.filename,
			maxFilesize      : param.maxsize,
			headers          : param.headers,
			acceptedFiles    : param.doc,
			autoProcessQueue : param.autoupload,
			parallelUploads  : 1000,
			previewTemplate  : v.uploadTmp,
			dictFileTooBig   : '允许上传文件的最大限制为：{{maxFilesize}}MB',
			dictInvalidFileType : '上传的文件格式不被允许',
			dictResponseError : '上传文件失败，返回码：{{statusCode}}'
		});
		v.upload.
		on('addedfile', () => {
			if (param.autoupload) return;
			if (v.button.is(':hidden'))
			{
				v.this.css('padding-bottom', 50);
				v.button.show();
			}
			// 上传文件总数
			let fileCount = v.this.find('.dz-preview:not(.dz-complete)').length;
			v.button.find('em').html(fileCount);
		}).
		on('removedfile', () => {
			// 上传文件总数
			let fileCount = v.this.find('.dz-preview:not(.dz-complete)').length;
			v.button.find('em').html(fileCount);
			if (fileCount == 0)
			{
				v.this.css('padding-bottom', 10);
				v.button.hide();
			}
		}).
		on('success', (file, response) => {
			if (_.isFunction(param.success))
				param.success(response);
			let fileCount = parseInt(v.button.find('em').html());
			v.button.find('em').html(fileCount - 1);
		}).
		on('error', (file, msg) => {
			Eadmin.message.error({
				content : msg
			});
		});
		box.on('click', '.dz-upload-btn', () => {
			v.upload.processQueue();
		});
	}
	
}