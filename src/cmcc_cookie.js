/*
中国移动APP Cookie获取脚本
适用：Quantumult X
触发方式：打开中国移动APP，进入"我的"页面
*/

const $ = new Env("中国移动Cookie");

// 定义Cookie名称
const cookieName = "中国移动";
const cookieKey = "cmcc_cookie";
const cookieVal = $request.headers['Cookie'] || $request.headers['cookie'];

if (cookieVal) {
    // 提取关键Cookie字段
    let cookie = cookieVal;
    
    // 如果包含多个Cookie，提取关键部分
    if (cookie.includes('SSO-KEY') || cookie.includes('ssoKey')) {
        if ($.isQuanX()) {
            $.setdata(cookie, cookieKey);
            $.msg(cookieName, "Cookie获取成功 🎉", "已更新存储");
            $.log(`Cookie: ${cookie.substring(0, 100)}...`);
        }
    } else {
        $.msg(cookieName, "Cookie获取失败 ❌", "未检测到有效Cookie，请重新登录APP");
    }
} else {
    $.msg(cookieName, "Cookie获取失败 ❌", "未获取到Cookie，请检查配置");
}

$.done();

// 通用环境函数
function Env(name) {
    // ... (使用圈X标准Env函数)
    return new class {
        constructor(name) {
            this.name = name;
        }
        
        isQuanX() {
            return typeof $task !== "undefined";
        }
        
        setdata(val, key) {
            if (this.isQuanX()) {
                $prefs.setValueForKey(val, key);
            }
        }
        
        getdata(key) {
            if (this.isQuanX()) {
                return $prefs.valueForKey(key);
            }
        }
        
        msg(title, subtitle, message) {
            if (this.isQuanX()) {
                $notify(title, subtitle, message);
            }
        }
        
        log(message) {
            console.log(message);
        }
        
        done() {
            $done({});
        }
    }(name);
}
