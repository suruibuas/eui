/**
 * eadmin 标签组件
 */

class Tag{	

	static run(dom = null){
		dom = dom == null ? body : $(dom);
		let tag = dom.find('[data-tag]');
		if (tag.length == 0) return;
		tag.each(function(){
			let [_this, v] = [$(this), {
				html : ''
			}];
			v.tag = _.words(_this.data('tag'));
			_.each(v.tag, (val, key) => {
				v.html += `<span class="tag color-${key + 1}">${val}</span>`;
			});
			_this.html(v.html);
		});
	}
	
}