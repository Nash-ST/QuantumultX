// ==================== 中国移动APP签到 ====================
// 专为 QuanX 远程资源优化
// 更新时间: 2026.06

const COOKIE_KEY = 'QWHD_SESSION_TOKEN_cmcc';
const SIGN_URL = 'https://wx.10086.cn/website/taskCenter/sign';

// 保存 Cookie
function saveCookie() {
    if (!$response || !$response.headers) return;
    
    const setCookie = $response.headers['Set-Cookie'] || $response.headers['set-cookie'] || '';
    if (!setCookie) return;

    const tokenMatch = setCookie.match(/QWHD_SESSION_TOKEN=([^;]+)/);
    if (!tokenMatch) return;

    const data = {
        cookie: setCookie,
        token: tokenMatch[1],
        savedAt: Math.floor(Date.now() / 1000),
        expiresAt: Math.floor(Date.now() / 1000) + 86400
    };

    $store.put(JSON.stringify(data), COOKIE_KEY);
    console.log('✅ 中国移动 Cookie 保存成功');
    $notification.post('中国移动', 'Cookie 更新成功', 'QWHD_SESSION_TOKEN 已保存');
}

// 执行签到
function doSign() {
    const dataStr = $store.get(COOKIE_KEY);
    if (!dataStr) {
        $notification.post('中国移动签到', '❌ 未找到Cookie', '请先打开APP签到页面获取Cookie');
        return;
    }

    const data = JSON.parse(dataStr);
    const cookie = data.cookie;

    $httpClient.post({
        url: SIGN_URL,
        headers: {
            'Cookie': cookie,
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
            'Content-Type': 'application/json',
            'Referer': 'https://wx.10086.cn/website/taskCenter/index'
        },
        body: '{}'
    }, (err, resp, body) => {
        if (err) {
            $notification.post('中国移动签到', '❌ 请求失败', err.message || '网络错误');
            return;
        }

        const result = body || '';
        if (result.includes('成功') || result.includes('已签到') || (resp && resp.statusCode === 200)) {
            $notification.post('中国移动签到', '✅ 签到成功', '今日已完成签到');
        } else {
            $notification.post('中国移动签到', '⚠️ 签到结果异常', result.substring(0, 150));
        }
    });
}

// ==================== 主逻辑 ====================
if ($request && $response) {
    saveCookie();
} else {
    doSign();
}
