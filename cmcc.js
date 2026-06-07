// ==================== 中国移动APP签到 ====================
// 作者：Grok优化版
// 更新时间: 2026.06

const COOKIE_KEY = 'QWHD_SESSION_TOKEN_cmcc';
const SIGN_URL = 'https://wx.10086.cn/website/taskCenter/sign';

const now = () => Math.floor(Date.now() / 1000);

// 保存 Cookie
function saveCookie(cookie) {
    if (!cookie) return;
    const token = cookie.match(/QWHD_SESSION_TOKEN=([^;]+)/);
    if (!token) return;

    const data = {
        cookie: cookie,
        token: token[1],
        savedAt: now(),
        expiresAt: now() + 86400
    };
    $store.put(JSON.stringify(data), COOKIE_KEY);
    console.log('✅ 中国移动 Cookie 已保存');
    $notification.post('中国移动', 'Cookie 更新成功', 'Token 已保存');
}

// 执行签到
async function doSign() {
    const dataStr = $store.get(COOKIE_KEY);
    if (!dataStr) {
        $notification.post('中国移动签到', '❌ 失败', '未找到Cookie，请先登录APP抓取');
        return;
    }

    const { cookie } = JSON.parse(dataStr);

    $httpClient.post({
        url: SIGN_URL,
        headers: {
            'Cookie': cookie,
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
            'Content-Type': 'application/json'
        },
        body: '{}'
    }, (err, resp, body) => {
        if (err) {
            $notification.post('中国移动签到', '❌ 请求失败', err.message);
            return;
        }

        if (body.includes('成功') || body.includes('已签到')) {
            $notification.post('中国移动签到', '✅ 签到成功', '获得积分/流量');
        } else {
            $notification.post('中国移动签到', '⚠️ 签到异常', body.substring(0, 100));
        }
    });
}

// ==================== 主逻辑 ====================
if ($request && $response) {
    // 重写模式：自动获取Cookie
    saveCookie($response.headers['Set-Cookie'] || $response.headers['set-cookie']);
} else {
    // 定时任务模式：执行签到
    doSign();
}
