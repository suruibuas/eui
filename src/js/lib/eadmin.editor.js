/**
 * eadmin 编辑器
 */

class Editor{

	constructor(dom, param){
        this.storeKey = md5(Eadmin.currentHref + dom);
        this.dom = dom;
        this.domCache = scope(this.dom);
        this.dom += (new Date()).valueOf();
        if (this.domCache.data('name') == undefined)
        {
            console.log('请为富文本编辑框指定data-name属性，用来后端取值');
            return false;
        }
        let _default = this.domCache.html();
        this.domCache.
            attr('id', this.dom.replace('#', '')).
            data('store', this.storeKey).
            addClass('editor').
            after(`<input type="hidden" name="${this.domCache.data('name')}">`);
		// 默认参数
		let _param   = {
            // 编辑器名称，后端取值保存数据库使用
            name : 'editor',
			// 编辑器高度
            height   : 300,
            // 是否只读
            readonly : false,
            // 设置默认显示文案
            placeholder : '请输入内容...',
            // 允许的图片格式
            doc : ['.jpg', '.png', '.jpeg', '.gif'],
            // 允许的图片大小，单位KB
            size : 1000,
            // 文件上传接口地址
            api : 'upload.php',
            // 文件域名称，上传文件后端取值用
            filename  : 'file',
            // 是否自动保存输入内容
            autosave  : false,
            // 自动保存时间间隔
            savetime : 3
		}
		// 配置参数
        this.param = $.extend(true, _param, param);
		if (this.param.api == '')
		{
			console.log('请指定后端接收上传数据的API地址');
			return;
		}
		// 拼接接口
        if ( ! _.startsWith(this.param.api, 'http'))
		    this.param.api = module.conf.http.baseURL + this.param.api;
        this.domCache.css('min-height', this.param.height).after(`<input class="dn" type="file" accept="image/*">`);
        if (_default == '')
        {
            let content = store(this.storeKey);
            if (content != undefined)
                this.domCache.html(content);
        }
        this.quill = null;
		this.create();
    }

    /**
     * 创建编辑器
     */
    create()
    {
        let options = [
            [
                'bold', 'italic', 'underline', 'strike',
                {'header' : [1, 2, 3, 4, 5, 6, false]}
            ],
            [
                {'size' : ['small', false, 'large', 'huge']}
            ],
            [
                {'color' : []},
                {'background' : []}
            ],
            [
                'blockquote', 'code-block'
            ],
            [
                {'list' : 'ordered'},
                {'list' : 'bullet'}
            ],
            [
                {'indent' : '-1'},
                {'indent' : '+1'}
            ],
            [
                {'align' : []}
            ],        
            [
                {'direction' : 'rtl'}
            ],
            [
                'clean', 'link', 'image', 'video'
            ]
        ];
        this.quill = new Quill(this.dom, {
            theme : 'snow',
            modules : {
                toolbar : options
            },
            placeholder : this.param.placeholder,
            readOnly : this.param.readonly
        });
        this.domCache.
            next().
            next("input[type='hidden']").
            val(this.quill.root.innerHTML);
        let file = this.domCache.next("input[type='file']");
        this.quill.
            getModule('toolbar').
            addHandler('image', () => {
                file.val('').trigger('click');
            });
        let that = this;
        file.on('change', function(e){
            let file = e.target.files[0];
            // 校验格式
            let type = file.type.replace(/image\//, '.');
            if (that.param.doc.indexOf(type) == -1)
            {
                Eadmin.message.error({
                    content : '图片格式不允许，上传失败'
                });
                return;
            }
            // 校验大小
            that.param.size *= 1000;
            if (file.size > that.param.size)
            {
                Eadmin.message.error({
                    content : '图片大小超出限制，上传失败'
                });
                return;
            }
            let form = new FormData();
            form.append(that.param.filename, file, file.name);
            module.conf.http.headers['Content-Type'] = 'multipart/form-data';
            Eadmin.post({
                url  : that.param.api,
                form : form,
                then : (data) => {
                    let range = that.quill.getSelection();
                    let newRange = 0 + (range !== null ? range.index : 0);
                    that.quill.insertEmbed(newRange, 'image', data.pic);
                    that.quill.setSelection(1 + newRange);
                }
            });
        });
        if ( ! this.param.autosave)
            return;
        this.quill.on('text-change', _.debounce(() => {
            store(this.storeKey, this.quill.root.innerHTML);
            Eadmin.message.info({
                content : '编辑内容已实时保存至本地'
            });
        }, this.param.savetime * 1000));
        this.quill.on('text-change', () => {
            this.domCache.
                next().
                next("input[type='hidden']").
                val(this.quill.root.innerHTML);
        });
    }
	
}