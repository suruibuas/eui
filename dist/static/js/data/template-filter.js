/**
 * 模版数据过滤器
 */

// 时间戳格式化
template.defaults.imports.
    dateFormat = (time, format) => {
        return Time(time, format);
    }