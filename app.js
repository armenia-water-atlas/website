const SUPABASE_URL =
  'https://ignkzfqrLgkhboqhhxew.supabase.co';

const SUPABASE_KEY =
  'sb_publishable_3TdwbfrdPzxjKfPIUg---w_pYyntp1o';

const TYPE_LABELS = {
  river: 'Գետ',
  waterfall: 'Ջրվեժ',
  lake: 'Լիճ',
  reservoir: 'Ջրամբար',
  canal: 'Ջրանցք',
  spring: 'Աղբյուր',
  wetland: 'Ճահիճ / խոնավ տարածք'
};

const map = L.map('map').setView([40.2, 44.8], 8);

L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }
).addTo(map);

let allObjects = [];
let markers = [];

function typeLabel(type) {
  return TYPE_LABELS[type] || type || 'Այլ';
}

function clearMarkers() {
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];
}

function buildPopup(item) {
  let html = `<div class="popup-title">${item.name_hy || 'Անանուն օբյեկտ'}</div>`;

  html += `<div class="popup-row"><strong>Տեսակ՝</strong> ${typeLabel(item.type)}</div>`;

  if (item.province) {
    html += `<div class="popup-row"><strong>Մարզ՝</strong> ${item.province}</div>`;
  }

  if (item.basin) {
    html += `<div class="popup-row"><strong>Ավազան՝</strong> ${item.basin}</div>`;
  }

  if (item.length_km !== null) {
    html += `<div class="popup-row"><strong>Երկարություն՝</strong> ${item.length_km} կմ</div>`;
  }

  if (item.height_m !== null) {
    html += `<div class="popup-row"><strong>Բարձրություն՝</strong> ${item.height_m} մ</div>`;
  } else if (
    item.height_min_m !== null &&
    item.height_max_m !== null
  ) {
    html += `<div class="popup-row"><strong>Բարձրություն՝</strong> ${item.height_min_m}–${item.height_max_m} մ</div>`;
  }

  if (item.elevation_m !== null) {
    html += `<div class="popup-row"><strong>Ծովի մակարդակից՝</strong> ${item.elevation_m} մ</div>`;
  }

  return html;
}

function renderMarkers(data) {
  clearMarkers();

  const mapped = data.filter(item =>
    item.latitude !== null &&
    item.longitude !== null
  );

  mapped.forEach(item => {
    const marker = L.marker([
      item.latitude,
      item.longitude
    ]).addTo(map);

    marker.bindPopup(buildPopup(item));

    marker.waterObjectId = item.id;
    markers.push(marker);
  });

  document.getElementById('map-count').textContent =
    `Քարտեզագրված՝ ${mapped.length}`;

  if (mapped.length > 0) {
    const bounds = mapped.map(item => [
      item.latitude,
      item.longitude
    ]);

    map.fitBounds(bounds, {
      padding: [30, 30],
      maxZoom: 10
    });
  }
}

function renderList(data) {
  const list = document.getElementById('object-items');
  list.innerHTML = '';

  data.forEach(item => {
    const li = document.createElement('li');
    li.className = 'object-item';

    li.innerHTML = `
      <span class="object-name">${item.name_hy || 'Անանուն օբյեկտ'}</span>
      <span class="object-meta">${typeLabel(item.type)}</span>
    `;

    li.addEventListener('click', () => {
      if (
        item.latitude !== null &&
        item.longitude !== null
      ) {
        map.setView(
          [item.latitude, item.longitude],
          13
        );

        const marker = markers.find(
          m => m.waterObjectId === item.id
        );

        if (marker) {
          marker.openPopup();
        }
      }
    });

    list.appendChild(li);
  });
}

function getSelectedTypes() {
  return Array.from(
    document.querySelectorAll(
      '.type-filter:checked'
    )
  ).map(input => input.value);
}

function applyFilters() {
  const search =
    document
      .getElementById('search')
      .value
      .trim()
      .toLowerCase();

  const selectedTypes = getSelectedTypes();

  const filtered = allObjects.filter(item => {
    const matchesSearch =
      !search ||
      (item.name_hy || '')
        .toLowerCase()
        .includes(search);

    const matchesType =
      selectedTypes.length === 0 ||
      selectedTypes.includes(item.type);

    return matchesSearch && matchesType;
  });

  renderList(filtered);
  renderMarkers(filtered);

  document.getElementById('status').textContent =
    `Ցուցադրվում է ${filtered.length} օբյեկտ՝ ընդհանուր ${allObjects.length}-ից։`;
}

async function loadObjects() {
  const url =
    `${SUPABASE_URL}/rest/v1/water_objects` +
    `?select=id,type,name_hy,province,basin,latitude,longitude,elevation_m,length_km,height_m,height_min_m,height_max_m` +
    `&order=name_hy.asc`;

  try {
    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    allObjects = await response.json();

    renderList(allObjects);
    renderMarkers(allObjects);

    document.getElementById('status').textContent =
      `Բազայից ստացվել է ${allObjects.length} ջրային օբյեկտ։`;

  } catch (error) {
    document.getElementById('status').textContent =
      `Տվյալների ստացման սխալ՝ ${error.message}`;
  }
}

document
  .getElementById('search')
  .addEventListener('input', applyFilters);

document
  .querySelectorAll('.type-filter')
  .forEach(input => {
    input.addEventListener(
      'change',
      applyFilters
    );
  });

loadObjects();
