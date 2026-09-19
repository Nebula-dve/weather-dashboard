/* 天气仪表板 —— 数据源：Open-Meteo（免费、无 API Key）
 * 结构：映射表 → fetch 封装 → 数据获取 → 收藏 → 渲染 → 交互
 */

// ---------------------------------------------------------------------------
// 常量映射
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

const WIND_DIRS = ["北", "东北", "东", "东南", "南", "西南", "西", "西北"];
const DAY_NAMES = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function weatherInfo(code) {
  return WEATHER_CODES[code] || { desc: "未知", icon: "🌡️" };
}

function windDirText(deg) {
  if (deg == null) return "--";
  return WIND_DIRS[Math.round(deg / 45) % 8] || "--";
}

function dayOfWeek(dateStr) {
  // 用正午 12:00 解析，避免跨时区日期边界问题
  const d = new Date(dateStr + "T12:00:00");
  return DAY_NAMES[d.getDay()] || dateStr;
}

function hourLabel(isoTime) {
  const d = new Date(isoTime);
  return d.getHours() + "时";
}

// US AQI → 中文等级 + 样式类
function aqiLevel(aqi) {
  if (aqi == null) return { level: "--", cls: "" };
  if (aqi <= 50) return { level: "优", cls: "good" };
  if (aqi <= 100) return { level: "良", cls: "moderate" };
  if (aqi <= 150) return { level: "轻度污染", cls: "usg" };
  if (aqi <= 200) return { level: "中度污染", cls: "unhealthy" };
  if (aqi <= 300) return { level: "重度污染", cls: "very-unhealthy" };
  return { level: "严重污染", cls: "hazardous" };
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
    hourly: "temperature_2m,precipitation_probability,weather_code",
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
  $("desc").textContent = info.desc;
  $("location").textContent = place;

  $("feels").textContent = Math.round(cur.apparent_temperature) + "°C";
  $("humidity").textContent = Math.round(cur.relative_humidity_2m) + "%";
  $("wind").textContent = Math.round(cur.wind_speed_10m) + " km/h";
  $("wind-dir").textContent = windDirText(cur.wind_direction_10m);

  $("current").classList.remove("hidden");
  renderHourly(data.hourly);
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

function renderAir(air) {
  if (!air || air.current == null) return;
  const c = air.current;
  const lv = aqiLevel(c.us_aqi);

  $("aqi").textContent = c.us_aqi ?? "--";
  $("aqi-level").textContent = lv.level;
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
  btn.textContent = exists ? "★ 已收藏" : "☆ 收藏";
  btn.classList.toggle("active", exists);
}

// ---------------------------------------------------------------------------
// 交互流程
// ---------------------------------------------------------------------------
let currentPlace = "";
let currentLat = null;
let currentLon = null;

async function loadCity(lat, lon, place) {
  hideStatus();
  setStatus("正在获取天气…");
  currentLat = lat;
  currentLon = lon;
  currentPlace = place;
  try {
    const data = await getWeather(lat, lon);
    renderWeather(data, place);
    hideStatus();
    // 空气质量单独请求，失败不阻塞主流程
    try {
      const air = await getAirQuality(lat, lon);
      renderAir(air);
    } catch {
      $("air").classList.add("hidden");
    }
  } catch (err) {
    setStatus("获取天气失败：" + err.message + "（请检查网络后重试）", true);
  }
  updateFavButton();
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

// ---------------------------------------------------------------------------
// 启动
// ---------------------------------------------------------------------------
function init() {
  $("search-btn").addEventListener("click", onSearch);
  $("city-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") onSearch();
  });
  $("locate-btn").addEventListener("click", onLocate);
  $("fav-btn").addEventListener("click", toggleFavorite);

  renderFavorites();
  // 默认加载北京
  loadCity(39.9075, 116.39723, "北京 · 中国");
}

init();
