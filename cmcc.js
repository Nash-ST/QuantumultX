// ==================== 配置区 ====================
const COOKIE_KEY_PREFIX = 'QWHD_SESSION_TOKEN_';
const DEFAULT_DOMAIN = 'cmcc';                    // 中国移动

const REFRESH_INTERVAL = 60 * 60;                 // 自动刷新间隔（秒，默认1小时）
const TOKEN_EXPIRE_TIME = 24 * 60 * 60;           // Token 预计有效期（秒，默认24小时）

const SIGN_URL = 'https://wx.10086.cn/website/taskCenter/sign';  // 签到接口（可根据抓包调整）
const SIGN_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
  'Referer': 'https://wx.10086.cn/website/taskCenter/index'
};
// ===============================================

const now = () => Math.floor(Date.now() / 1000);

function getCookieKey(domain = DEFAULT_DOMAIN) {
  return `${COOKIE_KEY_PREFIX}${domain}`;
}

function getCookieFromResponse(resp) {
  if (!resp) return '';
  if (typeof resp === 'string') return resp;

  let cookie = resp.headers?.['Set-Cookie'] || 
               resp.headers?.['set-cookie'] || 
               (Array.isArray(resp.headers?.['Set-Cookie']) ? resp.headers['Set-Cookie'].join('; ') : '');
  return cookie;
}

function extractToken(cookie) {
  if (!cookie || typeof cookie !== 'string') return '';
  const match = cookie.match(/QWHD_SESSION_TOKEN=([^;]+)/);
  return match ? match[1] : '';
}

function saveCookie(cookie, domain = DEFAULT_DOMAIN) {
  try {
    const key = getCookieKey(domain);
    const token = extractToken(cookie);
    if (!token) return false;

    const oldCookie = $store.get(key) || '';
    const oldToken = extractToken(oldCookie);

    if (oldToken === token) return false;

    const data = {
      cookie: cookie,
      token: token,
      domain: domain,
      savedAt: now(),
      expiresAt: now() + TOKEN_EXPIRE_TIME
    };

    $store.put(JSON.stringify(data), key);
    console.log(`✅ 中国移动 Cookie 已更新 [${domain}]`);
    return true;
  } catch (e) {
    console.error('❌ 保存 Cookie 失败:', e.message);
    return false;
  }
}

function getStoredCookie(domain = DEFAULT_DOMAIN) {
  try {
    const key = getCookieKey(domain);
    const dataStr = $store.get(key);
    if (!dataStr) return '';
    const data = JSON.parse(dataStr);
    return data.cookie || '';
  } catch (e) {
    return '';
  }
}

function isTokenExpired(domain = DEFAULT_DOMAIN) {
  try {
    const key = getCookieKey(domain);
    const dataStr = $store.get(key);
    if (!dataStr) return true;
    const data = JSON.parse(dataStr);
    return now() > (data.expiresAt || 0);
  } catch (e) {
    return true;
  }
}

function autoSaveCookie(resp, domain = DEFAULT_DOMAIN) {
  const cookieStr = getCookieFromResponse(resp);
  if (!cookieStr) return false;
  return saveCookie(cookieStr, domain);
}

/** 执行每日签到 */
async function doDailySignIn(domain = DEFAULT_DOMAIN) {
  const cookie = getStoredCookie(domain);
  if (!cookie || isTokenExpired(domain)) {
    console.log('⚠️ Cookie 不存在或已过期，无法签到');
    return false;
  }

  try {
    const token = extractToken(cookie);
    console.log(`🔄 开始中国移动签到 [${domain}]...`);

    const resp = await new Promise((resolve, reject) => {
      $httpClient.post({
        url: SIGN_URL,
        headers: {
          ...SIGN_HEADERS,
          'Cookie': cookie
        },
        body: JSON.stringify({}) // 根据实际接口调整 body
      }, (err, resp, body) => {
        if (err) reject(err);
        else resolve({ resp, body });
      });
    });

    const body = typeof resp.body === 'string' ? resp.body : JSON.stringify(resp.body || {});
    
    if (body.includes('成功') || body.includes('已签到') || resp.status === 200) {
      $.notify('中国移动签到', '✅ 签到成功', '已完成今日签到');
      console.log('🎉 中国移动签到成功');
      return true;
    } else {
      console.log('❌ 签到失败，响应:', body.substring(0, 200));
      return false;
    }
  } catch (e) {
    console.error('❌ 签到异常:', e.message);
    return false;
  }
}

/** 自动刷新 */
async function autoRefreshCookie(domain = DEFAULT_DOMAIN, refreshUrl = null) {
  // ...（与之前版本相同，可根据需要添加具体刷新接口）
  console.log(`🔄 刷新 Cookie [${domain}]`);
  // 实现刷新逻辑...
}

/** 主函数 */
async function main() {
  await doDailySignIn(DEFAULT_DOMAIN);
}

if (typeof $request !== 'undefined' || typeof $response !== 'undefined') {
  // 获取 Cookie 模式
  if ($response) autoSaveCookie($response);
} else {
  // 定时任务模式
  main().catch(console.error);
}

// 导出函数
module.exports = {
  autoSaveCookie,
  getStoredCookie,
  doDailySignIn,
  autoRefreshCookie
};
