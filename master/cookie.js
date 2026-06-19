/*
中国移动APP Cookie获取脚本 for Quantumult X
重写类型：script-request-header
*/
const cookieName = "中国移动";
const cookieKey = "cmcc_cookie";

// 获取请求头中的Cookie（不区分大小写）
const headers = $request.headers;
let cookieVal = headers['Cookie'] || headers['cookie'] || '';

if (cookieVal) {
    // 判断是否包含有效标识（SSO-KEY 或 ssoKey）
    if (cookieVal.includes('SSO-KEY') || cookieVal.includes('ssoKey')) {
        // 存储Cookie到圈X持久化
        $prefs.setValueForKey(cookieVal, cookieKey);
        $notify(cookieName, "Cookie获取成功 🎉", "已自动存储，可用于签到");
        console.log(`Cookie saved: ${cookieVal.substring(0, 100)}...`);
    } else {
        $notify(cookieName, "Cookie获取失败 ❌", "未检测到SSO-KEY，请重新登录APP");
    }
} else {
    $notify(cookieName, "Cookie获取失败 ❌", "请求头中未包含Cookie");
}

// 必须调用$done，否则会卡脚本
$done({});
