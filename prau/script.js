// script.js for Gunung Prau Page

// Tab Navigation const tabs = document.querySelectorAll(".tab"); const contents = document.querySelectorAll(".tab-content"); tabs.forEach((tab) => { tab.addEventListener("click", () => { tabs.forEach((t) => t.classList.remove("active")); contents.forEach((c) => c.classList.remove("active")); tab.classList.add("active"); document.getElementById(tab.dataset.tab).classList.add("active"); }); });

// Image Slider let currentSlide = 0; const slides = document.querySelector(".slides"); const slideImages = slides.querySelectorAll("img"); const nextBtn = document.querySelector(".next"); const prevBtn = document.querySelector(".prev");

function showSlide(index) { if (index >= slideImages.length) currentSlide = 0; else if (index < 0) currentSlide = slideImages.length - 1; else currentSlide = index; slides.style.transform = translateX(-${currentSlide * 100}%); }

nextBtn.addEventListener("click", () => showSlide(currentSlide + 1)); prevBtn.addEventListener("click", () => showSlide(currentSlide - 1));

// Weather API from OpenWeatherMap const weatherKey = "YOUR_OPENWEATHERMAP_API_KEY"; const lat = -7.2075; // Gunung Prau latitude const lon = 109.9131; // Gunung Prau longitude

fetch( https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${weatherKey} ) .then((res) => res.json()) .then((data) => { document.getElementById("temp").textContent = ${data.main.temp}°C; document.getElementById("weather").textContent = data.weather[0].description; document.getElementById("wind").textContent = ${data.wind.speed} m/s; document.getElementById("humidity").textContent = ${data.main.humidity}%; }) .catch((err) => console.error("Weather error:", err));

// MAPBOX Init mapboxgl.accessToken = "YOUR_MAPBOX_ACCESS_TOKEN"; const map = new mapboxgl.Map({ container: "prau-map", style: "mapbox://styles/mapbox/outdoors-v12", center: [109.9131, -7.2075], zoom: 12, });

// Add Controls map.addControl(new mapboxgl.NavigationControl());

map.on("load", () => { // Load routes map.addSource("prauRoutes", { type: "geojson", data: "/data/prau_routes.geojson", }); map.addLayer({ id: "routes", type: "line", source: "prauRoutes", paint: { "line-color": "#FF5733", "line-width": 4, }, });

// Load points map.addSource("prauPoints", { type: "geojson", data: "/data/prau_points.geojson", }); map.addLayer({ id: "points", type: "symbol", source: "prauPoints", layout: { "icon-image": "mountain-15", "icon-size": 1.2, "text-field": ["get", "name"], "text-offset": [0, 1.2], "text-anchor": "top", }, paint: { "text-color": "#333", }, });

// Layer toggling document.getElementById("toggle-routes").addEventListener("change", (e) => { map.setLayoutProperty("routes", "visibility", e.target.checked ? "visible" : "none"); });

document.getElementById("toggle-points").addEventListener("change", (e) => { map.setLayoutProperty("points", "visibility", e.target.checked ? "visible" : "none"); }); });

