/**
 * eadmin 状态组件
 */

class Status{	

	/**
	 * 状态
	 */
	static run(dom = null){
		dom = dom == null ? body : $(dom);
		let status = dom.find('[data-status]');
		if (status.length == 0) 
			return;
		// 处理状态标签
		status.each(function() {
			let v = {
				this : $(this)
			};
			v.status = v.this.data('status');
			if ( ! _.isInteger(v.status) || v.status > 7)
			{
				console.log('状态码必须在0-7之间');
				return true;
			}
			v.this.
				addClass('status').
				prepend(`<i class="status-${v.status}"></i>`);
		});
	}
	
}