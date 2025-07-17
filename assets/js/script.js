"use strict";

const API_URL = "https://api.openweathermap.org/data/2.5/weather";
const GEO_URL = "https://api.openweathermap.org/geo/1.0/direct";
const API_KEY = "6a3f20e80fe679f2cea25fb3f4463348";

const card = document.querySelector(".weather-card");
const cityInput = document.getElementById("cityInput");
const suggestionsList = document.getElementById("suggestions");

let abortCtrl; // lets us cancel previous fetches
let active = -1; // keyboard‑focused item index

// ─────────────────────────────────────────────
// Debounce helper (wait 300 ms after typing)
// ─────────────────────────────────────────────

const debounce = (fn, ms = 300) => {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), ms);
    };
};

// ─────────────────────────────────────────────
// Fetch matching cities
// ─────────────────────────────────────────────

const fetchCities = async (q) => {
    if (abortCtrl) abortCtrl.abort();
    abortCtrl = new AbortController();
    const url = `${GEO_URL}?q=${encodeURIComponent(
        q
    )}&limit=5&appid=${API_KEY}`;
    const res = await fetch(url, { signal: abortCtrl.signal });
    return res.ok ? res.json() : [];
};

// ─────────────────────────────────────────────
// Render dropdown
// ─────────────────────────────────────────────

const renderOptions = (cities) => {
    active = -1;
    suggestionsList.innerHTML = "";
    if (!cities.length) return;

    cities.forEach((c) => {
        const li = document.createElement("li");
        li.className = "city-list-item";
        li.textContent = `${c.name}, ${c.country}${
            c.state ? " (" + c.state + ")" : ""
        }`;
        li.dataset.lat = c.lat;
        li.dataset.lon = c.lon;
        li.onclick = () => choose(li);
        suggestionsList.appendChild(li);
    });
};

// ─────────────────────────────────────────────
// Choose a city (click or ↵)
// ─────────────────────────────────────────────
function choose(li) {
    cityInput.value = li.textContent;
    suggestionsList.innerHTML = "";
    // Use lat/lon for weather (more reliable than name duplicates)
    getWeatherDataByCoords(li.dataset.lat, li.dataset.lon);
}

// ─────────────────────────────────────────────
// Keyboard navigation (↑ ↓ ↵ Esc)
// ─────────────────────────────────────────────

cityInput.addEventListener("keydown", (e) => {
    const items = [...suggestionsList.children];
    if (!items.length) return;

    switch (e.key) {
        case "ArrowDown":
            active = (active + 1) % items.length;
            break;
        case "ArrowUp":
            active = (active - 1 + items.length) % items.length;
            break;
        case "Escape":
            suggestionsList.innerHTML = "";
            return;
        default:
            return;
    }

    items.forEach((li, i) => li.classList.toggle("active-list", i === active));
});

// ─────────────────────────────────────────────
// Input listener (debounced)
// ─────────────────────────────────────────────

cityInput.addEventListener(
    "input",
    debounce(async () => {
        const q = cityInput.value.trim();
        if (q.length < 2) return (suggestionsList.innerHTML = "");
        renderOptions(await fetchCities(q));
    })
);

// ─────────────────────────────────────────────
// Fetch weather by Coords and update UI
// ─────────────────────────────────────────────
async function getWeatherDataByCoords(lat, lon) {
    const url = `${API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const res = await fetch(url);
    const data = await res.json();
    render(data);
}

// ──────────────────────────────────────────
// 1. Fetch weather (either by city or coords)
// ──────────────────────────────────────────
const fetchWeather = async function ({ city, lat, lon }) {
    const url = city
        ? `${API_URL}?q=${encodeURIComponent(
              city
          )}&appid=${API_KEY}&units=metric`
        : `${API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather fetch failed");

    return res.json();
};

// ──────────────────────────────────────────
// 2. Render
// ──────────────────────────────────────────
const render = function (data) {
    const weatherType = data.weather?.at(0).main.toLowerCase();

    card.querySelector(".city").textContent = data.name;
    card.querySelector(".temp").textContent = `${Math.round(
        data.main.temp
    )} °C`;
    card.querySelector(".wind").textContent = `${data.wind.speed} km/h`;
    card.querySelector(".humidity").textContent = `${data.main.humidity}%`;
    card.querySelector(
        ".weather-icon"
    ).src = `assets/images/${weatherType}.png`;

    card.querySelector(".weather").style.opacity = 1;
};

// ──────────────────────────────────────────
// Manual search
// ──────────────────────────────────────────
card.addEventListener("click", async (e) => {
    if (!e.target.closest("#searchButton")) return;
    e.preventDefault();

    const city = cityInput.value.trim();
    if (!city) return;

    try {
        render(await fetchWeather({ city }));
    } catch (err) {
        console.error("City not found!");
    }
});

// ──────────────────────────────────────────
// 4. Auto‑detect location on page load
// ──────────────────────────────────────────

(async () => {
    try {
        const pos = await new Promise((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, {
                timeout: 10000,
            })
        );

        const { latitude: lat, longitude: lon } = pos.coords;
        render(await fetchWeather({ lat, lon }));
    } catch (err) {
        console.warn("Location failed:", err.message); // Add this log
        // Fallback to default city
        render(await fetchWeather({ city: "Lahore" }));
    }
})();
