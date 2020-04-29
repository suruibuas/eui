/**
 * eadmin 标签组件
 */

class Tag{	

	static run(dom = null){
		dom = dom == null ? body : $(dom);
		let tag = dom.find('[data-tag]');
		if (tag.length == 0) return;
		tag.each(function(){
			let v = {
				this : $(this),
				html : ''
			};
			v.tag = _.words(v.this.data('tag'));
			_.each(v.tag, (val, key) => {
				v.html += `<span class="tag tag-${key}">${val}</span>`;
			});
			v.this.html(v.html);
		});
	}
	
}