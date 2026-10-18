const tripForm = document.getElementById(“trip-form”);
const tripResult = document.getElementById(“trip-result”);

const departureInput = document.getElementById(“departure”);
const countryInput = document.getElementById(“country”);
const cityInput = document.getElementById(“city”);
const daysInput = document.getElementById(“days”);
const seasonInput = document.getElementById(“season”);
const budgetInput = document.getElementById(“budget”);

const STORAGE_KEY = “routelia_saved_trips”;

function getSavedTrips() {
try {
const trips = JSON.parse(localStorage.getItem(STORAGE_KEY));
return Array.isArray(trips) ? trips : [];
} catch {
return [];
}
}

function saveTrips(trips) {
try {
localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
return true;
} catch (error) {
console.error(“Не удалось сохранить поездки:”, error);
return false;
}
}

function formatMoney(amount) {
return new Intl.NumberFormat(“ru-RU”, {
style: “currency”,
currency: “EUR”,
maximumFractionDigits: 0
}).format(amount);
}

function escapeHTML(value) {
return String(value).replace(/[&<>”’]/g, character => {
const entities = {
“&”: “&”,
“<”: “<”,
“>”: “>”,
‘”’: “"”,
“’”: “'”
};

return entities[character];

});
}

function estimateTripBudget(days, budget) {
const dailyBudget = budget / days;

let category = “Комфортная поездка”;

if (dailyBudget < 60) {
category = “Экономная поездка”;
} else if (dailyBudget >= 150) {
category = “Более свободный бюджет”;
}

return { dailyBudget, category };
}

function createDailyPlan(days, city) {
const activities = [
“Знакомство с городом и прогулка по центру”,
“Главные достопримечательности”,
“Местная кухня и уютные улицы”,
“Музеи, галереи или архитектура”,
“Парки, красивые районы и фотографии”,
“Свободный день для собственных открытий”,
“Любимые места и спокойный вечер”
];

const plan = [];

for (let day = 1; day <= days; day++) {
const activity = activities[(day - 1) % activities.length];

plan.push({
  day,
  title: `День ${day}`,
  activity: `${activity} — ${city}`
});

}

return plan;
}

function renderTrip(trip) {
tripResult.hidden = false;

const safeCity = escapeHTML(trip.city);
const safeCountry = escapeHTML(trip.country);
const safeDeparture = escapeHTML(trip.departure);
const safeSeason = escapeHTML(trip.season);
const safeCategory = escapeHTML(trip.category);

const dailyBudget = formatMoney(trip.dailyBudget);
const totalBudget = formatMoney(trip.budget);

const dailyPlanHTML = trip.plan.map(item => <p> <strong>${item.day}. ${escapeHTML(item.title)}</strong><br> ${escapeHTML(item.activity)} </p>).join(””);

tripResult.innerHTML = `
Твоё путешествие в ${safeCity} ✨

<p><strong>Страна:</strong> ${safeCountry}</p>
<p><strong>Отправление:</strong> ${safeDeparture}</p>
<p><strong>Продолжительность:</strong> ${trip.days} дн.</p>
<p><strong>Сезон:</strong> ${safeSeason}</p>
<hr style="margin: 14px 0; border: 0; border-top: 1px solid #dce5d6;">
<p><strong>Бюджет:</strong> ${totalBudget}</p>
<p><strong>В среднем в день:</strong> ${dailyBudget}</p>
<p><strong>Формат:</strong> ${safeCategory}</p>
<p style="margin-top: 14px;">
  <strong>Предварительный план по дням</strong>
</p>
${dailyPlanHTML}
<p style="margin-top: 12px; font-size: 11px;">
  Это черновой план. Стоимость не является актуальным расчётом
  перелётов, жилья или билетов.
</p>
<button type="button" id="save-trip">♡ Сохранить путешествие</button>
<button type="button" id="edit-trip">Изменить параметры</button>

`;

document.getElementById(“save-trip”).addEventListener(“click”, () => {
const trips = getSavedTrips();

const alreadySaved = trips.some(savedTrip =>
  savedTrip.city === trip.city &&
  savedTrip.country === trip.country &&
  savedTrip.days === trip.days &&
  savedTrip.departure === trip.departure &&
  savedTrip.season === trip.season &&
  savedTrip.budget === trip.budget
);
if (alreadySaved) {
  alert("Это путешествие уже сохранено 💗");
  return;
}
trips.push({
  ...trip,
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  savedAt: new Date().toISOString()
});
if (saveTrips(trips)) {
  alert("Путешествие сохранено в этом браузере 💗");
} else {
  alert("Не получилось сохранить поездку. Попробуй ещё раз.");
}

});

document.getElementById(“edit-trip”).addEventListener(“click”, () => {
tripForm.scrollIntoView({ behavior: “smooth”, block: “center” });
cityInput.focus();
});
}

tripForm.addEventListener(“submit”, event => {
event.preventDefault();

const departure = departureInput.value.trim();
const country = countryInput.value;
const city = cityInput.value.trim();
const days = Number(daysInput.value);
const season = seasonInput.value;
const budget = Number(budgetInput.value);

if (!departure || !country || !city) {
alert(“Заполни город отправления, страну и город назначения.”);
return;
}

if (!Number.isInteger(days) || days < 1 || days > 90) {
alert(“Продолжительность поездки должна быть от 1 до 90 дней.”);
return;
}

if (!Number.isFinite(budget) || budget <= 0) {
alert(“Укажи бюджет больше нуля.”);
return;
}

const { dailyBudget, category } = estimateTripBudget(days, budget);

const trip = {
departure,
country,
city,
days,
season,
budget,
dailyBudget,
category,
plan: createDailyPlan(days, city)
};

renderTrip(trip);

tripResult.scrollIntoView({
behavior: “smooth”,
block: “nearest”
});
});

console.log(“Routelia is ready ✨”);
