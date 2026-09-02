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

// Small natural lakes and waterfalls use fixed-size symbols. At low zoom levels
// nearby symbols are gently displaced in screen space so they do not cover each other.
// Their true coordinates are preserved separately and used for details/focus.
let smallLakeCollisionMarkers = [];
let smallLakeConnectorLines = [];


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
