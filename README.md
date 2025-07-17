# 🌦️ Simple Weather App

A lightweight weather web app that displays real-time weather information based on the user's current location or by manually searching for a city. Built using the OpenWeather API and vanilla JavaScript.

## 🔥 Features

-   🌍 Auto-detects user location on page load
-   🔍 City name autocomplete using OpenWeather Geocoding API
-   🌡️ Displays:
    -   Temperature (°C)
    -   Wind speed (km/h)
    -   Humidity (%)
    -   Weather icon based on current conditions
-   ⚡ Fully client-side — no frameworks

## 🚀 Live Demo

👉 [Click here to view the live app](https://vanilla-js-weather-app-sandy.vercel.app/)

> Replace the URL above with your actual Vercel deployment link after it's live.

## 🧰 Tech Stack

-   HTML + CSS + JavaScript (Vanilla)
-   OpenWeather APIs:
    -   [Current Weather Data](https://openweathermap.org/current)
    -   [Geocoding API](https://openweathermap.org/api/geocoding-api)
-   Deployed on [Vercel](https://vercel.com)

## 🛠️ How It Works

-   On page load:
    -   Tries to get the user’s geolocation.
    -   If successful, fetches weather data for that location.
    -   If denied/unavailable, defaults to **Lahore**.
-   Autocomplete:
    -   As you type a city name, suggestions appear (limited to 5).
    -   Selecting one fetches weather data using its latitude & longitude.

## ⚠️ API Key

This app uses a **public OpenWeather API key** for demonstration. For production:

-   Create your own free API key at [openweathermap.org](https://home.openweathermap.org/api_keys).
-   Optionally restrict usage by domain.

## 📄 License

MIT License — use it freely for learning or personal projects.

---

**Made with ❤️ by WPBean**
