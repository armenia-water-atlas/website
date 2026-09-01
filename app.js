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
  wetland: 'Խոնավ տարածք'
};


const STATUS_LABELS = {
  natural: 'Բնական'
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
let riverRelations = [];

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

  markers = [];
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


  return html;
}


/* =========================================
   MARKERS
   ========================================= */

function renderMarkers(data) {

  clearMarkers();


  const mapped =
    data.filter(item =>
      item.geometry ||
      (
        item.latitude !== null &&
        item.longitude !== null
      )
    );


  mapped.forEach(item => {

    let layer = null;


    if (item.geometry) {

      const riverLayer =
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


      riverLayer.eachLayer(part => {

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


      riverLayer.waterObjectId =
        item.id;


      layer =
        riverLayer;

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


  document
    .getElementById(
      'map-count'
    )
    .textContent =
      `Քարտեզագրված՝ ${mapped.length}`;


  if (getObjectIdFromUrl()) {
    return;
  }


  if (
    data.length ===
    allObjects.length
  ) {

    map.setView(
      ARMENIA_CENTER,
      ARMENIA_ZOOM
    );

    return;
  }


  if (mapped.length === 1) {

    focusObjectOnMap(
      mapped[0],
      13
    );

    return;
  }


  if (mapped.length > 1) {

    const group =
      L.featureGroup(
        markers
      );


    const bounds =
      group.getBounds();


    if (bounds.isValid()) {

      map.fitBounds(
        bounds,
        {
          padding: [30, 30],
          maxZoom: 10
        }
      );
    }
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
   RIVER RELATIONS
   ========================================= */

async function loadRiverRelations() {

  const url =
    `${SUPABASE_URL}/rest/v1/river_relations` +
    `?select=tributary_id,recipient_id,relation_type`;


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


    riverRelations =
      await response.json();


    console.log(
      `River relations loaded: ${riverRelations.length}`
    );


  } catch (error) {

    console.error(
      'River relations load error:',
      error
    );


    riverRelations = [];
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


function applyFilters() {

  const search =
    document
      .getElementById(
        'search'
      )
      .value
      .trim()
      .toLowerCase();


  const selectedTypes =
    getSelectedTypes();


  const filtered =
    allObjects.filter(
      item => {

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
      }
    );


  renderList(
    filtered
  );


  renderMarkers(
    filtered
  );


  document
    .getElementById(
      'status'
    )
    .textContent =
      `Ցուցադրվում է ${filtered.length} օբյեկտ՝ ընդհանուր ${allObjects.length}-ից։`;
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
    `?select=id,type,name_hy,name_en,name_ru,province,basin,description_hy,status,latitude,longitude,elevation_m,length_km,area_km2,max_depth_m,volume_m3,discharge_m3s,year,height_m,height_min_m,height_max_m` +
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

await loadRiverRelations();
    const hrazdan =
      findObjectById(
        28
      );


    if (hrazdan) {

      hrazdan.geometry =
        await loadObjectGeometry(
          28
        );
    }

const marmarik =
  findObjectById(
    29
  );


if (marmarik) {

  marmarik.geometry =
    await loadObjectGeometry(
      29
    );
}
    renderList(
      allObjects
    );


    renderMarkers(
      allObjects
    );


    document
      .getElementById(
        'status'
      )
      .textContent =
        `Բազայից ստացվել է ${allObjects.length} ջրային օբյեկտ։`;


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
      applyFilters
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
