/* 天气仪表板 —— 数据源：Open-Meteo（免费、无 API Key）
 * 功能：当前天气 / 24小时 / 7天 / 空气质量 / 降水图表 / 多语言 / 深浅主题 / PWA
 */

// ---------------------------------------------------------------------------
// 多语言 i18n
// ---------------------------------------------------------------------------
const I18N = {
  zh: {
    appTitle: "天气仪表板", searchPlaceholder: "搜索城市，如：北京 / London",
    search: "搜索", loading: "正在加载…", loadingWeather: "正在获取天气…",
    searchingCity: "正在搜索城市…", locating: "正在定位…",
    feelsLike: "体感", humidity: "湿度", wind: "风速", windDir: "风向",
    airQuality: "空气质量", aqi: "AQI", favoriteCities: "收藏城市",
    next24h: "未来 24 小时", next7d: "未来 7 天", today: "今天",
    fav: "收藏", faved: "已收藏", rainChart: "未来 24 小时降水量",
    dataSource: "数据来源", freeOpenData: "免费开放数据", noApiKey: "无 API Key",
    cityNotFound: "未找到该城市，请换个名称试试",
    weatherFail: "获取天气失败：", retryNetwork: "（请检查网络后重试）",
    searchFail: "搜索失败，请重试", geoUnsupported: "当前浏览器不支持定位",
    geoDenied: "定位失败或未授权，请手动搜索城市", currentLocation: "当前位置",
    kmh: "km/h", compare: "城市对比", addCompare: "对比", remove: "移除",
  },
  en: {
    appTitle: "Weather Dashboard", searchPlaceholder: "Search city, e.g. Beijing",
    search: "Search", loading: "Loading…", loadingWeather: "Fetching weather…",
    searchingCity: "Searching city…", locating: "Locating…",
    feelsLike: "Feels like", humidity: "Humidity", wind: "Wind", windDir: "Wind dir",
    airQuality: "Air Quality", aqi: "AQI", favoriteCities: "Favorite Cities",
    next24h: "Next 24 Hours", next7d: "7-Day Forecast", today: "Today",
    fav: "Save", faved: "Saved", rainChart: "24-Hour Precipitation",
    dataSource: "Data source", freeOpenData: "Free open data", noApiKey: "No API key",
    cityNotFound: "City not found, try another name",
    weatherFail: "Failed to fetch weather: ", retryNetwork: "(check your network and retry)",
    searchFail: "Search failed, retry", geoUnsupported: "Geolocation not supported",
    geoDenied: "Location failed or denied, search manually", currentLocation: "Current location",
    kmh: "km/h", compare: "Compare Cities", addCompare: "Compare", remove: "Remove",
  },
};

let currentLang = (() => {
  const saved = localStorage.getItem("lang");
  if (saved === "zh" || saved === "en") return saved;
  return navigator.language && navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
})();

function t(key) {
  return I18N[currentLang][key] ?? I18N.zh[key] ?? key;
}

function applyI18n() {
  document.documentElement.lang = currentLang === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPh);
  });
  $("lang-btn").textContent = currentLang === "zh" ? "EN" : "中";
  document.title = t("appTitle");
}

// ---------------------------------------------------------------------------
// 常量映射（双语）
// ---------------------------------------------------------------------------
const WEATHER_CODES = {
  0:  { desc: { zh: "晴", en: "Clear" }, icon: "☀️" },
  1:  { desc: { zh: "基本晴朗", en: "Mostly clear" }, icon: "🌤️" },
  2:  { desc: { zh: "局部多云", en: "Partly cloudy" }, icon: "⛅" },
  3:  { desc: { zh: "阴", en: "Overcast" }, icon: "☁️" },
  45: { desc: { zh: "雾", en: "Fog" }, icon: "🌫️" },
  48: { desc: { zh: "雾凇", en: "Rime fog" }, icon: "🌫️" },
  51: { desc: { zh: "小毛毛雨", en: "Light drizzle" }, icon: "🌦️" },
  53: { desc: { zh: "毛毛雨", en: "Drizzle" }, icon: "🌦️" },
  55: { desc: { zh: "大毛毛雨", en: "Dense drizzle" }, icon: "🌧️" },
  56: { desc: { zh: "冻毛毛雨", en: "Freezing drizzle" }, icon: "🌧️" },
  57: { desc: { zh: "强冻毛毛雨", en: "Dense freezing drizzle" }, icon: "🌧️" },
  61: { desc: { zh: "小雨", en: "Light rain" }, icon: "🌦️" },
  63: { desc: { zh: "中雨", en: "Rain" }, icon: "🌧️" },
  65: { desc: { zh: "大雨", en: "Heavy rain" }, icon: "🌧️" },
  66: { desc: { zh: "冻雨", en: "Freezing rain" }, icon: "🌧️" },
  67: { desc: { zh: "强冻雨", en: "Heavy freezing rain" }, icon: "🌧️" },
  71: { desc: { zh: "小雪", en: "Light snow" }, icon: "🌨️" },
  73: { desc: { zh: "中雪", en: "Snow" }, icon: "❄️" },
  75: { desc: { zh: "大雪", en: "Heavy snow" }, icon: "❄️" },
  77: { desc: { zh: "雪粒", en: "Snow grains" }, icon: "🌨️" },
  80: { desc: { zh: "小阵雨", en: "Light showers" }, icon: "🌦️" },
  81: { desc: { zh: "阵雨", en: "Showers" }, icon: "🌧️" },
  82: { desc: { zh: "强阵雨", en: "Violent showers" }, icon: "⛈️" },
  85: { desc: { zh: "小阵雪", en: "Light snow showers" }, icon: "🌨️" },
  86: { desc: { zh: "大阵雪", en: "Heavy snow showers" }, icon: "❄️" },
  95: { desc: { zh: "雷暴", en: "Thunderstorm" }, icon: "⛈️" },
  96: { desc: { zh: "雷暴伴小冰雹", en: "T-storm, light hail" }, icon: "⛈️" },
  99: { desc: { zh: "雷暴伴大冰雹", en: "T-storm, heavy hail" }, icon: "⛈️" },
};

const WIND_DIRS = {
  zh: ["北", "东北", "东", "东南", "南", "西南", "西", "西北"],
  en: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"],
};
const DAY_NAMES = {
  zh: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

function weatherInfo(code) {
  return WEATHER_CODES[code] || { desc: { zh: "未知", en: "Unknown" }, icon: "🌡️" };
}

function windDirText(deg) {
  if (deg == null) return "--";
  return WIND_DIRS[currentLang][Math.round(deg / 45) % 8] || "--";
}

function dayOfWeek(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return DAY_NAMES[currentLang][d.getDay()] || dateStr;
}

function hourLabel(isoTime) {
  return new Date(isoTime).getHours() + ":00";
}

function aqiLevel(aqi) {
  if (aqi == null) return { level: { zh: "--", en: "--" }, cls: "" };
  if (aqi <= 50) return { level: { zh: "优", en: "Good" }, cls: "good" };
  if (aqi <= 100) return { level: { zh: "良", en: "Moderate" }, cls: "moderate" };
  if (aqi <= 150) return { level: { zh: "轻度污染", en: "Unhealthy for sensitive" }, cls: "usg" };
  if (aqi <= 200) return { level: { zh: "中度污染", en: "Unhealthy" }, cls: "unhealthy" };
  if (aqi <= 300) return { level: { zh: "重度污染", en: "Very unhealthy" }, cls: "very-unhealthy" };
  return { level: { zh: "严重污染", en: "Hazardous" }, cls: "hazardous" };
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
// 中文名 → 英文名 别名表：解决中文地理编码的同名干扰与缺失（覆盖省会 + 世界主要城市）
const CITY_ALIASES = {
  北京: "Beijing", 上海: "Shanghai", 天津: "Tianjin", 重庆: "Chongqing",
  香港: "Hong Kong", 澳门: "Macau", 台北: "Taipei",
  石家庄: "Shijiazhuang", 太原: "Taiyuan", 呼和浩特: "Hohhot", 沈阳: "Shenyang",
  长春: "Changchun", 哈尔滨: "Harbin", 南京: "Nanjing", 杭州: "Hangzhou",
  合肥: "Hefei", 福州: "Fuzhou", 南昌: "Nanchang", 郑州: "Zhengzhou",
  武汉: "Wuhan", 长沙: "Changsha", 广州: "Guangzhou", 南宁: "Nanning",
  海口: "Haikou", 成都: "Chengdu", 贵阳: "Guiyang", 昆明: "Kunming",
  拉萨: "Lhasa", 西安: "Xi'an", 兰州: "Lanzhou", 西宁: "Xining",
  银川: "Yinchuan", 乌鲁木齐: "Urumqi", 济南: "Jinan", 苏州: "Suzhou",
  深圳: "Shenzhen", 青岛: "Qingdao", 大连: "Dalian", 厦门: "Xiamen",
  东京: "Tokyo", 首尔: "Seoul", 平壤: "Pyongyang", 莫斯科: "Moscow",
  伦敦: "London", 巴黎: "Paris", 柏林: "Berlin", 罗马: "Rome",
  马德里: "Madrid", 阿姆斯特丹: "Amsterdam", 维也纳: "Vienna", 布拉格: "Prague",
  华沙: "Warsaw", 斯德哥尔摩: "Stockholm", 哥本哈根: "Copenhagen", 奥斯陆: "Oslo",
  赫尔辛基: "Helsinki", 布鲁塞尔: "Brussels", 都柏林: "Dublin", 里斯本: "Lisbon",
  雅典: "Athens", 苏黎世: "Zurich", 日内瓦: "Geneva", 布达佩斯: "Budapest",
  基辅: "Kyiv", 纽约: "New York", 洛杉矶: "Los Angeles", 旧金山: "San Francisco",
  芝加哥: "Chicago", 华盛顿: "Washington", 西雅图: "Seattle", 波士顿: "Boston",
  多伦多: "Toronto", 温哥华: "Vancouver", 悉尼: "Sydney", 墨尔本: "Melbourne",
  新加坡: "Singapore", 曼谷: "Bangkok", 迪拜: "Dubai", 伊斯坦布尔: "Istanbul",
  开罗: "Cairo", 圣保罗: "São Paulo", 里约热内卢: "Rio de Janeiro",
  墨西哥城: "Mexico City", 孟买: "Mumbai", 新德里: "New Delhi", 雅加达: "Jakarta",
  吉隆坡: "Kuala Lumpur", 马尼拉: "Manila", 河内: "Hanoi", 雷克雅未克: "Reykjavik",
};

async function searchCity(name) {
  const q = name.trim();
  const bare = q.replace(/(市|省|特别行政区|自治区|地区)$/, "");
  const alias = CITY_ALIASES[q] || CITY_ALIASES[bare];

  const geocode = (term, lang) =>
    fetchJSON(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(term)}&count=8&language=${lang}&format=json`);

  // 1) 别名命中 → 直接用英文名搜（最准，避开同名干扰）
  if (alias) {
    const data = await geocode(alias, "en");
    if (data.results && data.results.length > 0) return data.results;
  }

  // 2) 正常搜索（当前语言）
  let data = await geocode(q, currentLang === "zh" ? "zh" : "en");
  // 3) 中文无结果 → 英文兜底
  if ((!data.results || data.results.length === 0) && currentLang === "zh") {
    data = await geocode(q, "en");
  }

  if (!data.results || data.results.length === 0) {
    throw new Error(t("cityNotFound"));
  }
  return data.results;
}

async function getWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m",
    hourly: "temperature_2m,precipitation_probability,weather_code,precipitation",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "auto",
    forecast_days: "7",
    forecast_hours: "24",
  });
  const url = `https://api.open-meteo.com/v1/forecast?${params}`;
  return fetchJSON(url);
}

async function getAirQuality(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: "us_aqi,pm2_5,pm10",
    timezone: "auto",
  });
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?${params}`;
  return fetchJSON(url);
}

// ---------------------------------------------------------------------------
// 收藏（localStorage）
// ---------------------------------------------------------------------------
const FAV_KEY = "weather-favorites";

function getFavorites() {
  try {
    const list = JSON.parse(localStorage.getItem(FAV_KEY));
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
function saveFavorites(list) {
  localStorage.setItem(FAV_KEY, JSON.stringify(list));
}

// 对比集合（localStorage）
const COMPARE_KEY = "weather-compare";
function getCompare() {
  try {
    const list = JSON.parse(localStorage.getItem(COMPARE_KEY));
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
function saveCompare(list) {
  localStorage.setItem(COMPARE_KEY, JSON.stringify(list));
}

// ---------------------------------------------------------------------------
// 渲染
// ---------------------------------------------------------------------------
const $ = (id) => document.getElementById(id);

// 天气感知背景：按天气大类 + 主题返回渐变配色
function weatherPalette(code) {
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  const P = (d, l) => (isLight ? l : d);
  if (code <= 1) return P({ from: "#1e3a5f", to: "#2a5298" }, { from: "#60a5fa", to: "#93c5fd" }); // 晴
  if (code === 2) return P({ from: "#243b55", to: "#33415c" }, { from: "#93c5fd", to: "#cbd5e1" }); // 多云
  if (code === 3) return P({ from: "#334155", to: "#475569" }, { from: "#94a3b8", to: "#cbd5e1" }); // 阴
  if (code === 45 || code === 48) return P({ from: "#3f3f46", to: "#52525b" }, { from: "#a8a29e", to: "#d6d3d1" }); // 雾
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return P({ from: "#1e293b", to: "#334155" }, { from: "#64748b", to: "#94a3b8" }); // 雨
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return P({ from: "#475569", to: "#64748b" }, { from: "#cbd5e1", to: "#e2e8f0" }); // 雪
  if (code >= 95) return P({ from: "#18181b", to: "#3f3f46" }, { from: "#6b7280", to: "#9ca3af" }); // 雷暴
  return P({ from: "#1e3a5f", to: "#2a5298" }, { from: "#60a5fa", to: "#93c5fd" });
}
function applyWeatherBackground(code) {
  const p = weatherPalette(code);
  const root = document.documentElement.style;
  root.setProperty("--bg-from", p.from);
  root.setProperty("--bg-to", p.to);
}

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
  applyWeatherBackground(cur.weather_code);

  $("weather-icon").textContent = info.icon;
  $("temp").textContent = Math.round(cur.temperature_2m);
  $("desc").textContent = info.desc[currentLang];
  $("location").textContent = place;

  $("feels").textContent = Math.round(cur.apparent_temperature) + "°C";
  $("humidity").textContent = Math.round(cur.relative_humidity_2m) + "%";
  $("wind").textContent = Math.round(cur.wind_speed_10m) + " " + t("kmh");
  $("wind-dir").textContent = windDirText(cur.wind_direction_10m);

  $("current").classList.remove("hidden");
  renderHourly(data.hourly);
  renderRainChart(data.hourly);
  renderDaily(data.daily);
}

function renderHourly(hourly) {
  const list = $("hourly-list");
  list.innerHTML = "";

  hourly.time.forEach((time, i) => {
    const info = weatherInfo(hourly.weather_code[i]);
    const precip = hourly.precipitation_probability[i];
    const card = document.createElement("div");
    card.className = "hour-card";
    card.innerHTML = `
      <div class="h-time">${hourLabel(time)}</div>
      <div class="h-icon">${info.icon}</div>
      <div class="h-temp">${Math.round(hourly.temperature_2m[i])}°</div>
      ${precip != null ? `<div class="h-precip">💧${precip}%</div>` : ""}
    `;
    list.appendChild(card);
  });

  $("hourly").classList.remove("hidden");
}

function renderRainChart(hourly) {
  const section = $("rain");
  const canvas = $("rain-chart");
  const data = hourly.precipitation || [];
  if (data.length === 0) {
    section.classList.add("hidden");
    return;
  }
  section.classList.remove("hidden");

  // 响应式宽度（显示后再取 clientWidth）
  canvas.width = canvas.clientWidth || 600;
  canvas.height = 120;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const max = Math.max(...data, 0.1);
  const barW = w / data.length;
  const textColor = getComputedStyle(document.documentElement).getPropertyValue("--text").trim() || "#f5f7fa";

  data.forEach((v, i) => {
    const bh = (v / max) * (h - 26);
    ctx.fillStyle = "rgba(96, 165, 250, 0.85)";
    ctx.fillRect(i * barW + 1, h - bh - 12, barW - 2, bh);
    if (i % 4 === 0) {
      ctx.fillStyle = textColor;
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(hourLabel(hourly.time[i]), i * barW + barW / 2, h - 2);
    }
  });
}

function renderAir(air) {
  if (!air || air.current == null) return;
  const c = air.current;
  const lv = aqiLevel(c.us_aqi);

  $("aqi").textContent = c.us_aqi ?? "--";
  $("aqi-level").textContent = lv.level[currentLang];
  $("aqi-level").className = "air-level " + lv.cls;
  $("pm25").textContent = (c.pm2_5 != null ? Math.round(c.pm2_5) : "--") + " μg/m³";
  $("pm10").textContent = (c.pm10 != null ? Math.round(c.pm10) : "--") + " μg/m³";

  $("air").classList.remove("hidden");
}

function renderDaily(daily) {
  const list = $("daily-list");
  list.innerHTML = "";

  const today = new Date().toISOString().slice(0, 10);
  daily.time.forEach((dateStr, i) => {
    const info = weatherInfo(daily.weather_code[i]);
    const card = document.createElement("div");
    card.className = "day-card";

    const dow = dateStr === today ? t("today") : dayOfWeek(dateStr);
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

function renderFavorites() {
  const list = $("fav-list");
  const favs = getFavorites();
  list.innerHTML = "";

  if (favs.length === 0) {
    $("favorites").classList.add("hidden");
    return;
  }

  favs.forEach((fav) => {
    const chip = document.createElement("button");
    chip.className = "fav-chip";
    chip.textContent = fav.name;
    chip.title = fav.place;
    chip.addEventListener("click", () => loadCity(fav.lat, fav.lon, fav.place));
    list.appendChild(chip);
  });

  $("favorites").classList.remove("hidden");
}

async function renderCompare() {
  const list = getCompare();
  const container = $("compare-list");
  container.innerHTML = "";

  if (list.length === 0) {
    $("compare").classList.add("hidden");
    return;
  }
  $("compare").classList.remove("hidden");

  await Promise.all(list.map(async (city) => {
    try {
      const data = await getWeather(city.lat, city.lon);
      const cur = data.current;
      const info = weatherInfo(cur.weather_code);
      const card = document.createElement("div");
      card.className = "compare-card";
      card.innerHTML = `
        <div class="c-head">
          <span class="c-name">${city.name}</span>
          <button class="c-remove" data-lat="${city.lat}" data-lon="${city.lon}" title="${t("remove")}">×</button>
        </div>
        <div class="c-icon">${info.icon}</div>
        <div class="c-temp">${Math.round(cur.temperature_2m)}°C</div>
        <div class="c-desc">${info.desc[currentLang]}</div>
        <div class="c-meta">
          <span>↑${Math.round(data.daily.temperature_2m_max[0])}°</span>
          <span>↓${Math.round(data.daily.temperature_2m_min[0])}°</span>
          <span>💧${Math.round(cur.relative_humidity_2m)}%</span>
        </div>
      `;
      container.appendChild(card);
    } catch {
      // 忽略单个城市失败
    }
  }));

  container.querySelectorAll(".c-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lat = parseFloat(btn.dataset.lat);
      const lon = parseFloat(btn.dataset.lon);
      saveCompare(getCompare().filter((c) => !(c.lat === lat && c.lon === lon)));
      renderCompare();
      updateFavButton();
    });
  });
}

function updateFavButton() {
  const btn = $("fav-btn");
  const exists = getFavorites().some((f) => f.lat === currentLat && f.lon === currentLon);
  btn.textContent = exists ? "★ " + t("faved") : "☆ " + t("fav");
  btn.classList.toggle("active", exists);

  const cbtn = $("compare-btn");
  const cexists = getCompare().some((c) => c.lat === currentLat && c.lon === currentLon);
  cbtn.textContent = (cexists ? "✓ " : "＋ ") + t("addCompare");
  cbtn.classList.toggle("active", cexists);
}

// ---------------------------------------------------------------------------
// 主题
// ---------------------------------------------------------------------------
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  $("theme-btn").textContent = theme === "dark" ? "☀️" : "🌙";
}
function initTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "dark" || saved === "light") {
    applyTheme(saved);
    return;
  }
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute("data-theme");
  const next = cur === "dark" ? "light" : "dark";
  localStorage.setItem("theme", next);
  applyTheme(next);
  // 重绘降水图表 + 重设天气背景，适配新主题
  if (lastWeather) {
    applyWeatherBackground(lastWeather.current.weather_code);
    renderRainChart(lastWeather.hourly);
  }
}

// ---------------------------------------------------------------------------
// 交互流程
// ---------------------------------------------------------------------------
let currentPlace = "";
let currentLat = null;
let currentLon = null;
let lastWeather = null;
let lastAir = null;

async function loadCity(lat, lon, place) {
  hideStatus();
  setStatus(t("loadingWeather"));
  currentLat = lat;
  currentLon = lon;
  currentPlace = place;
  try {
    const data = await getWeather(lat, lon);
    lastWeather = data;
    renderWeather(data, place);
    hideStatus();
    try {
      const air = await getAirQuality(lat, lon);
      lastAir = air;
      renderAir(air);
    } catch {
      $("air").classList.add("hidden");
    }
  } catch (err) {
    setStatus(t("weatherFail") + err.message + t("retryNetwork"), true);
  }
  updateFavButton();
}

async function onSearch() {
  const q = $("city-input").value.trim();
  if (!q) return;

  setStatus(t("searchingCity"));
  try {
    const results = await searchCity(q);
    const r = results[0];
    const place = [r.name, r.admin1, r.country].filter(Boolean).join(" · ");
    $("city-input").value = r.name;
    await loadCity(r.latitude, r.longitude, place);
  } catch (err) {
    setStatus(err.message || t("searchFail"), true);
  }
}

function onLocate() {
  if (!navigator.geolocation) {
    setStatus(t("geoUnsupported"), true);
    return;
  }
  setStatus(t("locating"));
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      await loadCity(latitude, longitude, t("currentLocation"));
    },
    () => setStatus(t("geoDenied"), true),
    { timeout: 10000, maximumAge: 600000 }
  );
}

function toggleFavorite() {
  if (currentLat == null || currentLon == null) return;
  let favs = getFavorites();
  const idx = favs.findIndex((f) => f.lat === currentLat && f.lon === currentLon);

  if (idx >= 0) {
    favs.splice(idx, 1);
  } else {
    favs.unshift({ name: $("city-input").value || currentPlace, lat: currentLat, lon: currentLon, place: currentPlace });
  }
  saveFavorites(favs);
  updateFavButton();
  renderFavorites();
}

function toggleCompare() {
  if (currentLat == null || currentLon == null) return;
  let list = getCompare();
  const idx = list.findIndex((c) => c.lat === currentLat && c.lon === currentLon);

  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    if (list.length >= 5) return; // 最多 5 个城市同屏对比
    list.push({ name: $("city-input").value || currentPlace, lat: currentLat, lon: currentLon, place: currentPlace });
  }
  saveCompare(list);
  updateFavButton();
  renderCompare();
}

function switchLang() {
  currentLang = currentLang === "zh" ? "en" : "zh";
  localStorage.setItem("lang", currentLang);
  applyI18n();
  // 重渲染动态内容以切换语言
  if (lastWeather && currentPlace) {
    renderWeather(lastWeather, currentPlace);
    if (lastAir) renderAir(lastAir);
    renderFavorites();
    renderCompare();
    updateFavButton();
  }
}

// ---------------------------------------------------------------------------
// 启动
// ---------------------------------------------------------------------------
function init() {
  initTheme();
  applyI18n();

  $("search-btn").addEventListener("click", onSearch);
  $("city-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") onSearch();
  });
  $("locate-btn").addEventListener("click", onLocate);
  $("fav-btn").addEventListener("click", toggleFavorite);
  $("compare-btn").addEventListener("click", toggleCompare);
  $("lang-btn").addEventListener("click", switchLang);
  $("theme-btn").addEventListener("click", toggleTheme);

  // 注册 Service Worker（PWA 离线缓存）
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  renderFavorites();
  renderCompare();
  loadCity(39.9075, 116.39723, "北京 · 中国");
}

init();
