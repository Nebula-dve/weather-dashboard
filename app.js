/* 天气仪表板 —— 数据源：Open-Meteo（免费、无 API Key）
 * 结构：WMO 天气码映射 → fetch 封装 → 数据获取 → 渲染
 */

// ---------------------------------------------------------------------------
// WMO 天气码 → { 中文描述, emoji 图标 }
// ---------------------------------------------------------------------------
const WEATHER_CODES = {
  0:  { desc: "晴",       icon: "☀️" },
  1:  { desc: "基本晴朗", icon: "🌤️" },
  2:  { desc: "局部多云", icon: "⛅" },
  3:  { desc: "阴",       icon: "☁️" },
  45: { desc: "雾",       icon: "🌫️" },
  48: { desc: "雾凇",     icon: "🌫️" },
  51: { desc: "小毛毛雨", icon: "🌦️" },
  53: { desc: "毛毛雨",   icon: "🌦️" },
  55: { desc: "大毛毛雨", icon: "🌧️" },
  56: { desc: "冻毛毛雨", icon: "🌧️" },
  57: { desc: "强冻毛毛雨", icon: "🌧️" },
  61: { desc: "小雨",     icon: "🌦️" },
  63: { desc: "中雨",     icon: "🌧️" },
  65: { desc: "大雨",     icon: "🌧️" },
  66: { desc: "冻雨",     icon: "🌧️" },
  67: { desc: "强冻雨",   icon: "🌧️" },
  71: { desc: "小雪",     icon: "🌨️" },
  73: { desc: "中雪",     icon: "❄️" },
  75: { desc: "大雪",     icon: "❄️" },
  77: { desc: "雪粒",     icon: "🌨️" },
  80: { desc: "小阵雨",   icon: "🌦️" },
  81: { desc: "阵雨",     icon: "🌧️" },
  82: { desc: "强阵雨",   icon: "⛈️" },
  85: { desc: "小阵雪",   icon: "🌨️" },
  86: { desc: "大阵雪",   icon: "❄️" },
  95: { desc: "雷暴",     icon: "⛈️" },
  96: { desc: "雷暴伴小冰雹", icon: "⛈️" },
  99: { desc: "雷暴伴大冰雹", icon: "⛈️" },
};

// 风向度数 → 中文方位
const WIND_DIRS = ["北", "东北", "东", "东南", "南", "西南", "西", "西北"];

function weatherInfo(code) {
  return WEATHER_CODES[code] || { desc: "未知", icon: "🌡️" };
}

function windDirText(deg) {
  if (deg == null) return "--";
  return WIND_DIRS[Math.round(deg / 45) % 8] || "--";
}

function dayOfWeek(dateStr) {
  // 用正午 12:00 解析，避免跨时区时日期落到前一天/后一天的边界问题
  const d = new Date(dateStr + "T12:00:00");
  const names = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return names[d.getDay()] || dateStr;
}

// ---------------------------------------------------------------------------
// fetch 封装（带超时）
// ---------------------------------------------------------------------------
async function fetchJSON(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// 数据获取
// ---------------------------------------------------------------------------
async function searchCity(name) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=8&language=zh&format=json`;
  const data = await fetchJSON(url);
  if (!data.results || data.results.length === 0) {
    throw new Error("未找到该城市，请换个名称试试");
  }
  return data.results;
}

async function getWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "auto",
    forecast_days: "7",
  });
  const url = `https://api.open-meteo.com/v1/forecast?${params}`;
  return fetchJSON(url);
}

// ---------------------------------------------------------------------------
// 渲染
// ---------------------------------------------------------------------------
const $ = (id) => document.getElementById(id);

function setStatus(msg, isError = false) {
  const el = $("status");
  el.textContent = msg;
  el.className = "status" + (isError ? " error" : "");
  el.classList.remove("hidden");
}

function hideStatus() {
  $("status").classList.add("hidden");
}

function renderWeather(data, place) {
  const cur = data.current;
  const info = weatherInfo(cur.weather_code);

  $("weather-icon").textContent = info.icon;
  $("temp").textContent = Math.round(cur.temperature_2m);
  $("desc").textContent = info.desc;
  $("location").textContent = place;

  $("feels").textContent = Math.round(cur.apparent_temperature) + "°C";
  $("humidity").textContent = Math.round(cur.relative_humidity_2m) + "%";
  $("wind").textContent = Math.round(cur.wind_speed_10m) + " km/h";
  $("wind-dir").textContent = windDirText(cur.wind_direction_10m);

  $("current").classList.remove("hidden");
  renderDaily(data.daily);
}

function renderDaily(daily) {
  const list = $("daily-list");
  list.innerHTML = "";

  const today = new Date().toISOString().slice(0, 10);
  daily.time.forEach((dateStr, i) => {
    const info = weatherInfo(daily.weather_code[i]);
    const card = document.createElement("div");
    card.className = "day-card";

    const dow = dateStr === today ? "今天" : dayOfWeek(dateStr);
    const precip = daily.precipitation_probability_max[i];

    card.innerHTML = `
      <div class="dow">${dow}</div>
      <div class="dicon">${info.icon}</div>
      <div class="dmax">${Math.round(daily.temperature_2m_max[i])}°</div>
      <div class="dmin">${Math.round(daily.temperature_2m_min[i])}°</div>
      ${precip != null ? `<div class="dprecip">💧${precip}%</div>` : ""}
    `;
    list.appendChild(card);
  });

  $("daily").classList.remove("hidden");
}

// ---------------------------------------------------------------------------
// 交互流程
// ---------------------------------------------------------------------------
let currentPlace = "";

async function loadCity(lat, lon, place) {
  hideStatus();
  setStatus("正在获取天气…");
  try {
    const data = await getWeather(lat, lon);
    currentPlace = place;
    renderWeather(data, place);
    hideStatus();
  } catch (err) {
    setStatus("获取天气失败：" + err.message + "（请检查网络后重试）", true);
  }
}

async function onSearch() {
  const q = $("city-input").value.trim();
  if (!q) return;

  setStatus("正在搜索城市…");
  try {
    const results = await searchCity(q);
    const r = results[0];
    const place = [r.name, r.admin1, r.country].filter(Boolean).join(" · ");
    $("city-input").value = r.name;
    await loadCity(r.latitude, r.longitude, place);
  } catch (err) {
    setStatus(err.message || "搜索失败，请重试", true);
  }
}

function onLocate() {
  if (!navigator.geolocation) {
    setStatus("当前浏览器不支持定位", true);
    return;
  }
  setStatus("正在定位…");
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      await loadCity(latitude, longitude, "当前位置");
    },
    () => setStatus("定位失败或未授权，请手动搜索城市", true),
    { timeout: 10000, maximumAge: 600000 }
  );
}

// ---------------------------------------------------------------------------
// 启动
// ---------------------------------------------------------------------------
function init() {
  $("search-btn").addEventListener("click", onSearch);
  $("city-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") onSearch();
  });
  $("locate-btn").addEventListener("click", onLocate);

  // 默认加载北京
  loadCity(39.9075, 116.39723, "北京 · 中国");
}

init();
