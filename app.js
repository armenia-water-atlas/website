const SUPABASE_URL =
  'https://ignkzfqrlgkhboqhhxew.supabase.co';

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


const DATA_SCOPE_LABELS = {
  legal_status: 'իրավական կարգավիճակ',
  general: 'ընդհանուր տվյալներ',
  coordinates: 'կոորդինատներ',
  height: 'բարձրություն',
  elevation: 'բարձրությունը ծովի մակարդակից'
};


const map = L.map('map').setView(
  [40.2, 44.8],
  8
);


L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }
).addTo(map);


let allObjects = [];
let markers = [];


/* =========================================
   HELPERS
   ========================================= */

function typeLabel(type) {
  return TYPE_LABELS[type] || type || 'Այլ';
}


function clearMarkers() {
  markers.forEach(marker => {
    map.removeLayer(marker);
  });

  markers = [];
}


function formatScope(scope) {
  if (!scope) {
    return '';
  }

  return scope
    .split(',')
    .map(part => {
      const key = part.trim();

      return DATA_SCOPE_LABELS[key] || key;
    })
    .join(', ');
}


function addDetailField(
  container,
  label,
  value
) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return;
  }

  const field =
    document.createElement('div');

  field.className = 'detail-field';

  const labelElement =
    document.createElement('span');

  labelElement.className = 'detail-label';
  labelElement.textContent = label;

  const valueElement =
    document.createElement('span');

  valueElement.className = 'detail-value';
  valueElement.textContent = value;

  field.appendChild(labelElement);
  field.appendChild(valueElement);

  container.appendChild(field);
}


/* =========================================
   MAP POPUPS
   ========================================= */

function buildPopup(item) {

  let html =
    `<div class="popup-title">` +
    `${item.name_hy || 'Անանուն օբյեկտ'}` +
    `</div>`;

  html +=
    `<div class="popup-row">` +
    `<strong>Տեսակ՝</strong> ` +
    `${typeLabel(item.type)}` +
    `</div>`;


  if (item.province) {
    html +=
      `<div class="popup-row">` +
      `<strong>Մարզ՝</strong> ` +
      `${item.province}` +
      `</div>`;
  }


  if (item.basin) {
    html +=
      `<div class="popup-row">` +
      `<strong>Ավազան՝</strong> ` +
      `${item.basin}` +
      `</div>`;
  }


  if (item.length_km !== null) {
    html +=
      `<div class="popup-row">` +
      `<strong>Երկարություն՝</strong> ` +
      `${item.length_km} կմ` +
      `</div>`;
  }


  if (item.height_m !== null) {

    html +=
      `<div class="popup-row">` +
      `<strong>Բարձրություն՝</strong> ` +
      `${item.height_m} մ` +
      `</div>`;

  } else if (
    item.height_min_m !== null &&
    item.height_max_m !== null
  ) {

    html +=
      `<div class="popup-row">` +
      `<strong>Բարձրություն՝</strong> ` +
      `${item.height_min_m}–` +
      `${item.height_max_m} մ` +
      `</div>`;
  }


  if (item.elevation_m !== null) {
    html +=
      `<div class="popup-row">` +
      `<strong>Ծովի մակարդակից՝</strong> ` +
      `${item.elevation_m} մ` +
      `</div>`;
  }


  return html;
}


/* =========================================
   MARKERS
   ========================================= */

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


    marker.bindPopup(
      buildPopup(item)
    );


    marker.waterObjectId = item.id;


    marker.on('click', () => {
      openObjectDetails(item);
    });


    markers.push(marker);
  });


  document
    .getElementById('map-count')
    .textContent =
      `Քարտեզագրված՝ ${mapped.length}`;


  if (mapped.length > 0) {

    const bounds = mapped.map(item => [
      item.latitude,
      item.longitude
    ]);


    map.fitBounds(
      bounds,
      {
        padding: [30, 30],
        maxZoom: 10
      }
    );
  }
}


/* =========================================
   OBJECT LIST
   ========================================= */

function renderList(data) {

  const list =
    document.getElementById(
      'object-items'
    );


  list.innerHTML = '';


  data.forEach(item => {

    const li =
      document.createElement('li');


    li.className = 'object-item';


    li.innerHTML = `
      <span class="object-name">
        ${item.name_hy || 'Անանուն օբյեկտ'}
      </span>

      <span class="object-meta">
        ${typeLabel(item.type)}
      </span>
    `;


    li.addEventListener(
      'click',
      () => {

        openObjectDetails(item);


        if (
          item.latitude !== null &&
          item.longitude !== null
        ) {

          map.setView(
            [
              item.latitude,
              item.longitude
            ],
            13
          );


          const marker =
            markers.find(
              m =>
                m.waterObjectId ===
                item.id
            );


          if (marker) {
            marker.openPopup();
          }
        }
      }
    );


    list.appendChild(li);
  });
}


/* =========================================
   OBJECT DETAILS
   ========================================= */

async function openObjectDetails(item) {

  const panel =
    document.getElementById(
      'object-details'
    );


  panel.hidden = false;


  document
    .getElementById('details-type')
    .textContent =
      typeLabel(item.type);


  document
    .getElementById('details-name')
    .textContent =
      item.name_hy ||
      'Անանուն օբյեկտ';


  const dataContainer =
    document.getElementById(
      'details-data'
    );


  dataContainer.innerHTML = '';


  addDetailField(
    dataContainer,
    'Մարզ',
    item.province
  );


  addDetailField(
    dataContainer,
    'Ավազան',
    item.basin
  );


  addDetailField(
    dataContainer,
    'Երկարություն',
    item.length_km !== null
      ? `${item.length_km} կմ`
      : null
  );


  addDetailField(
    dataContainer,
    'Մակերես',
    item.area_km2 !== null
      ? `${item.area_km2} կմ²`
      : null
  );


  addDetailField(
    dataContainer,
    'Առավելագույն խորություն',
    item.max_depth_m !== null
      ? `${item.max_depth_m} մ`
      : null
  );


  addDetailField(
    dataContainer,
    'Ծավալ',
    item.volume_m3 !== null
      ? `${item.volume_m3} մ³`
      : null
  );


  addDetailField(
    dataContainer,
    'Միջին ծախս',
    item.discharge_m3s !== null
      ? `${item.discharge_m3s} մ³/վ`
      : null
  );


  let heightValue = null;


  if (item.height_m !== null) {

    heightValue =
      `${item.height_m} մ`;

  } else if (
    item.height_min_m !== null &&
    item.height_max_m !== null
  ) {

    heightValue =
      `${item.height_min_m}–` +
      `${item.height_max_m} մ`;
  }


  addDetailField(
    dataContainer,
    'Բարձրություն',
    heightValue
  );


  addDetailField(
    dataContainer,
    'Ծովի մակարդակից',
    item.elevation_m !== null
      ? `${item.elevation_m} մ`
      : null
  );


  if (
    item.latitude !== null &&
    item.longitude !== null
  ) {

    addDetailField(
      dataContainer,
      'Կոորդինատներ',
      `${item.latitude.toFixed(6)}, ` +
      `${item.longitude.toFixed(6)}`
    );
  }


  addDetailField(
    dataContainer,
    'Կարգավիճակ',
    item.status
  );


  addDetailField(
    dataContainer,
    'Տարի',
    item.year
  );


  const description =
    document.getElementById(
      'details-description'
    );


  description.textContent =
    item.description_hy || '';


  const sourcesContainer =
    document.getElementById(
      'details-sources-list'
    );


  sourcesContainer.textContent =
    'Բեռնվում են աղբյուրները...';


  panel.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });


  await loadObjectSources(
    item.id
  );
}


/* =========================================
   SOURCES
   ========================================= */

async function loadObjectSources(objectId) {

  const container =
    document.getElementById(
      'details-sources-list'
    );


  const url =
    `${SUPABASE_URL}/rest/v1/object_sources` +
    `?object_id=eq.${objectId}` +
    `&select=data_scope,source_id`;


  try {

    const response =
      await fetch(
        url,
        {
          headers: {
            apikey: SUPABASE_KEY
          }
        }
      );


    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }


    const links =
      await response.json();


    if (links.length === 0) {

      container.textContent =
        'Այս օբյեկտի համար աղբյուր դեռ կցված չէ։';

      return;
    }


    const sourceIds =
      [...new Set(
        links.map(link =>
          link.source_id
        )
      )];


    const sourceUrl =
      `${SUPABASE_URL}/rest/v1/sources` +
      `?id=in.(${sourceIds.join(',')})` +
      `&select=id,title,organization,source_type,url,publication_year`;


    const sourceResponse =
      await fetch(
        sourceUrl,
        {
          headers: {
            apikey: SUPABASE_KEY
          }
        }
      );


    if (!sourceResponse.ok) {
      throw new Error(
        `HTTP ${sourceResponse.status}`
      );
    }


    const sources =
      await sourceResponse.json();


    container.innerHTML = '';


    links.forEach(link => {

      const source =
        sources.find(
          item =>
            item.id ===
            link.source_id
        );


      if (!source) {
        return;
      }


      const item =
        document.createElement('div');


      item.className =
        'source-item';


      const title =
        document.createElement('div');


      title.className =
        'source-title';


      title.textContent =
        source.title ||
        'Աղբյուր';


      item.appendChild(title);


      const metaParts = [];


      if (source.organization) {
        metaParts.push(
          source.organization
        );
      }


      if (source.publication_year) {
        metaParts.push(
          source.publication_year
        );
      }


      const scope =
        formatScope(
          link.data_scope
        );


      if (scope) {
        metaParts.push(
          `օգտագործվել է՝ ${scope}`
        );
      }


      if (metaParts.length > 0) {

        const meta =
          document.createElement('div');


        meta.className =
          'source-meta';


        meta.textContent =
          metaParts.join(' · ');


        item.appendChild(meta);
      }


      if (source.url) {

        const linkElement =
          document.createElement('a');


        linkElement.className =
          'source-link';


        linkElement.href =
          source.url;


        linkElement.target =
          '_blank';


        linkElement.rel =
          'noopener noreferrer';


        linkElement.textContent =
          'Բացել աղբյուրը';


        item.appendChild(
          linkElement
        );
      }


      container.appendChild(
        item
      );
    });


  } catch (error) {

    container.textContent =
      `Աղբյուրների ստացման սխալ՝ ${error.message}`;
  }
}


/* =========================================
   FILTERS
   ========================================= */

function getSelectedTypes() {

  return Array.from(
    document.querySelectorAll(
      '.type-filter:checked'
    )
  ).map(
    input => input.value
  );
}


function applyFilters() {

  const search =
    document
      .getElementById('search')
      .value
      .trim()
      .toLowerCase();


  const selectedTypes =
    getSelectedTypes();


  const filtered =
    allObjects.filter(item => {

      const matchesSearch =
        !search ||
        (item.name_hy || '')
          .toLowerCase()
          .includes(search);


      const matchesType =
        selectedTypes.length === 0 ||
        selectedTypes.includes(
          item.type
        );


      return (
        matchesSearch &&
        matchesType
      );
    });


  renderList(filtered);
  renderMarkers(filtered);


  document
    .getElementById('status')
    .textContent =
      `Ցուցադրվում է ${filtered.length} օբյեկտ՝ ընդհանուր ${allObjects.length}-ից։`;
}


/* =========================================
   LOAD WATER OBJECTS
   ========================================= */

async function loadObjects() {

  const url =
    `${SUPABASE_URL}/rest/v1/water_objects` +
    `?select=id,type,name_hy,name_en,name_ru,province,basin,description_hy,status,latitude,longitude,elevation_m,length_km,area_km2,max_depth_m,volume_m3,discharge_m3s,year,height_m,height_min_m,height_max_m` +
    `&order=name_hy.asc`;


  try {

    const response =
      await fetch(
        url,
        {
          headers: {
            apikey: SUPABASE_KEY
          }
        }
      );


    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }


    allObjects =
      await response.json();


    renderList(allObjects);
    renderMarkers(allObjects);


    document
      .getElementById('status')
      .textContent =
        `Բազայից ստացվել է ${allObjects.length} ջրային օբյեկտ։`;


  } catch (error) {

    document
      .getElementById('status')
      .textContent =
        `Տվյալների ստացման սխալ՝ ${error.message}`;
  }
}


/* =========================================
   EVENTS
   ========================================= */

document
  .getElementById('search')
  .addEventListener(
    'input',
    applyFilters
  );


document
  .querySelectorAll('.type-filter')
  .forEach(input => {

    input.addEventListener(
      'change',
      applyFilters
    );
  });


document
  .getElementById('details-close')
  .addEventListener(
    'click',
    () => {

      document
        .getElementById(
          'object-details'
        )
        .hidden = true;
    }
  );


/* =========================================
   START
   ========================================= */

loadObjects();
