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
    kmh: "km/h",
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
    kmh: "km/h",
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
async function searchCity(name) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=8&language=${currentLang === "zh" ? "zh" : "en"}&format=json`;
  const data = await fetchJSON(url);
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

function updateFavButton() {
  const btn = $("fav-btn");
  const exists = getFavorites().some((f) => f.lat === currentLat && f.lon === currentLon);
  btn.textContent = exists ? "★ " + t("faved") : "☆ " + t("fav");
  btn.classList.toggle("active", exists);
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
  // 重绘降水图表，适配新主题的文字颜色
  if (lastWeather) renderRainChart(lastWeather.hourly);
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

function switchLang() {
  currentLang = currentLang === "zh" ? "en" : "zh";
  localStorage.setItem("lang", currentLang);
  applyI18n();
  // 重渲染动态内容以切换语言
  if (lastWeather && currentPlace) {
    renderWeather(lastWeather, currentPlace);
    if (lastAir) renderAir(lastAir);
    renderFavorites();
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
  $("lang-btn").addEventListener("click", switchLang);
  $("theme-btn").addEventListener("click", toggleTheme);

  // 注册 Service Worker（PWA 离线缓存）
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  renderFavorites();
  loadCity(39.9075, 116.39723, "北京 · 中国");
}

init();
