/**
 * eadmin 表单验证
 */

class Validate{

	/**
	 * 执行验证
	 */
	static run(){
		let that = this;
		body.
		// 文本框、文本域
		on('blur', ':text[data-validate], :password[data-validate], textarea[data-validate]', function(){
			that._check($(this));
		}).
		// 单选复选
		on('click', ':checkbox, :radio', function(){
			let [_this, v] = [$(this), {}];
			v.parent = _this.closest('.form-group');
			v.dom    = v.parent.find('[name="' + _this.attr('name') + '"]:first');
			if (v.dom.data('validate') == undefined)
				return;
			that._check(v.dom);
		}).
		// 下拉菜单
		on('change', 'select[data-validate]', function(){
			that._check($(this));
		});
		return;
	}

	/**
	 * 表单提交验证
	 */
	static submit(form){
		let validate = form.find('[data-validate]');
		if ( ! validate.length)
			return true;
		let that = this;
		validate.each(function(){
			let _this = $(this);
			if (_this.is(':hidden'))
				return true;
			if (_this.data('validate-error') != undefined)
				return true;
			that._check(_this);
		});
	}

	/**
	 * 执行校验
	 */
	static _check(dom){
		let v = {
			this : dom
		};
		// 私有方法 
		let func = {
			// 内置验证规则
			preg : (key) => {
				let preg = [];
				//不能为空
				preg['require'] = '[.\\s\\S]+';
				//手机号
				preg['mobile']  = '1[345789][\\d]{9}';
				//固定电话
				preg['phone']   = '([\\d]{3,4}-)?[\\d]{7,8}';
				//邮箱
				preg['email']   = '[\\w\-\\.]+@[\\w-\\.]+(\\.\\w+)+';
				//QQ
				preg['qq']      = '[1-9][\\d]{5,10}';
				//身份证
				preg['idcard']  = '(^\\d{15}$)|(^\\d{17}(\\d|X|x)$)';
				//网址
				preg['url']     = '(http:\/\/|https:\/\/)?[A-Za-z0-9]+\\.[A-Za-z0-9]+([\/=\?%\-&_#@[\]+!])*([^<>\"])*';
				//日期
				preg['date']    = '\\d{4}[/-]+\\d{2}[/-]+\\d{2}';
				//金额
				preg['money']   = '\\d{1,}\\.\\d{2,4}$';
				//ip
				preg['ip']      = '\\d{1,}\\.\\d{1,}\\.\\d{1,}\\.\\d{1,}';
				//纯数字
				preg['number']  = '^[\\d]+$';
				//纯字母
				preg['letter']  = '^[\\w]+$';
				//数字加字母
				preg['numberLetter'] = '^[0-9a-zA-Z]+$';
				//邮编
				preg['zipcode'] = '[1-9][0-9]{5}';
				if (preg[key] == undefined)
					return false;
				return preg[key];
			},
			// 验证
			check : (key, val) => {
				let preg = func.preg(key);
				if (preg === false) preg = key;
				// 验证规则
				let reg = new RegExp(preg);
				if ( ! reg.test(val))
					return false;
				return true;
			},
			// 设置input、textarea高亮状态
			set : (success = false) => {
				if (v.this.is('textarea'))
					Form.textarea(v.this, success);
				else
					Form.input(v.this, success);
			},
			// 通过
			success : () => {
				if (v.this.data('validate-error') == undefined)
					return;
				// 创建表单验证消息容器
				v.note = this._note(v.this);
				if (v.this.data('note') == false)
					v.note.remove();
				else
					v.note.removeClass('error').html(v.this.data('note'));
				v.this.removeData('validate-error');
			},
			// 失败
			error : (msg) => {
				// 创建表单验证消息容器
				v.note = this._note(v.this);
				// 验证失败
				v.this.data('validate-error', 1);
				// 显示提示信息
				if (v.msg == undefined) return;
				v.note.addClass('error').html(msg);
			}
		};
		// 验证规则
		v.rule = v.this.data('validate');
		// 消息
		v.msg  = v.this.data('validate-msg');
		// 下拉菜单
		if (v.this.is('select'))
		{
			if (v.this.find(':selected').index() == 0)
			{
				func.error(v.msg);
				return;
			}
			func.success();
			return;
		}
		// 单选复选
		if (v.this.is(':checkbox') || 
			v.this.is(':radio'))
		{
			v.parent = v.this.closest('.form-group');
			if(v.parent.find('[name="' + v.this.attr('name') + '"]:checked').length == 0)
			{
				func.error(v.msg);
				return;
			}
			func.success();
			return;
		}
		// 文本值
		v.val = v.this.val();
		// 规则验证
		v.arr = {};
		// 验证规则数组
		v.arr.rule = v.rule.split('|');
		// 提示信息数组
		if (v.msg != undefined)
			v.arr.msg = v.msg.split('|');
		// 验证结果
		v.result = true;
		// 验证错误的编号，用来通过此编号获取提示信息
		v.key = 0;
		// 开始验证
		_.each(v.arr.rule, (val, key) => {
			// 长度范围
			if (val.indexOf('len') != -1)
			{
				val = val.replace('len=', '');
				v.arr.len = val.split('-');
				if ((v.arr.len[0] != '' && v.val.length < v.arr.len[0]) || 
					(v.arr.len[1] != '' && v.val.length > v.arr.len[1]))
				{
					v.result = false;
					v.key = key;
					return false;
				}
			}
			// 取值范围
			else if (val.indexOf('val') != -1)
			{
				val = val.replace('val=', '');
				v.val = parseInt(v.val);
				v.arr.val = val.split('-');
				if (_.isNaN(v.val) || 
					(v.arr.val[0] != '' && v.val < v.arr.val[0]) ||
					(v.arr.val[1] != '' && v.val > v.arr.val[1]))
				{
					v.result = false;
					v.key = key;
					return false;
				}
			}
			// 内置规则验证
			else
			{
				if ( ! func.check(val, v.val))
				{
					v.result = false;
					v.key = key;
					return false;
				}
			}
		});
		// 验证通过
		if (v.result)
		{
			func.set(true);
			func.success();
			return;
		}
		func.set();
		func.error(v.arr.msg[v.key]);
	}

	/**
	 * 创建note容器
	 */
	static _note(dom){
		let parent = dom.closest('.form-group');
		let note = parent.find('.note');
		if( ! note.length)
		{
			parent.append(`<span class="note"></span>`);
			note = parent.find('.note');
			if (dom.data('note') == undefined)
				dom.data('note', false);
		}
		else
		{
			if (dom.data('note') == undefined)
				dom.data('note', note.html());
		}
		return note;
	}

}