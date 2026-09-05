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
  wetland: 'Խոնավ տարածք',
  hydropower: 'ՀԷԿ'
};


const STATUS_LABELS = {
  natural: 'Բնական',
  operational: 'Գործող',
  planned: 'Նախատեսվող',
  construction: 'Կառուցվող'
};


const DATA_SCOPE_LABELS = {
  legal_status: 'իրավական կարգավիճակ',
  general: 'ընդհանուր տվյալներ',
  coordinates: 'կոորդինատներ',
  geometry: 'քարտեզային երկրաչափություն',
  height: 'բարձրություն',
  elevation: 'բարձրությունը ծովի մակարդակից'
};


/* =========================================
   MAP
   ========================================= */

const ARMENIA_CENTER = [
  40.10,
  45.05
];

const ARMENIA_ZOOM = 7.5;

// Approximate geographic envelope of the Republic of Armenia.
// We use this when a category is selected so the whole country remains visible,
// even if that category has objects only in one part of Armenia.
const ARMENIA_BOUNDS = L.latLngBounds(
  [38.82, 43.40],
  [41.32, 46.70]
);


const map = L.map(
  'map',
  {
    zoomSnap: 0.25,
    zoomDelta: 0.5
  }
).setView(
  ARMENIA_CENTER,
  ARMENIA_ZOOM
);


L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    maxZoom: 19,
    attribution:
      '&copy; OpenStreetMap contributors'
  }
).addTo(map);


let allObjects = [];
let markers = [];

// Small natural lakes and waterfalls use fixed-size symbols. At low zoom levels
// nearby symbols are gently displaced in screen space so they do not cover each other.
// Their true coordinates are preserved separately and used for details/focus.
let smallLakeCollisionMarkers = [];
let smallLakeConnectorLines = [];

// Objects explicitly opened by the user stay visible while additional
// thematic layers are switched on. This enables a gradual workflow such as:
// Սևանա լիճ -> Գետեր -> ՀԷԿ-եր -> Ջրամբարներ, without losing the lake.
const pinnedObjectIds = new Set();


/* =========================================
   HELPERS
   ========================================= */

function typeLabel(type) {

  return (
    TYPE_LABELS[type] ||
    type ||
    'Այլ'
  );
}


function statusLabel(status) {

  return (
    STATUS_LABELS[status] ||
    status ||
    ''
  );
}


function clearMarkers() {

  markers.forEach(marker => {
    map.removeLayer(marker);
  });

  smallLakeConnectorLines.forEach(line => {
    map.removeLayer(line);
  });

  markers = [];
  smallLakeCollisionMarkers = [];
  smallLakeConnectorLines = [];
}


/*
 * Keep fixed-size lake/waterfall symbols from overlapping.
 *
 * The algorithm works in Leaflet layer pixels, not geographic coordinates:
 *  - every lake starts at its true position;
 *  - nearby symbols repel each other until there is at least MIN_DISTANCE_PX;
 *  - a light spring keeps each symbol close to its true position;
 *  - when a symbol is displaced, a thin dashed line points to the true location.
 *
 * At higher zoom levels the true positions naturally separate, so displacement
 * becomes very small or disappears completely.
 */
function layoutSmallLakeMarkers() {

  if (!smallLakeCollisionMarkers.length) {
    return;
  }

  smallLakeConnectorLines.forEach(line => {
    map.removeLayer(line);
  });
  smallLakeConnectorLines = [];

  const MIN_DISTANCE_PX = 30;
  const MAX_DISPLACEMENT_PX = 54;
  const ITERATIONS = 32;
  const SPRING = 0.10;

  const nodes = smallLakeCollisionMarkers.map(entry => {

    const anchor =
      map.latLngToLayerPoint(
        entry.trueLatLng
      );

    return {
      entry,
      anchor,
      point: anchor.clone()
    };
  });

  for (let iteration = 0; iteration < ITERATIONS; iteration += 1) {

    for (let i = 0; i < nodes.length; i += 1) {

      for (let j = i + 1; j < nodes.length; j += 1) {

        const a = nodes[i];
        const b = nodes[j];

        let dx = b.point.x - a.point.x;
        let dy = b.point.y - a.point.y;
        let distance =
          Math.sqrt(dx * dx + dy * dy);

        if (distance >= MIN_DISTANCE_PX) {
          continue;
        }

        // Exact same projected point: give the pair a stable deterministic axis.
        if (distance < 0.01) {
          const angle =
            ((i * 137 + j * 67) % 360) *
            Math.PI / 180;

          dx = Math.cos(angle);
          dy = Math.sin(angle);
          distance = 1;
        }

        const overlap =
          MIN_DISTANCE_PX - distance;

        const push =
          overlap * 0.52;

        const ux = dx / distance;
        const uy = dy / distance;

        a.point.x -= ux * push;
        a.point.y -= uy * push;
        b.point.x += ux * push;
        b.point.y += uy * push;
      }
    }

    nodes.forEach(node => {

      node.point.x +=
        (node.anchor.x - node.point.x) *
        SPRING;

      node.point.y +=
        (node.anchor.y - node.point.y) *
        SPRING;

      const dx =
        node.point.x - node.anchor.x;

      const dy =
        node.point.y - node.anchor.y;

      const displacement =
        Math.sqrt(dx * dx + dy * dy);

      if (
        displacement >
        MAX_DISPLACEMENT_PX
      ) {

        const ratio =
          MAX_DISPLACEMENT_PX /
          displacement;

        node.point.x =
          node.anchor.x +
          dx * ratio;

        node.point.y =
          node.anchor.y +
          dy * ratio;
      }
    });
  }

  nodes.forEach(node => {

    const displayLatLng =
      map.layerPointToLatLng(
        node.point
      );

    node.entry.marker.setLatLng(
      displayLatLng
    );

    const pixelDisplacement =
      node.point.distanceTo(
        node.anchor
      );

    if (pixelDisplacement > 4) {

      const line =
        L.polyline(
          [
            node.entry.trueLatLng,
            displayLatLng
          ],
          {
            color: '#1976d2',
            weight: 1,
            opacity: 0.45,
            dashArray: '3,4',
            interactive: false
          }
        ).addTo(map);

      if (
        typeof line.bringToBack ===
        'function'
      ) {
        line.bringToBack();
      }

      smallLakeConnectorLines.push(
        line
      );
    }
  });
}


function closeAllTooltips() {

  markers.forEach(layer => {

    if (
      typeof layer.closeTooltip === 'function'
    ) {
      layer.closeTooltip();
    }


    if (
      typeof layer.eachLayer === 'function'
    ) {

      layer.eachLayer(child => {

        if (
          typeof child.closeTooltip === 'function'
        ) {
          child.closeTooltip();
        }
      });
    }
  });
}


function formatScope(scope) {

  if (!scope) {
    return '';
  }


  return scope
    .split(',')
    .map(part => {

      const key =
        part.trim();


      return (
        DATA_SCOPE_LABELS[key] ||
        key
      );

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


  field.className =
    'detail-field';


  const labelElement =
    document.createElement('span');


  labelElement.className =
    'detail-label';


  labelElement.textContent =
    label;


  const valueElement =
    document.createElement('span');


  valueElement.className =
    'detail-value';


  valueElement.textContent =
    value;


  field.appendChild(
    labelElement
  );


  field.appendChild(
    valueElement
  );


  container.appendChild(
    field
  );
}


/* =========================================
   URL / HISTORY
   ========================================= */

function getObjectIdFromUrl() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  const value =
    params.get('id');


  if (!value) {
    return null;
  }


  const id =
    Number(value);


  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    return null;
  }


  return id;
}


function setObjectUrl(
  objectId,
  replace = false
) {

  const url =
    new URL(
      window.location.href
    );


  if (objectId) {

    url.searchParams.set(
      'id',
      objectId
    );

  } else {

    url.searchParams.delete(
      'id'
    );
  }


  const state = {
    objectId:
      objectId || null
  };


  if (replace) {

    window.history.replaceState(
      state,
      '',
      url
    );

  } else {

    window.history.pushState(
      state,
      '',
      url
    );
  }
}


function findObjectById(
  objectId
) {

  return allObjects.find(
    item =>
      Number(item.id) ===
      Number(objectId)
  );
}


function findMapLayerByObjectId(
  objectId
) {

  return markers.find(
    layer =>
      Number(layer.waterObjectId) ===
      Number(objectId)
  );
}


function focusObjectOnMap(
  item,
  zoom = 13
) {

  closeAllTooltips();


  const layer =
    findMapLayerByObjectId(
      item.id
    );


  if (
    layer &&
    typeof layer.getBounds === 'function'
  ) {

    const bounds =
      layer.getBounds();


    if (
      bounds &&
      bounds.isValid()
    ) {

      map.fitBounds(
        bounds,
        {
          padding: [35, 35],
          maxZoom: 11
        }
      );

      return;
    }
  }


  if (
    item.latitude === null ||
    item.longitude === null
  ) {
    return;
  }


  map.setView(
    [
      item.latitude,
      item.longitude
    ],
    zoom
  );
}


/* =========================================
   MAP HOVER INFO
   ========================================= */

function buildHoverInfo(item) {

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


  if (
    item.type === 'hydropower' &&
    item.installed_capacity_mw !== null
  ) {

    html +=
      `<div class="popup-row">` +
      `<strong>Հզորություն՝</strong> ` +
      `${item.installed_capacity_mw} ՄՎտ` +
      `</div>`;
  }


  return html;
}


/* =========================================
   MARKERS
   ========================================= */

function createLakeIcon() {

  return L.divIcon({
    className: 'lake-symbol-wrapper',
    html: `
      <div
        style="
          width:22px;
          height:22px;
          border:2px solid #1976d2;
          border-radius:50%;
          background:#eaf5ff;
          display:flex;
          align-items:center;
          justify-content:center;
          box-sizing:border-box;
          box-shadow:0 1px 3px rgba(0,0,0,.28);
        "
        aria-hidden="true"
      >
        <svg
          width="14"
          height="10"
          viewBox="0 0 14 10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M1 2.2 C2.2 1.2 3.4 1.2 4.6 2.2 S7 3.2 8.2 2.2 S10.6 1.2 13 2.2"
                fill="none" stroke="#1976d2" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M1 5 C2.2 4 3.4 4 4.6 5 S7 6 8.2 5 S10.6 4 13 5"
                fill="none" stroke="#1976d2" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M1 7.8 C2.2 6.8 3.4 6.8 4.6 7.8 S7 8.8 8.2 7.8 S10.6 6.8 13 7.8"
                fill="none" stroke="#1976d2" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    tooltipAnchor: [0, -12]
  });
}


function createWaterfallIcon() {

  return L.divIcon({
    className: 'waterfall-symbol-wrapper',
    html: `
      <div
        style="
          width:22px;
          height:22px;
          border:2px solid #1976d2;
          border-radius:50%;
          background:#ffffff;
          display:flex;
          align-items:center;
          justify-content:center;
          box-sizing:border-box;
          box-shadow:0 1px 3px rgba(0,0,0,.28);
        "
        aria-hidden="true"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!--
            Waterfall: three falling, slightly right-leaning jets.
            The upper parts are close together; toward the bottom
            they open outward, making the symbol read as falling water.
          -->
          <g
            fill="none"
            stroke="#1976d2"
            stroke-width="1.55"
            stroke-linecap="round"
            stroke-linejoin="round"
            transform="rotate(12 7.5 7.5)"
          >
            <path d="M4.6 1.4
                     C3.8 3.0 5.2 4.0 4.5 5.5
                     C3.8 7.0 4.9 8.1 4.1 9.7
                     C3.5 10.9 3.2 12.0 2.8 13.5"/>
            <path d="M7.5 1.2
                     C6.7 2.9 8.1 4.0 7.4 5.5
                     C6.7 7.0 7.9 8.2 7.2 9.7
                     C6.7 11.0 6.7 12.1 6.6 13.7"/>
            <path d="M10.4 1.4
                     C9.6 3.0 11.0 4.0 10.3 5.5
                     C9.6 7.0 10.8 8.1 10.1 9.7
                     C9.7 10.9 10.2 12.0 10.8 13.5"/>
          </g>
        </svg>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    tooltipAnchor: [0, -12]
  });
}


function createReservoirIcon(status) {

  return L.divIcon({
    className: 'reservoir-symbol-wrapper',
    html: `
      <div
        style="
          width:24px;
          height:24px;
          border:2px ${status === 'construction' || status === 'planned' ? 'dashed' : 'solid'} #1976d2;
          border-radius:50%;
          background:#ffffff;
          display:flex;
          align-items:center;
          justify-content:center;
          box-sizing:border-box;
          box-shadow:0 1px 3px rgba(0,0,0,.28);
        "
        aria-hidden="true"
      >
        <svg width="17" height="17" viewBox="0 0 17 17" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" stroke="#1976d2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 4.1 H14" stroke-width="1.5"/>
            <path d="M5.1 4.1 V10.6 M11.9 4.1 V10.6" stroke-width="1.5"/>
            <path d="M3.1 10.3 C4.3 9.5 5.5 9.5 6.7 10.3 S9.1 11.1 10.3 10.3 S12.7 9.5 13.9 10.3" stroke-width="1.35"/>
            <path d="M3.5 13.2 C4.7 12.4 5.9 12.4 7.1 13.2 S9.5 14 10.7 13.2 S13.1 12.4 14.1 13.2" stroke-width="1.35"/>
          </g>
        </svg>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    tooltipAnchor: [0, -13]
  });
}


function createWetlandIcon() {

  return L.divIcon({
    className: 'wetland-symbol-wrapper',
    html: `
      <div
        style="
          width:24px;
          height:24px;
          border:2px solid #1976d2;
          border-radius:50%;
          background:#eef8f3;
          display:flex;
          align-items:center;
          justify-content:center;
          box-sizing:border-box;
          box-shadow:0 1px 3px rgba(0,0,0,.28);
        "
        aria-hidden="true"
      >
        <svg width="17" height="17" viewBox="0 0 17 17" xmlns="http://www.w3.org/2000/svg">
          <!-- Wetland: reeds rising above two small water waves. -->
          <g fill="none" stroke="#1976d2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12.2 C4.2 11.4 5.2 11.4 6.4 12.2 S8.7 13 9.9 12.2 S12.2 11.4 14 12.2" stroke-width="1.25"/>
            <path d="M3.4 14.4 C4.6 13.7 5.7 13.7 6.9 14.4 S9.2 15.1 10.4 14.4 S12.7 13.7 13.8 14.4" stroke-width="1.25"/>
            <path d="M6.2 11.2 L6.2 4.0 M9.0 11.5 L9.0 2.6 M11.7 11.2 L11.7 4.6" stroke-width="1.25"/>
            <path d="M6.2 5.4 C5.0 5.0 4.6 4.3 4.5 3.6 C5.7 3.7 6.3 4.2 6.2 5.4Z" fill="#1976d2" stroke-width=".6"/>
            <path d="M9.0 4.2 C10.2 3.8 10.7 3.1 10.8 2.4 C9.6 2.5 9.0 3.0 9.0 4.2Z" fill="#1976d2" stroke-width=".6"/>
            <path d="M11.7 6.0 C12.8 5.6 13.3 5.0 13.4 4.3 C12.2 4.4 11.7 4.9 11.7 6.0Z" fill="#1976d2" stroke-width=".6"/>
          </g>
        </svg>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    tooltipAnchor: [0, -13]
  });
}



function createSpringIcon() {

  return L.divIcon({
    className: 'spring-symbol-wrapper',
    html: `
      <div
        style="
          width:24px;
          height:24px;
          border:2px solid #1976d2;
          border-radius:50%;
          background:#ffffff;
          display:flex;
          align-items:center;
          justify-content:center;
          box-sizing:border-box;
          box-shadow:0 1px 3px rgba(0,0,0,.28);
        "
        aria-hidden="true"
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 17 17"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g
            fill="none"
            stroke="#1976d2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <!-- Three small water drops above a drinking cup/bowl. -->
            <path d="M5.0 2.2 C4.45 3.0 4.15 3.45 4.15 3.9
                     C4.15 4.4 4.52 4.8 5.0 4.8
                     C5.48 4.8 5.85 4.4 5.85 3.9
                     C5.85 3.45 5.55 3.0 5.0 2.2Z"
                  fill="#1976d2" stroke-width=".45"/>
            <path d="M8.5 1.6 C7.9 2.5 7.55 3.0 7.55 3.5
                     C7.55 4.05 7.96 4.48 8.5 4.48
                     C9.04 4.48 9.45 4.05 9.45 3.5
                     C9.45 3.0 9.1 2.5 8.5 1.6Z"
                  fill="#1976d2" stroke-width=".45"/>
            <path d="M12.0 2.2 C11.45 3.0 11.15 3.45 11.15 3.9
                     C11.15 4.4 11.52 4.8 12.0 4.8
                     C12.48 4.8 12.85 4.4 12.85 3.9
                     C12.85 3.45 12.55 3.0 12.0 2.2Z"
                  fill="#1976d2" stroke-width=".45"/>

            <!-- Cup / pedestal bowl. -->
            <path d="M3.0 6.4 H14.0
                     C13.55 9.2 11.65 10.8 8.5 10.8
                     C5.35 10.8 3.45 9.2 3.0 6.4Z"
                  stroke-width="1.25"/>
            <path d="M8.5 10.8 V13.1" stroke-width="1.25"/>
            <path d="M5.9 14.2 H11.1" stroke-width="1.25"/>
            <path d="M6.8 13.1 H10.2" stroke-width="1.05"/>
          </g>
        </svg>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    tooltipAnchor: [0, -13]
  });
}


function createHydropowerIcon(status) {

  return L.divIcon({
    className: 'hydropower-symbol-wrapper',
    html: `
      <div
        style="
          width:24px;
          height:24px;
          border:2px ${status === 'construction' ? 'dashed' : 'solid'} #1976d2;
          border-radius:50%;
          background:#ffffff;
          display:flex;
          align-items:center;
          justify-content:center;
          box-sizing:border-box;
          box-shadow:0 1px 3px rgba(0,0,0,.28);
        "
        aria-hidden="true"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- Conventional hydropower-style mark:
               a compact dam/turbine block with an energy bolt. -->
          <g
            fill="none"
            stroke="#1976d2"
            stroke-width="1.35"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M2.2 5.0 H8.0 V12.6 H2.2 Z"/>
            <path d="M4.1 5.0 V12.6"/>
            <path d="M6.1 5.0 V12.6"/>
            <path d="M1.6 13.5 C3.0 12.8 4.4 12.8 5.8 13.5 C7.2 14.2 8.6 14.2 10.0 13.5"/>
            <path d="M10.2 2.0 L8.3 7.0 H10.7 L9.3 12.0 L14.0 5.9 H11.4 L13.0 2.0 Z"/>
          </g>
        </svg>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    tooltipAnchor: [0, -13]
  });
}


function renderMarkers(data) {

  clearMarkers();

  const mapped =
    data.filter(item =>
      (
        item.type === 'lake' &&
        item.name_hy !== 'Սևանա լիճ' &&
        item.latitude !== null &&
        item.longitude !== null
      ) ||
      item.geometry ||
      (
        item.latitude !== null &&
        item.longitude !== null
      )
    );

  mapped.forEach(item => {

    let layer = null;

    const isLake =
      item.type === 'lake';

    const isSevan =
      isLake &&
      item.name_hy === 'Սևանա լիճ';

    const isSmallLake =
      isLake &&
      !isSevan;

    const isWaterfall =
      item.type === 'waterfall';

    const isHydropower =
      item.type === 'hydropower';

    const isReservoir =
      item.type === 'reservoir';

    const isWetland =
      item.type === 'wetland';

    const isSpring =
      item.type === 'spring';

    const hasCoordinates =
      item.latitude !== null &&
      item.longitude !== null;

    if (
      (isSmallLake || isWaterfall || isHydropower || isReservoir || isWetland || isSpring) &&
      hasCoordinates
    ) {

      const marker =
        L.marker(
          [
            item.latitude,
            item.longitude
          ],
          {
            icon:
              isWaterfall
                ? createWaterfallIcon()
                : isHydropower
                  ? createHydropowerIcon(item.status)
                  : isReservoir
                    ? createReservoirIcon(item.status)
                    : isWetland
                      ? createWetlandIcon()
                      : isSpring
                        ? createSpringIcon()
                        : createLakeIcon(),
            zIndexOffset:
              isHydropower
                ? 650
                : isReservoir
                  ? 600
                  : isSpring
                    ? 580
                    : 500
          }
        ).addTo(map);

      marker.bindTooltip(
        buildHoverInfo(item),
        {
          direction: 'auto',
          offset: [0, 0],
          opacity: 1,
          sticky: false,
          interactive: false,
          className:
            'object-hover-tooltip'
        }
      );

      marker.waterObjectId =
        item.id;

      marker.trueLatLng =
        L.latLng(
          item.latitude,
          item.longitude
        );

      smallLakeCollisionMarkers.push({
        marker,
        trueLatLng:
          marker.trueLatLng
      });

      marker.on(
        'click',
        () => {

          marker.closeTooltip();

          openObjectDetails(
            item,
            true
          );

          focusObjectOnMap(
            item,
            13
          );
        }
      );

      layer = marker;

    } else if (item.geometry) {

      const geometryLayer =
        L.geoJSON(
          item.geometry,
          {
            style: {
              color: '#1976d2',
              weight: 4,
              opacity: 0.9
            }
          }
        ).addTo(map);

      geometryLayer.eachLayer(part => {

        part.bindTooltip(
          buildHoverInfo(item),
          {
            direction: 'auto',
            offset: [0, 0],
            opacity: 1,
            sticky: true,
            interactive: false,
            className:
              'object-hover-tooltip'
          }
        );

        part.on(
          'mouseover',
          () => {
            if (
              typeof part.setStyle === 'function'
            ) {
              part.setStyle({
                weight: 6
              });
            }
          }
        );

        part.on(
          'mouseout',
          () => {
            if (
              typeof part.setStyle === 'function'
            ) {
              part.setStyle({
                weight: 4
              });
            }
          }
        );

        part.on(
          'click',
          () => {

            part.closeTooltip();

            openObjectDetails(
              item,
              true
            );

            focusObjectOnMap(
              item,
              13
            );
          }
        );
      });

      geometryLayer.waterObjectId =
        item.id;

      layer =
        geometryLayer;

      // Lake Sevan keeps its real polygon, but also receives
      // the same conventional lake symbol used for other lakes.
      if (
        isSevan &&
        hasCoordinates
      ) {

        const sevanMarker =
          L.marker(
            [
              item.latitude,
              item.longitude
            ],
            {
              icon: createLakeIcon(),
              zIndexOffset: 700
            }
          ).addTo(map);

        sevanMarker.bindTooltip(
          buildHoverInfo(item),
          {
            direction: 'auto',
            offset: [0, 0],
            opacity: 1,
            sticky: false,
            interactive: false,
            className:
              'object-hover-tooltip'
          }
        );

        sevanMarker.waterObjectId =
          item.id;

        sevanMarker.on(
          'click',
          () => {

            sevanMarker.closeTooltip();

            openObjectDetails(
              item,
              true
            );

            focusObjectOnMap(
              item,
              13
            );
          }
        );

        markers.push(
          sevanMarker
        );
      }

    } else {

      const marker =
        L.marker([
          item.latitude,
          item.longitude
        ]).addTo(map);

      marker.bindTooltip(
        buildHoverInfo(item),
        {
          direction: 'auto',
          offset: [0, 0],
          opacity: 1,
          sticky: false,
          interactive: false,
          className:
            'object-hover-tooltip'
        }
      );

      marker.waterObjectId =
        item.id;

      marker.on(
        'click',
        () => {

          marker.closeTooltip();

          openObjectDetails(
            item,
            true
          );

          focusObjectOnMap(
            item,
            13
          );
        }
      );

      layer =
        marker;
    }

    markers.push(layer);
  });

  layoutSmallLakeMarkers();

  document
    .getElementById(
      'map-count'
    )
    .textContent =
      `Քարտեզագրված՝ ${mapped.length}`;

  if (getObjectIdFromUrl()) {
    return;
  }

  // Category selection must never crop Armenia to the extent of the
  // selected objects. Keep the whole country visible so empty regions are
  // immediately recognizable as regions without objects of this category.
  map.fitBounds(
    ARMENIA_BOUNDS,
    {
      padding: [24, 24],
      maxZoom: 8
    }
  );
}


// Recalculate only after the map stops moving/zooming.
// This keeps the visual separation stable and inexpensive.
map.on(
  'zoomend moveend',
  () => {
    layoutSmallLakeMarkers();
  }
);


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


    li.className =
      'object-item';


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

        closeAllTooltips();


        pinnedObjectIds.add(
          Number(item.id)
        );


        applyFilters();


        openObjectDetails(
          item,
          true
        );


        focusObjectOnMap(
          item,
          13
        );
      }
    );


    list.appendChild(
      li
    );
  });
}


/* =========================================
   OBJECT DETAILS
   ========================================= */

async function openObjectDetails(
  item,
  updateUrl = true
) {

  closeAllTooltips();


  if (updateUrl) {

    const currentId =
      getObjectIdFromUrl();


    if (
      Number(currentId) !==
      Number(item.id)
    ) {

      setObjectUrl(
        item.id,
        false
      );
    }
  }


  const panel =
    document.getElementById(
      'object-details'
    );


  panel.hidden = false;


  document
    .getElementById(
      'details-type'
    )
    .textContent =
      typeLabel(item.type);


  document
    .getElementById(
      'details-name'
    )
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
    statusLabel(
      item.status
    )
  );


  addDetailField(
    dataContainer,
    'Տարի',
    item.year
  );


  if (item.type === 'hydropower') {

    addDetailField(
      dataContainer,
      'Գետ',
      item.river_name
    );


    addDetailField(
      dataContainer,
      'Կասկադ',
      item.cascade_name
    );


    addDetailField(
      dataContainer,
      'Տեղադրված հզորություն',
      item.installed_capacity_mw !== null
        ? `${item.installed_capacity_mw} ՄՎտ`
        : null
    );


    addDetailField(
      dataContainer,
      'Առկա հզորություն',
      item.available_capacity_mw !== null
        ? `${item.available_capacity_mw} ՄՎտ`
        : null
    );


    addDetailField(
      dataContainer,
      'Միջին տարեկան արտադրություն',
      item.annual_generation_gwh !== null
        ? `${item.annual_generation_gwh} ԳՎտժ`
        : null
    );


    addDetailField(
      dataContainer,
      'ՀԷԿ-ի տեսակ',
      item.hydropower_kind
    );


    addDetailField(
      dataContainer,
      'Աշխատանքի ռեժիմ',
      item.operation_regime
    );


    addDetailField(
      dataContainer,
      'Օպերատոր',
      item.operator
    );
  }


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


  await Promise.all([
    loadObjectSources(item.id),
    loadObjectPhotos(item.id)
  ]);
}


/* =========================================
   CLOSE DETAILS
   ========================================= */

function closeObjectDetails(
  updateUrl = true
) {

  closeAllTooltips();


  const panel =
    document.getElementById(
      'object-details'
    );


  panel.hidden = true;


  if (updateUrl) {

    setObjectUrl(
      null,
      false
    );
  }


  map.setView(
    ARMENIA_CENTER,
    ARMENIA_ZOOM
  );
}


/* =========================================
   PHOTO GALLERY
   ========================================= */

function showGalleryPhoto(
  photos,
  selectedIndex,
  mainArea,
  thumbnails
) {

  const photo =
    photos[selectedIndex];


  mainArea.innerHTML = '';


  const image =
    document.createElement('img');


  image.src =
    photo.photo_url;


  image.alt =
    photo.caption_hy ||
    'Ջրային օբյեկտի լուսանկար';


  image.loading =
    'lazy';


  image.style.width =
    '100%';

  image.style.height =
    '400px';

  image.style.objectFit =
    'cover';

  image.style.objectPosition =
    'center';

  image.style.display =
    'block';


  mainArea.appendChild(
    image
  );


  const credit =
    document.createElement('div');


  credit.className =
    'photo-credit';


  const creditText =
    document.createElement('span');


  const parts = [];


  if (photo.author) {

    parts.push(
      `Լուսանկար՝ ${photo.author}`
    );
  }


  if (photo.license) {

    parts.push(
      photo.license
    );
  }


  creditText.textContent =
    parts.join(' · ');


  credit.appendChild(
    creditText
  );


  if (photo.source_url) {

    const sourceLink =
      document.createElement('a');


    sourceLink.href =
      photo.source_url;

    sourceLink.target =
      '_blank';

    sourceLink.rel =
      'noopener noreferrer';

    sourceLink.textContent =
      'Աղբյուր';


    credit.appendChild(
      sourceLink
    );
  }


  mainArea.appendChild(
    credit
  );


  if (thumbnails) {

    const buttons =
      thumbnails.querySelectorAll(
        'button'
      );


    buttons.forEach(
      (button, index) => {

        if (
          index === selectedIndex
        ) {

          button.style.border =
            '3px solid #247c72';

          button.style.opacity =
            '1';

        } else {

          button.style.border =
            '2px solid transparent';

          button.style.opacity =
            '0.72';
        }
      }
    );
  }
}


async function loadObjectPhotos(
  objectId
) {

  const photoBox =
    document.getElementById(
      'details-photo-placeholder'
    );


  if (!photoBox) {
    return;
  }


  photoBox.innerHTML = `
    <span>Լուսանկար</span>
    <small>Բեռնվում է...</small>
  `;


  const url =
    `${SUPABASE_URL}/rest/v1/object_photos` +
    `?object_id=eq.${objectId}` +
    `&select=id,photo_url,thumbnail_url,caption_hy,author,source_url,license,is_primary,sort_order` +
    `&order=is_primary.desc,sort_order.asc`;


  try {

    const response =
      await fetch(
        url,
        {
          headers: {
            apikey:
              SUPABASE_KEY
          }
        }
      );


    if (!response.ok) {

      throw new Error(
        `HTTP ${response.status}`
      );
    }


    const photos =
      await response.json();


    if (photos.length === 0) {

      photoBox.innerHTML = `
        <span>Լուսանկար չկա</span>
        <small>
          Այս օբյեկտի համար լուսանկար դեռ ավելացված չէ
        </small>
      `;

      return;
    }


    photoBox.innerHTML = '';


    const mainArea =
      document.createElement('div');


    mainArea.style.width =
      '100%';


    photoBox.appendChild(
      mainArea
    );


    let thumbnails = null;


    if (photos.length > 1) {

      thumbnails =
        document.createElement('div');


      thumbnails.style.display =
        'flex';

      thumbnails.style.gap =
        '10px';

      thumbnails.style.padding =
        '12px 14px';

      thumbnails.style.overflowX =
        'auto';

      thumbnails.style.background =
        '#f5f8f9';

      thumbnails.style.borderTop =
        '1px solid #d9e2e5';


      photos.forEach(
        (photo, index) => {

          const button =
            document.createElement(
              'button'
            );


          button.type =
            'button';


          button.title =
            photo.caption_hy ||
            `Լուսանկար ${index + 1}`;


          button.style.padding =
            '0';

          button.style.margin =
            '0';

          button.style.width =
            '105px';

          button.style.height =
            '72px';

          button.style.minWidth =
            '105px';

          button.style.borderRadius =
            '7px';

          button.style.overflow =
            'hidden';

          button.style.cursor =
            'pointer';

          button.style.background =
            '#ffffff';


          const thumb =
            document.createElement(
              'img'
            );


          thumb.src =
            photo.thumbnail_url ||
            photo.photo_url;


          thumb.alt =
            photo.caption_hy ||
            `Լուսանկար ${index + 1}`;


          thumb.loading =
            'lazy';


          thumb.style.width =
            '100%';

          thumb.style.height =
            '100%';

          thumb.style.objectFit =
            'cover';

          thumb.style.display =
            'block';


          button.appendChild(
            thumb
          );


          button.addEventListener(
            'click',
            () => {

              showGalleryPhoto(
                photos,
                index,
                mainArea,
                thumbnails
              );
            }
          );


          thumbnails.appendChild(
            button
          );
        }
      );


      photoBox.appendChild(
        thumbnails
      );
    }


    showGalleryPhoto(
      photos,
      0,
      mainArea,
      thumbnails
    );


  } catch (error) {

    photoBox.innerHTML = `
      <span>Լուսանկարը չբեռնվեց</span>
      <small>
        ${error.message}
      </small>
    `;
  }
}


/* =========================================
   SOURCES
   ========================================= */

async function loadObjectSources(
  objectId
) {

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
            apikey:
              SUPABASE_KEY
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
      [
        ...new Set(
          links.map(
            link =>
              link.source_id
          )
        )
      ];


    const sourceUrl =
      `${SUPABASE_URL}/rest/v1/sources` +
      `?id=in.(${sourceIds.join(',')})` +
      `&select=id,title,organization,source_type,url,publication_year`;


    const sourceResponse =
      await fetch(
        sourceUrl,
        {
          headers: {
            apikey:
              SUPABASE_KEY
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
          source =>
            source.id ===
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


      item.appendChild(
        title
      );


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


        item.appendChild(
          meta
        );
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
    input =>
      input.value
  );
}


function getPinnedObjects() {

  return allObjects.filter(
    item =>
      pinnedObjectIds.has(
        Number(item.id)
      )
  );
}


function getActiveLayerObjects(
  selectedTypes
) {

  return allObjects.filter(
    item =>
      selectedTypes.includes(
        item.type
      )
  );
}


function mergeObjectsById(
  ...groups
) {

  const byId =
    new Map();


  groups
    .flat()
    .forEach(item => {

      if (!item) {
        return;
      }


      byId.set(
        Number(item.id),
        item
      );
    });


  return Array.from(
    byId.values()
  );
}


function applyFilters() {

  const searchInput =
    document.getElementById(
      'search'
    );


  const search =
    searchInput
      .value
      .trim()
      .toLowerCase();


  const selectedTypes =
    getSelectedTypes();


  // Thematic layers are cumulative: every checked object type stays active.
  // When a search term is present, it also narrows the objects drawn from
  // those active layers. Example: search "Հրազդան" + check "Գետեր"
  // => show only the matching Hrazdan river, not every river.
  const activeLayerObjects =
    getActiveLayerObjects(
      selectedTypes
    );


  const layerObjects =
    activeLayerObjects.filter(
      item =>
        !search ||
        (item.name_hy || '')
          .toLowerCase()
          .includes(search)
    );


  // Explicitly opened objects remain on the map even when their category is
  // not currently checked. Search affects thematic layers, but does not
  // silently remove objects the user explicitly opened/pinned.
  const pinnedObjects =
    getPinnedObjects();


  const mapObjects =
    mergeObjectsById(
      layerObjects,
      pinnedObjects
    );


  // The side list follows the search text. Unrelated pinned objects may stay
  // on the map, but are not shown as search results.
  const listObjects =
    mapObjects.filter(
      item =>
        !search ||
        (item.name_hy || '')
          .toLowerCase()
          .includes(search)
    );


  renderList(
    listObjects
  );


  renderMarkers(
    mapObjects
  );


  const status =
    document.getElementById(
      'status'
    );


  if (
    selectedTypes.length === 0 &&
    pinnedObjects.length === 0
  ) {

    status.textContent =
      'Ընտրեք մեկ կամ մի քանի շերտ, կամ բացեք որևէ օբյեկտ։';

  } else {

    const layerLabel =
      selectedTypes.length
        ? `Միացված է ${selectedTypes.length} շերտ`
        : 'Շերտեր միացված չեն';


    const pinnedLabel =
      pinnedObjects.length
        ? `, ընտրված է ${pinnedObjects.length} օբյեկտ`
        : '';


    status.textContent =
      `${layerLabel}${pinnedLabel}։ Քարտեզում՝ ${mapObjects.length} օբյեկտ։`;
  }
}

/* =========================================
   GEOMETRY
   ========================================= */

async function loadObjectGeometry(
  objectId
) {

  const url =
    `${SUPABASE_URL}/rest/v1/rpc/get_water_object_geometry`;


  try {

    const response =
      await fetch(
        url,
        {
          method: 'POST',
          headers: {
            apikey:
              SUPABASE_KEY,
            'Content-Type':
              'application/json'
          },
          body:
            JSON.stringify({
              p_object_id:
                objectId
            })
        }
      );


    if (!response.ok) {

      throw new Error(
        `HTTP ${response.status}`
      );
    }


    return await response.json();


  } catch (error) {

    console.error(
      `Geometry load error for object ${objectId}:`,
      error
    );

    return null;
  }
}


/* =========================================
   LOAD OBJECTS
   ========================================= */

async function loadObjects() {

  const url =
    `${SUPABASE_URL}/rest/v1/water_objects` +
    `?select=id,type,name_hy,name_en,name_ru,province,basin,description_hy,status,latitude,longitude,elevation_m,length_km,area_km2,max_depth_m,volume_m3,discharge_m3s,year,height_m,height_min_m,height_max_m,river_name,cascade_name,installed_capacity_mw,available_capacity_mw,annual_generation_gwh,hydropower_kind,operation_regime,operator` +
    `&order=name_hy.asc`;


  try {

    const response =
      await fetch(
        url,
        {
          headers: {
            apikey:
              SUPABASE_KEY
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


    const geometryObjects =
      allObjects.filter(item =>
        item.type === 'river' ||
        (
          item.type === 'lake' &&
          item.name_hy === 'Սևանա լիճ'
        )
      );


    await Promise.all(
      geometryObjects.map(
        async item => {

          item.geometry =
            await loadObjectGeometry(
              item.id
            );
        }
      )
    );


    // Start with a clean map. Objects appear only after the user
    // selects one or more object types from the menu.
    document
      .querySelectorAll(
        '.type-filter'
      )
      .forEach(input => {
        input.checked = false;
      });


    renderList(
      []
    );


    renderMarkers(
      []
    );


    map.fitBounds(
      ARMENIA_BOUNDS,
      {
        padding: [24, 24],
        maxZoom: 8
      }
    );


    document
      .getElementById(
        'status'
      )
      .textContent =
        'Ընտրեք մեկ կամ մի քանի շերտ, կամ բացեք որևէ օբյեկտ։';


    const initialId =
      getObjectIdFromUrl();


    window.history.replaceState(
      {
        objectId:
          initialId || null
      },
      '',
      window.location.href
    );


    if (initialId) {

      const item =
        findObjectById(
          initialId
        );


      if (item) {

        pinnedObjectIds.add(
          Number(item.id)
        );


        applyFilters();


        focusObjectOnMap(
          item,
          13
        );


        await openObjectDetails(
          item,
          false
        );
      }
    }


  } catch (error) {

    document
      .getElementById(
        'status'
      )
      .textContent =
        `Տվյալների ստացման սխալ՝ ${error.message}`;
  }
}


/* =========================================
   HYDROPOWER MENU ITEM
   ========================================= */

function ensureHydropowerTypeFilter() {

  if (
    document.querySelector(
      '.type-filter[value="hydropower"]'
    )
  ) {
    return;
  }


  const existingFilters =
    Array.from(
      document.querySelectorAll(
        '.type-filter'
      )
    );


  if (!existingFilters.length) {
    return;
  }


  const templateInput =
    existingFilters[
      existingFilters.length - 1
    ];


  const templateLabel =
    templateInput.closest('label');


  if (!templateLabel) {
    return;
  }


  const newLabel =
    templateLabel.cloneNode(true);


  const newInput =
    newLabel.querySelector(
      '.type-filter'
    );


  if (!newInput) {
    return;
  }


  newInput.value =
    'hydropower';

  newInput.checked =
    false;


  // Replace the visible label while preserving the page's existing
  // checkbox markup and CSS classes.
  const textNodes =
    Array.from(
      newLabel.childNodes
    ).filter(
      node =>
        node.nodeType ===
        Node.TEXT_NODE
    );


  if (textNodes.length) {

    textNodes[
      textNodes.length - 1
    ].textContent =
      ' ՀԷԿ-եր';

  } else {

    const visibleText =
      newLabel.querySelector(
        'span'
      );


    if (visibleText) {
      visibleText.textContent =
        'ՀԷԿ-եր';
    } else {
      newLabel.append(
        document.createTextNode(
          ' ՀԷԿ-եր'
        )
      );
    }
  }


  templateLabel.parentElement.insertBefore(
    newLabel,
    templateLabel.nextSibling
  );
}


ensureHydropowerTypeFilter();


/* =========================================
   CUMULATIVE LAYER CONTROLS
   ========================================= */

function ensureLayerControls() {

  if (
    document.getElementById(
      'water-layer-controls'
    )
  ) {
    return;
  }


  const filters =
    Array.from(
      document.querySelectorAll(
        '.type-filter'
      )
    );


  if (!filters.length) {
    return;
  }


  const lastLabel =
    filters[
      filters.length - 1
    ].closest('label');


  if (
    !lastLabel ||
    !lastLabel.parentElement
  ) {
    return;
  }


  const controls =
    document.createElement(
      'div'
    );


  controls.id =
    'water-layer-controls';


  controls.style.display =
    'flex';

  controls.style.gap =
    '6px';

  controls.style.flexWrap =
    'wrap';

  controls.style.marginTop =
    '10px';


  const allButton =
    document.createElement(
      'button'
    );


  allButton.type =
    'button';

  allButton.textContent =
    'Ցուցադրել բոլորը';

  allButton.title =
    'Միացնել բոլոր ջրային օբյեկտների շերտերը';


  const clearButton =
    document.createElement(
      'button'
    );


  clearButton.type =
    'button';

  clearButton.textContent =
    'Մաքրել քարտեզը';

  clearButton.title =
    'Անջատել բոլոր շերտերը և հանել ընտրված օբյեկտները';


  [allButton, clearButton]
    .forEach(button => {

      button.style.padding =
        '6px 9px';

      button.style.border =
        '1px solid #c7d2e0';

      button.style.borderRadius =
        '7px';

      button.style.background =
        '#ffffff';

      button.style.cursor =
        'pointer';

      button.style.fontSize =
        '12px';
    });


  allButton.addEventListener(
    'click',
    () => {

      document
        .querySelectorAll(
          '.type-filter'
        )
        .forEach(input => {
          input.checked = true;
        });


      applyFilters();
    }
  );


  clearButton.addEventListener(
    'click',
    () => {

      document
        .querySelectorAll(
          '.type-filter'
        )
        .forEach(input => {
          input.checked = false;
        });


      pinnedObjectIds.clear();


      const searchInput =
        document.getElementById(
          'search'
        );


      if (searchInput) {
        searchInput.value = '';
      }


      applyFilters();


      map.fitBounds(
        ARMENIA_BOUNDS,
        {
          padding: [24, 24],
          maxZoom: 8
        }
      );


      closeObjectDetails(
        true
      );
    }
  );


  controls.appendChild(
    allButton
  );


  controls.appendChild(
    clearButton
  );


  lastLabel.parentElement.insertBefore(
    controls,
    lastLabel.nextSibling
  );
}


ensureLayerControls();


/* =========================================
   EVENTS
   ========================================= */

document
  .getElementById(
    'search'
  )
  .addEventListener(
    'input',
    applyFilters
  );


document
  .querySelectorAll(
    '.type-filter'
  )
  .forEach(input => {

    input.addEventListener(
      'change',
      () => {

        // Multiple object types may be active simultaneously.
        // Checking a new layer never hides the layers that are already on.
        applyFilters();
      }
    );
  });


document
  .getElementById(
    'details-close'
  )
  .addEventListener(
    'click',
    () => {

      closeObjectDetails(
        true
      );
    }
  );


window.addEventListener(
  'popstate',
  async () => {

    const objectId =
      getObjectIdFromUrl();


    if (!objectId) {

      closeObjectDetails(
        false
      );

      return;
    }


    const item =
      findObjectById(
        objectId
      );


    if (!item) {
      return;
    }


    pinnedObjectIds.add(
      Number(item.id)
    );


    applyFilters();


    focusObjectOnMap(
      item,
      13
    );


    await openObjectDetails(
      item,
      false
    );
  }
);


/* =========================================
   START
   ========================================= */

loadObjects();
