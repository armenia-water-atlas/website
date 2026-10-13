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
  construction: 'Կառուցվող',
  industrial: 'Արդյունաբերական'
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
// Used for the initial view and the explicit clear-map action.
const ARMENIA_BOUNDS = L.latLngBounds(
  [38.82, 43.40],
  [41.32, 46.70]
);


const map = L.map(
  'map',
  {
    zoomSnap: 0.1,
    zoomDelta: 0.5
  }
).setView(
  ARMENIA_CENTER,
  ARMENIA_ZOOM
);


// Fit the national overview to the visible map, including on short screens.
function sizeAtlasMap() {
  const container = map.getContainer();
  if (window.matchMedia('(min-width: 761px)').matches) {
    const top = container.getBoundingClientRect().top + window.scrollY;
    container.style.minHeight = '0';
    container.style.height = Math.max(240, window.innerHeight - top - 12) + 'px';
  } else {
    container.style.removeProperty('min-height');
    container.style.removeProperty('height');
  }
  map.invalidateSize({pan: false, animate: false});
}

function showArmeniaOverview() {
  sizeAtlasMap();
  map.fitBounds(ARMENIA_BOUNDS, {
    padding: [12, 12],
    maxZoom: 8,
    animate: false
  });
}

const sharedAtlasView = parseSharedAtlasView(window.location.hash);
if (sharedAtlasView) {
  sizeAtlasMap();
  map.setView([sharedAtlasView.lat, sharedAtlasView.lng], sharedAtlasView.zoom, {animate: false});
} else showArmeniaOverview();
window.addEventListener('resize', () => {
  const wasOverview = map.getBounds().contains(ARMENIA_BOUNDS);
  sizeAtlasMap();
  if (wasOverview) showArmeniaOverview();
});

L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    maxZoom: 19,
    attribution:
      '&copy; OpenStreetMap contributors'
  }
).addTo(map);


// River basin prototype: Debed. HydroBASINS v1c level 08 upstream union.
// See WATERSHED-NOTICE.txt. No nationwide Araks/Kura overlay.
const debedBasinData = {"type":"Feature","properties":{"name":"Դեբեդի ջրահավաք ավազան"},"geometry":{"type":"Polygon","coordinates":[[[44.61250000000002,41.16666666666669],[44.61311764187285,41.168826802571644],[44.616105143229184,41.172916666666694],[44.61188235812719,41.178697543674076],[44.61318223741321,41.19900377061635],[44.61882680257163,41.20061764187286],[44.62283986409507,41.203549024793865],[44.6354934692383,41.20478430853952],[44.639506530761736,41.207715691460535],[44.6479934692383,41.20895097520619],[44.65200653076174,41.2118823581272],[44.67002631293405,41.213205634223115],[44.67169477674698,41.22466888427737],[44.67700653076174,41.228549024793864],[44.68132680257163,41.22978430853952],[44.68533986409507,41.232715691460534],[44.69155273437502,41.23449215359161],[44.695215691460525,41.239506530761744],[44.69666510687936,41.24946492513024],[44.706173197428406,41.25771569146053],[44.7104934692383,41.25895097520619],[44.71450653076174,41.261882358127195],[44.722993469238304,41.26311764187286],[44.72700653076174,41.266049024793865],[44.73340793185766,41.26787923177086],[44.72854902479386,41.27453087700741],[44.729784308539514,41.28132680257164],[44.73271569146053,41.28533986409508],[44.7344921535916,41.29155273437503],[44.73950653076174,41.295215691460534],[44.74166666666669,41.29583333333336],[44.742233954535614,41.29804382324222],[44.75776604546443,41.314456176757844],[44.75890062120228,41.323043823242216],[44.7619327121311,41.32695617675784],[44.76306728786894,41.33137715657555],[44.77026604546443,41.33945617675784],[44.771400621202275,41.34387715657555],[44.77539588080514,41.349032253689266],[44.781377156575545,41.350567287868955],[44.78528951009117,41.353599378797774],[44.79494594997832,41.3548751831055],[44.795833333333356,41.35833333333336],[44.80242445203995,41.35868665907121],[44.80662044949004,41.36285332573787],[44.81492445203995,41.362146674262185],[44.826742214626755,41.35035332573788],[44.83575778537329,41.34964667426218],[44.83995378282337,41.34548000759551],[44.84409111870662,41.34618665907121],[44.84757554796009,41.34964667426218],[44.85659111870662,41.35035332573788],[44.86007554796009,41.35381334092885],[44.86909111870662,41.35451999240454],[44.87257554796009,41.357980007595515],[44.88992445203995,41.35868665907121],[44.893408881293425,41.362146674262185],[44.90659111870662,41.36285332573787],[44.91007554796009,41.36631334092885],[44.91909111870662,41.36701999240454],[44.92257554796009,41.37048000759552],[44.93159111870662,41.37118665907121],[44.93507554796009,41.37464667426218],[44.93992445203995,41.375353325737876],[44.94340888129342,41.37881334092885],[44.95416666666669,41.3791666666667],[44.95416666666669,41.37500000000003],[44.961563110351584,41.37438947889543],[44.96301371256513,41.36973266601566],[44.954696316189256,41.36058163113067],[44.95363701714412,41.356085035536054],[44.95052964952259,41.35224829779734],[44.949470350477455,41.34775170220272],[44.94113701714412,41.33858303493926],[44.94219631618926,41.33525170220272],[44.945303683810785,41.331414964464],[44.94636298285592,41.31858503553605],[44.957958984375026,41.30625000000003],[44.94636298285592,41.29391496446401],[44.945303683810785,41.27691836886939],[44.93386298285593,41.26474829779734],[44.93333333333336,41.26250000000003],[44.934470621744815,41.25806867811418],[44.93958333333335,41.26203121609161],[44.9436228434245,41.25890062120229],[44.96054382324221,41.257766045464436],[44.964456176757835,41.25473395453562],[44.970187717013914,41.2532631768121],[44.98276604546443,41.23971048990888],[44.983333333333356,41.23333333333336],[44.98009304470489,41.23240695529517],[44.97854919433596,41.22700653076175],[44.971450805664084,41.21882680257164],[44.97021586100263,41.214506530761746],[44.96311747233075,41.206326802571645],[44.96152818467884,41.20076819525828],[44.95073513454864,41.19919738769534],[44.94938252766929,41.18533986409508],[44.93713955349395,41.17192162407772],[44.93009304470488,41.16990695529517],[44.92854919433596,41.16450653076175],[44.92488606770836,41.15949215359161],[44.91867302788631,41.15771569146053],[44.90632697211374,41.14645080566409],[44.90200636121964,41.14521586100263],[44.893826972113736,41.138117472330755],[44.885339694552975,41.1368825276693],[44.88132697211374,41.13395080566409],[44.87916666666669,41.13333333333336],[44.878599378797766,41.126956176757844],[44.87546861436634,41.1229166666667],[44.878599378797766,41.11887715657555],[44.88038160536026,41.11193271213111],[44.88971048990888,41.11306728786895],[44.893750000000026,41.116198052300376],[44.897789510091165,41.11306728786895],[44.906377156575545,41.11193271213111],[44.91028951009117,41.10890062120228],[44.91994594997832,41.10762498643666],[44.92140062120228,41.10195617675784],[44.9244327121311,41.098043823242215],[44.925567287868944,41.093622843424505],[44.92859937879776,41.08971048990888],[44.93006625705297,41.08399454752607],[44.93750000000002,41.083333333333364],[44.93835076226131,41.08001742892798],[44.94166666666669,41.079166666666694],[44.940949503580754,41.0718197292752],[44.93533969455297,41.07021586100263],[44.93132697211374,41.06728413899742],[44.92283969455298,41.06604919433597],[44.918826972113735,41.06311747233076],[44.913268364800366,41.06152818467885],[44.911690606011305,41.05068800184465],[44.88950636121964,41.049382527669295],[44.87716030544707,41.038117472330754],[44.86867302788631,41.0368825276693],[44.860493638780405,41.02978413899742],[44.85617302788631,41.028549194335966],[44.852083333333354,41.025561523437524],[44.8479936387804,41.028549194335966],[44.843673027886304,41.02978413899742],[44.83966013590497,41.03271586100263],[44.835339864095076,41.03395080566409],[44.82716013590497,41.04104919433596],[44.82283986409507,41.042284138997424],[44.81466013590497,41.049382527669295],[44.81250000000002,41.050000000000026],[44.811590745714,41.04645690917972],[44.80000000000002,41.04583333333336],[44.799338785807315,41.03839959038631],[44.79206254747181,41.036532253689266],[44.78806728786895,41.031377156575545],[44.7869327121311,41.02695617675784],[44.78390062120228,41.02304382324221],[44.78248240152997,41.01751742892798],[44.776956176757835,41.01609937879777],[44.77304382324221,41.01306728786895],[44.758333333333354,41.012500000000024],[44.755017598470076,41.011649237738744],[44.75416666666669,41.00833333333336],[44.755070156521285,41.00481228298614],[44.7686228434245,40.992233954535614],[44.774149068196635,40.99081590440541],[44.775850931803404,40.98418409559464],[44.781377156575545,40.98276604546444],[44.78528951009117,40.97973395453562],[44.79100545247398,40.97826707628041],[44.791666666666686,40.97083333333336],[44.79804382324221,40.970266045464435],[44.801956176757834,40.967233954535615],[44.80637715657554,40.96609937879777],[44.81445617675784,40.95890062120228],[44.81887715657554,40.95776604546444],[44.82425333658856,40.95359937879777],[44.839710489908875,40.95473395453562],[44.8436228434245,40.95776604546444],[44.85221048990888,40.95890062120228],[44.85758666992189,40.96306728786895],[44.869936794704884,40.96182623969187],[44.87168409559464,40.95501742892798],[44.87500000000002,40.954166666666694],[44.87500000000002,40.94583333333336],[44.875642903645854,40.943698459201414],[44.88273044162329,40.93542141384551],[44.879809570312524,40.931301540798636],[44.87852376302086,40.92703179253475],[44.875642903645854,40.9229682074653],[44.87422858344186,40.90910474989152],[44.85862257215714,40.907512749565996],[44.85352376302085,40.90032179090714],[44.861857096354186,40.88963487413197],[44.86314290364586,40.885365125868084],[44.86730957031252,40.879488457573814],[44.86314290364586,40.872968207465306],[44.861857096354186,40.86869845920141],[44.85897623697919,40.86463487413197],[44.85769042968752,40.86036512586808],[44.85477294921877,40.856250000000024],[44.85769042968752,40.85213487413197],[44.858333333333356,40.84166666666669],[44.85174221462676,40.84131334092884],[44.848257785373285,40.837853325737875],[44.84340888129343,40.83714667426218],[44.82952440049915,40.82328762478301],[44.82916666666669,40.82083333333336],[44.81424221462676,40.82048000759551],[44.81075778537328,40.81701999240454],[44.80833333333335,40.81666666666669],[44.78841569688587,40.81606818305124],[44.78664906819664,40.809184095594645],[44.7811228434245,40.80776604546443],[44.777210489908875,40.804733954535614],[44.76666666666669,40.80416666666669],[44.765767076280405,40.800661214192736],[44.758333333333354,40.800000000000026],[44.75736168755427,40.796601698133706],[44.74783986409507,40.79521586100263],[44.74382680257163,40.792284138997424],[44.73950653076174,40.79104919433596],[44.7354934692383,40.788117472330754],[44.72283986409507,40.7868825276693],[44.71875000000002,40.78389485677086],[44.71466013590497,40.7868825276693],[44.710339864095076,40.788117472330754],[44.70632680257164,40.79104919433596],[44.702006530761736,40.792284138997424],[44.697916666666686,40.79527180989586],[44.69375000000002,40.79222819010419],[44.68796912299264,40.79645080566409],[44.67995418972441,40.79499409993492],[44.6782180786133,40.783065795898466],[44.67291666666669,40.786938476562526],[44.66882680257164,40.78395080566409],[44.64757554796009,40.78298000759551],[44.63785552978518,40.773286268446206],[44.63714667426217,40.76424221462676],[44.62951999240453,40.75659111870662],[44.628813340928836,40.75174221462676],[44.62535332573787,40.74825778537329],[44.62500000000002,40.69166666666669],[44.614242214626756,40.69201999240454],[44.61075778537328,40.69548000759551],[44.59583333333335,40.695833333333354],[44.59583333333335,40.700000000000024],[44.5936228434245,40.70056728786895],[44.589710489908875,40.70359937879777],[44.585289510091165,40.70473395453561],[44.58137715657554,40.70776604546443],[44.56445617675783,40.70890062120228],[44.560543823242206,40.7119327121311],[44.557586669921896,40.713067287868945],[44.55221048990887,40.70890062120228],[44.54668426513674,40.70748257107207],[44.544982401529964,40.70085076226131],[44.53945617675783,40.6994327121311],[44.53554382324221,40.69640062120228],[44.52500000000002,40.695833333333354],[44.52464667426217,40.698257785373286],[44.51912112765844,40.703810967339436],[44.510075547960085,40.70451999240454],[44.506591118706616,40.70798000759551],[44.49757554796009,40.708686659071205],[44.49375000000002,40.71248541937936],[44.48992445203995,40.708686659071205],[44.4857871161567,40.70798000759551],[44.48125000000002,40.71248541937936],[44.47742445203995,40.708686659071205],[44.46840888129342,40.70798000759551],[44.46492445203995,40.70451999240454],[44.46250000000002,40.704166666666694],[44.46007554796009,40.70451999240454],[44.45659111870661,40.70798000759551],[44.452451070149756,40.708686659071205],[44.444091118706616,40.70035332573787],[44.43924221462675,40.699646674262176],[44.43575778537328,40.6961866590712],[44.426742214626756,40.69548000759551],[44.42291666666669,40.69168124728735],[44.41909111870662,40.69548000759551],[44.406620449490035,40.6961866590712],[44.40242445203995,40.69201999240454],[44.40000000000002,40.69166666666669],[44.399432712131095,40.70221048990888],[44.396400621202275,40.7061228434245],[44.394982401529965,40.71164923773874],[44.38945617675783,40.713067287868945],[44.38137715657554,40.720266045464435],[44.37695617675783,40.72140062120228],[44.373043823242206,40.724432712131104],[44.3686228434245,40.72556728786895],[44.36471048990887,40.72859937879777],[44.35833333333335,40.72916666666669],[44.357433742947066,40.73267211914065],[44.3436228434245,40.73390062120228],[44.33958333333335,40.737031385633706],[44.335543823242205,40.73390062120228],[44.32008666992189,40.73276604546444],[44.31471048990887,40.7369327121311],[44.30195617675783,40.73806728786895],[44.29387715657554,40.74526604546443],[44.28422071668839,40.74654168023006],[44.28333333333335,40.75000000000003],[44.25508473714194,40.749411010742215],[44.25359937879776,40.743622843424504],[44.25056728786894,40.73971048990888],[44.249432712131096,40.73528951009117],[44.24640062120228,40.73137715657555],[44.24583333333335,40.72500000000002],[44.23945617675783,40.72556728786895],[44.23541666666668,40.72869805230037],[44.23137715657554,40.72556728786895],[44.198988342285176,40.724432712131104],[44.18006218804255,40.74234381781687],[44.178599378797756,40.74804382324221],[44.17556728786894,40.75195617675784],[44.17386288113066,40.75859781901044],[44.16887715657554,40.75473395453562],[44.1561228434245,40.753599378797766],[44.15208333333335,40.75046861436634],[44.148043823242205,40.753599378797766],[44.139456176757825,40.75473395453562],[44.13137715657554,40.7619327121311],[44.129166666666684,40.762500000000024],[44.12674221462675,40.762146674262176],[44.12325778537328,40.7586866590712],[44.11840888129342,40.75798000759551],[44.11492445203994,40.75451999240454],[44.110075547960086,40.75381334092884],[44.10659111870661,40.75035332573787],[44.104166666666686,40.75000000000003],[44.08528951009116,40.75056728786895],[44.081377156575535,40.753599378797766],[44.07188771565757,40.7548529730903],[44.07026604546442,40.759079996744816],[44.07443271213109,40.76445617675784],[44.07556728786894,40.767654758029536],[44.06306728786894,40.781122843424505],[44.06193271213109,40.785543823242215],[44.05744086371529,40.790929836697075],[44.049253336588556,40.79223395453562],[44.04387715657553,40.78806728786895],[44.03675333658856,40.786932712131104],[44.03137715657554,40.79109937879777],[44.01756625705297,40.7923278808594],[44.01609937879776,40.79804382324221],[44.00890062120227,40.806122843424504],[44.00776604546442,40.81054382324221],[44.0047339545356,40.81445617675784],[44.00359937879776,40.82721048990888],[43.99223395453561,40.839456176757835],[43.991099378797756,40.843877156575545],[43.987968783908435,40.84791666666669],[43.991099378797756,40.85195617675784],[43.99223395453561,40.85637715657555],[43.995266045464426,40.86028951009117],[43.99640062120227,40.86471048990888],[44.01193271213109,40.88112284342451],[44.013067287868935,40.885543823242216],[44.01609937879776,40.88945617675784],[44.01666666666668,40.89583333333336],[44.010075547960085,40.89548000759551],[44.00659111870661,40.89201999240454],[44.00245107014975,40.891313340928846],[43.99409111870661,40.89964667426218],[43.985075547960086,40.900353325737875],[43.98159111870661,40.90381334092885],[43.96840888129342,40.90451999240454],[43.964924452039945,40.90798000759551],[43.95590888129342,40.90868665907121],[43.95242445203994,40.91214667426218],[43.95000000000003,40.91250000000002],[43.949470520019545,40.91474812825523],[43.936977471245676,40.92803751627607],[43.93838636610244,40.9325608995226],[43.94391496446399,40.93386298285593],[43.94936455620661,40.938552178276936],[43.95052947998048,40.948081461588565],[43.95780385335288,40.95608520507815],[43.958862813313814,40.96058146158857],[43.96197052001955,40.964418538411486],[43.96250000000001,40.9666666666667],[43.964924452039945,40.96701999240454],[43.969120449490035,40.97118665907121],[43.99409111870661,40.97048000759551],[43.998287116156696,40.96631334092885],[44.002424452039946,40.96701999240454],[44.005908881293415,40.97048000759551],[44.01075778537328,40.97118665907121],[44.01424221462675,40.97464667426218],[44.01909111870661,40.97535332573787],[44.02257554796009,40.978813340928845],[44.027424452039945,40.97951999240454],[44.03090888129342,40.982980007595515],[44.033333333333346,40.98333333333336],[44.03276604546443,40.98554382324222],[44.028168911404094,40.991056315104196],[44.00195617675783,40.992233954535614],[43.9980438232422,40.99526604546443],[43.99232788085939,40.99673292371965],[43.991099378797756,41.010543823242216],[43.97140062120227,41.031122843424505],[43.97026604546443,41.03407999674482],[43.97443271213109,41.03945617675784],[43.97556728786894,41.04804382324222],[43.97859937879776,41.05195617675784],[43.97916666666668,41.075000000000024],[43.97257554796008,41.07535332573787],[43.964924452039945,41.082980007595516],[43.96007554796008,41.083686659071205],[43.95659111870661,41.08714667426218],[43.95062357584637,41.08840908474395],[43.95000000000003,41.10000000000003],[43.9508509318034,41.103315904405406],[43.95416666666668,41.10416666666669],[43.95475955539281,41.128249443901936],[43.95833333333335,41.12916666666669],[43.9579800075955,41.13575778537329],[43.95451999240453,41.13924221462676],[43.95381334092883,41.15171305338544],[43.9579800075955,41.15590888129343],[43.95833333333335,41.16250000000003],[43.955017598470064,41.163350931803414],[43.953599378797755,41.16887715657555],[43.950567287868935,41.17278951009117],[43.95000000000003,41.175000000000026],[43.954166666666694,41.175000000000026],[43.95793745252823,41.17596774631079],[43.96193271213109,41.181122843424504],[43.9633509318034,41.186649068196644],[43.969091118706615,41.187853325737876],[43.97257554796008,41.19131334092885],[43.98575778537328,41.19201999240454],[43.98924221462675,41.19548000759551],[43.99409111870661,41.19618665907121],[43.99791666666668,41.19998541937937],[44.002083333333346,41.19584791395402],[44.005908881293415,41.19964667426218],[44.01492445203995,41.20035332573788],[44.01840888129342,41.203813340928846],[44.02325778537328,41.203813340928846],[44.027453782823365,41.19964667426218],[44.031591118706615,41.20035332573788],[44.03507554796008,41.203813340928846],[44.03992445203995,41.20451999240454],[44.043408881293416,41.207980007595516],[44.05242445203994,41.20868665907121],[44.05590888129342,41.21214667426218],[44.06909111870661,41.212853325737875],[44.072575547960085,41.21631334092885],[44.102452935112865,41.21702067057294],[44.1079800075955,41.2225755479601],[44.10869140625002,41.22745683458119],[44.11424221462675,41.232980007595515],[44.12325778537328,41.23368665907121],[44.12674221462675,41.237146674262185],[44.152424452039945,41.23785332573787],[44.16424221462675,41.24964667426218],[44.17083333333335,41.25000000000003],[44.17325778537328,41.24964667426218],[44.18090888129342,41.24201999240454],[44.18575778537328,41.24131334092885],[44.18924221462675,41.23785332573787],[44.194091118706616,41.237146674262185],[44.197575547960085,41.23368665907121],[44.21075778537328,41.232980007595515],[44.21424221462675,41.22951999240454],[44.22742445203995,41.22951999240454],[44.23541598849828,41.23748609754777],[44.239242214626756,41.23368665907121],[44.24412350124785,41.232975260416694],[44.249646674262166,41.22742445203996],[44.25035807291668,41.22254316541886],[44.25590888129342,41.217019992404545],[44.26078847249351,41.21630893283423],[44.2704800075955,41.206591118706626],[44.27143842909073,41.20199398464629],[44.27439490424264,41.19800601535376],[44.27595045301651,41.19242011176218],[44.28550601535375,41.19106157090932],[44.29112599690757,41.18689490424265],[44.30633934868708,41.18810509575741],[44.31032731797962,41.19106157090932],[44.32300601535375,41.19227176242407],[44.326993984646286,41.19522823757598],[44.339672682020414,41.19643842909074],[44.34366065131295,41.19939490424265],[44.34956681993275,41.20103963216149],[44.36189490424264,41.214493984646296],[44.3632768419054,41.22421518961591],[44.37159135606556,41.225443861219645],[44.37699398464628,41.22143842909074],[44.38750000000002,41.22083333333336],[44.3883509318034,41.21751759847008],[44.39387715657554,41.21609937879777],[44.397789510091165,41.21306728786895],[44.4035837809245,41.211580234103764],[44.4119327121311,41.202210489908886],[44.412500000000016,41.20000000000003],[44.41492445203995,41.19964667426218],[44.41840888129342,41.19618665907121],[44.43159111870661,41.19548000759551],[44.43507554796009,41.19201999240454],[44.444091118706616,41.19131334092885],[44.447575547960085,41.187853325737876],[44.45661943223743,41.187144470214875],[44.466313340928835,41.17742445203996],[44.46751759847007,41.16751759847008],[44.47304382324221,41.166099378797774],[44.47695617675783,41.163067287868955],[44.4855438232422,41.161932712131104],[44.4936228434245,41.154733954535615],[44.498043823242206,41.15359937879777],[44.5061228434245,41.14640062120228],[44.51054382324221,41.14526604546444],[44.51445617675783,41.14223395453562],[44.519982401529965,41.14081590440541],[44.52168426513674,41.13418409559465],[44.5283157348633,41.132482571072075],[44.52916666666668,41.12916666666669],[44.531591118706615,41.12951999240454],[44.53507554796009,41.13298000759551],[44.53992445203995,41.13368665907121],[44.547575547960086,41.141313340928846],[44.55242445203995,41.14201999240454],[44.55590888129342,41.145480007595516],[44.569091118706616,41.146186659071205],[44.57257554796009,41.14964667426218],[44.57742445203995,41.150353325737875],[44.580908881293425,41.15381334092885],[44.58333333333335,41.1541666666667],[44.58369140625002,41.156623670789955],[44.58924221462676,41.16214667426218],[44.598257785373285,41.16285332573788],[44.60174221462675,41.166313340928845],[44.61250000000002,41.16666666666669]]]}};
map.createPane('riverBasins');
map.getPane('riverBasins').style.zIndex = '350';
map.getPane('riverBasins').style.pointerEvents = 'none';
const debedBasinLayer = L.geoJSON(debedBasinData, {
  pane: 'riverBasins', interactive: false,
  style: {color: '#b56816', weight: 2, fillColor: '#e4b64c', fillOpacity: 0.18}
});
const riverBasinAttribution = 'Ավազան՝ <a href="https://www.hydrosheds.org/products/hydrobasins" target="_blank" rel="noopener">HydroBASINS © WWF</a>';
function syncRiverBasin(fitView = false) {
  const enabled = document.getElementById('river-basin-select').value === 'debed';
  document.getElementById('river-basin-note').hidden = !enabled;
  if (enabled && !map.hasLayer(debedBasinLayer)) {
    debedBasinLayer.addTo(map);
    map.attributionControl.addAttribution(riverBasinAttribution);
  } else if (!enabled && map.hasLayer(debedBasinLayer)) {
    map.removeLayer(debedBasinLayer);
    map.attributionControl.removeAttribution(riverBasinAttribution);
  }
  if (enabled && fitView) map.fitBounds(debedBasinLayer.getBounds(), {padding: [20, 20], maxZoom: 10});
}

let allObjects = [];
let objectsLoading = true;
const geometryLoadFailures = new Set();
let markers = [];

// One selection is shared by the list, map clicks and object URLs.
// A separate, non-interactive overlay keeps mouseout from erasing selection.
let selectedObjectId = null;
let selectedRiverLayer = null;
let selectedRiverLabel = null;

function clearSelectedRiver() {
  if (selectedRiverLayer) map.removeLayer(selectedRiverLayer);
  if (selectedRiverLabel) map.removeLayer(selectedRiverLabel);
  selectedRiverLayer = null;
  selectedRiverLabel = null;
}

function selectedRiverLabelPosition(geometry) {
  const lines = geometry.type === 'LineString'
    ? [geometry.coordinates]
    : geometry.coordinates;
  let longestLine = null;
  let longestLength = -1;
  lines.forEach(line => {
    if (!Array.isArray(line) || line.length < 2) return;
    let length = 0;
    for (let i = 1; i < line.length; i += 1) {
      length += L.latLng(line[i - 1][1], line[i - 1][0])
        .distanceTo(L.latLng(line[i][1], line[i][0]));
    }
    if (length > longestLength) {
      longestLength = length;
      longestLine = line;
    }
  });
  if (!longestLine) return null;
  let remaining = longestLength / 2;
  for (let i = 1; i < longestLine.length; i += 1) {
    const a = longestLine[i - 1];
    const b = longestLine[i];
    const distance = L.latLng(a[1], a[0]).distanceTo(L.latLng(b[1], b[0]));
    if (distance >= remaining) {
      const fraction = distance > 0 ? remaining / distance : 0;
      return L.latLng(a[1] + (b[1] - a[1]) * fraction,
        a[0] + (b[0] - a[0]) * fraction);
    }
    remaining -= distance;
  }
  const end = longestLine[longestLine.length - 1];
  return L.latLng(end[1], end[0]);
}

function highlightSelectedRiver() {
  clearSelectedRiver();
  if (selectedObjectId === null) return;
  const item = findObjectById(selectedObjectId);
  if (!item || item.type !== 'river' || !item.geometry ||
      !['LineString', 'MultiLineString'].includes(item.geometry.type) ||
      !findMapLayerByObjectId(item.id)) return;

  if (!map.getPane('selectedRiverPane')) {
    const pane = map.createPane('selectedRiverPane');
    pane.style.zIndex = '450';
    pane.style.pointerEvents = 'none';
  }
  selectedRiverLayer = L.geoJSON(item.geometry, {
    pane: 'selectedRiverPane',
    interactive: false,
    style: {
      color: '#f07816', weight: 7, opacity: 1,
      lineCap: 'round', lineJoin: 'round'
    }
  }).addTo(map);

  const position = selectedRiverLabelPosition(item.geometry);
  if (position) {
    const name = document.createElement('span');
    name.textContent = item.name_hy || 'Անանուն գետ';
    name.style.color = '#9a4100';
    name.style.fontWeight = '700';
    selectedRiverLabel = L.tooltip({
      permanent: true, direction: 'top', offset: [0, -6],
      opacity: 1, interactive: false,
      className: 'selected-river-label'
    }).setLatLng(position).setContent(name).addTo(map);
  }
}



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

  clearSelectedRiver();

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

// Shared links contain map position and the visible filter choices.
function parseSharedAtlasView(hash) {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const parts = (params.get('map') || '').split('/');
  if (parts.length !== 3 || parts.some(value => !value.trim())) return null;
  const [zoom, lat, lng] = parts.map(Number);
  if (![zoom, lat, lng].every(Number.isFinite) || zoom < 0 || zoom > 19 || Math.abs(lat) > 85.05112878 || Math.abs(lng) > 180) return null;
  return {zoom, lat, lng, types: (params.get('types') || '').split(',').filter(Boolean), region: params.get('region') || 'Հայաստան', query: (params.get('q') || '').slice(0, 200), riverMin: [0,10,25,50,100].includes(Number(params.get('riverMin'))) ? Number(params.get('riverMin')) : 0, riverUnknown: params.get('riverUnknown') !== '0', riverBasin: params.get('riverBasin') === 'debed' ? 'debed' : ''};
}
function buildSharedAtlasUrl() {
  const center = map.getCenter();
  const url = new URL(window.location.href);
  const lng = ((center.lng + 180) % 360 + 360) % 360 - 180;
  const params = new URLSearchParams();
  params.set('map', [map.getZoom().toFixed(1), center.lat.toFixed(6), lng.toFixed(6)].join('/'));
  params.set('types', getSelectedTypes().join(','));
  params.set('region', getSelectedRegion());
  if (document.getElementById('river-basin-select').value === 'debed') params.set('riverBasin', 'debed');
  params.set('riverMin', String(getRiverMinimumLength()));
  params.set('riverUnknown', document.getElementById('river-include-unknown').checked ? '1' : '0');
  const query = document.getElementById('search').value.trim();
  if (query) params.set('q', query);
  url.hash = params.toString();
  return url.toString();
}
let shareMapNoticeTimer = null;
function clearShareMapNotice() {
  if (shareMapNoticeTimer !== null) clearTimeout(shareMapNoticeTimer);
  shareMapNoticeTimer = null;
  const message = document.getElementById('share-map-status');
  const fallback = document.getElementById('share-map-link');
  if (message) message.textContent = '';
  if (fallback) fallback.hidden = true;
}
function clearShareNoticeOnAction(event) {
  if (event.target.closest && event.target.closest('#share-map, #share-map-link, #share-map-status')) return;
  clearShareMapNotice();
}
async function copyAtlasView() {
  const button = document.getElementById('share-map');
  const message = document.getElementById('share-map-status');
  const fallback = document.getElementById('share-map-link');
  clearShareMapNotice();
  button.disabled = true;fallback.hidden = true;message.textContent = '';
  const url = buildSharedAtlasUrl();
  try {
    await navigator.clipboard.writeText(url);
    message.textContent = 'Հղումը պատճենված է։ Կարող եք ուղարկել։';
    shareMapNoticeTimer = setTimeout(clearShareMapNotice, 4000);
  } catch {
    fallback.hidden = false;fallback.value = url;fallback.focus();fallback.select();
    message.textContent = 'Պատճենեք ընտրված հղումը՝ Ctrl+C կամ երկար սեղմումով։';
  } finally {button.disabled = false;}
}

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

  // Cascade symbols can be displaced for readability; fit their true positions.
  if (layer && layer.waterfallBounds && layer.waterfallBounds.isValid()) {
    map.fitBounds(layer.waterfallBounds, {
      padding: [35, 35],
      maxZoom: 17
    });
    return;
  }

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
          maxZoom: item.type === 'river' ? 14 : 11
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

// Shared by the object details and the map hover card.
function hydropowerDisplayFields(item) {
  const source = item.hydropower_source_data?.psrc_2026_07_01 || {};
  const hasNumber = value => value !== null && value !== undefined &&
    value !== '' && Number.isFinite(Number(value));
  const withUnit = (value, unit) => hasNumber(value)
    ? `${new Intl.NumberFormat('hy-AM', { maximumFractionDigits: 4 }).format(Number(value))} ${unit}`
    : null;
  const fields = [
    ['Գետ', item.river_name],
    ['Ջրաղբյուր', item.water_source],
    ['Կասկադ', item.cascade_name],
    ['Տեղադրված հզորություն', withUnit(item.installed_capacity_mw, 'ՄՎտ')],
    ['Առկա հզորություն', withUnit(item.available_capacity_mw, 'ՄՎտ')]
  ];

  const projected = item.status === 'construction' || item.status === 'planned';
  const annualGeneration = item.annual_generation_gwh ??
    (projected ? source.projected_annual_generation_gwh : null);
  fields.push([
    projected ? 'Տարեկան նախագծային արտադրություն' : 'Միջին տարեկան արտադրություն',
    withUnit(annualGeneration, 'ԳՎտժ')
  ]);

  const group = item.delivery_group;
  const members = group
    ? allObjects.filter(object => object.type === 'hydropower' &&
        object.delivery_group === group).sort((a, b) => a.id - b.id)
    : [];
  const groupRecord = members.find(object => hasNumber(object.group_average_delivery_gwh));
  const groupAverage = groupRecord?.group_average_delivery_gwh ??
    item.group_average_delivery_gwh ?? source.group_average_delivery_gwh;
  const average = group ? groupAverage : item.average_delivery_gwh;
  const start = item.average_delivery_period_start ??
    groupRecord?.average_delivery_period_start;
  const end = item.average_delivery_period_end ??
    groupRecord?.average_delivery_period_end;

  if (hasNumber(average)) {
    fields.push([
      group ? 'Խմբի բազմամյա միջին օգտակար առաքում' : 'Բազմամյա միջին օգտակար առաքում',
      withUnit(average, 'ԳՎտժ')
    ]);
    if (hasNumber(start) && hasNumber(end)) {
      fields.push(['Առաքման ժամանակահատված', `${start}–${end} թթ.`]);
    }
    if (group) {
      const names = members.map(object => object.name_hy).filter(Boolean);
      fields.push([
        'Խմբային ցուցանիշի պարզաբանում',
        names.length
          ? `Ընդհանուր ցուցանիշ՝ ${names.join(', ')} ՀԷԿ-երի համար։ Անհատական առաքումը չի առանձնացվել։`
          : 'Խմբի ընդհանուր ցուցանիշ։ Անհատական առաքումը չի առանձնացվել։'
      ]);
    }
  }

  fields.push(
    ['2025 թ. փաստացի օգտակար առաքում', withUnit(item.actual_delivery_gwh_2025, 'ԳՎտժ')],
    ['ՀԷԿ-ի տեսակ', item.hydropower_kind],
    ['Աշխատանքի ռեժիմ', item.operation_regime],
    ['Օպերատոր', item.operator]
  );
  return fields.filter(([, value]) => value !== null && value !== undefined && value !== '');
}

function escapeHydropowerHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}


function buildHoverInfo(item) {

  let html =
    `<div class="popup-title">` +
    `${item.name_hy || 'Անանուն օբյեկտ'}` +
    `</div>`;


  html +=
    `<div class="popup-row">` +
    `<strong>Տեսակ՝</strong> ` +
    `${objectTypeLabel(item)}` +
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


  if (item.type === 'hydropower') {
    const hoverLabels = new Set([
      'Տեղադրված հզորություն', 'Ջրաղբյուր',
      'Բազմամյա միջին օգտակար առաքում',
      'Խմբի բազմամյա միջին օգտակար առաքում',
      'Առաքման ժամանակահատված'
    ]);
    hydropowerDisplayFields(item).forEach(([label, value]) => {
      if (hoverLabels.has(label)) {
        html += `<div class="popup-row"><strong>${escapeHydropowerHtml(label)}՝</strong> ` +
          `${escapeHydropowerHtml(value)}</div>`;
      }
    });
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
          <!-- Waterfall: a ledge, three falling streams and a lower wave. -->
          <g
            fill="none"
            stroke="#1976d2"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M2.1 2.8 H10.2 C11.7 2.8 12.2 3.8 12.2 5.2 V10"/>
            <path d="M4.4 2.8 C5.2 3.4 5.5 4.3 5.5 5.3 V10"/>
            <path d="M7.7 2.8 C8.5 3.4 8.8 4.3 8.8 5.3 V10"/>
            <path d="M2.2 12.2 C3.1 13.1 4 13.1 4.9 12.2 S6.7 11.3 7.6 12.2
                     S9.4 13.1 10.3 12.2 S12.1 11.3 13 12.2"/>
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


function createCanalIcon() {

  return L.divIcon({
    className: 'canal-symbol-wrapper',
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
          width="18"
          height="18"
          viewBox="0 0 18 18"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- Canal: pipe outlet with water flowing from it. -->
          <g stroke-linecap="round" stroke-linejoin="round">
            <rect x="2.0" y="3.1" width="7.2" height="6.0" rx="1.6" fill="#7a8491" stroke="#5d6672" stroke-width="1"/>
            <ellipse cx="9.2" cy="6.1" rx="2.1" ry="3.0" fill="#ffffff" stroke="#5d6672" stroke-width="1.15"/>
            <path d="M9.8 8.0 C11.2 8.6 11.8 9.4 11.9 11.1 C12.0 12.0 12.6 12.5 13.7 12.8" fill="none" stroke="#2496ff" stroke-width="1.65"/>
            <path d="M11.4 8.1 C12.9 8.8 13.5 9.8 13.6 11.2 C13.7 12.0 14.3 12.5 15.4 12.7" fill="none" stroke="#2496ff" stroke-width="1.65"/>
            <path d="M8.7 13.9 C9.7 13.3 10.7 13.3 11.7 13.9 S13.7 14.5 14.7 13.9 S16.1 13.4 16.6 13.7" fill="none" stroke="#1976d2" stroke-width="1.2"/>
            <path d="M9.2 15.6 C10.2 15.0 11.2 15.0 12.2 15.6 S14.2 16.2 15.2 15.6" fill="none" stroke="#1976d2" stroke-width="1.2"/>
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


// Load every lake's available shoreline and keep its conventional symbol.
function isOutlinedLake(item) {
  return item.type === 'lake';
}

// Industrial ponds retain their distinct polygon style.
function isTailingsPond(item) {
  return item.type === 'reservoir' && item.status === 'industrial' &&
    item.name_hy === 'Թեղուտի պոչամբար';
}

function objectTypeLabel(item) {
  return isTailingsPond(item) ? 'Պոչամբար' : typeLabel(item.type);
}

function isOutlinedReservoir(item) {
  return item.type === 'reservoir';
}

function getWaterfallPoints(item) {
  if (item.type !== 'waterfall' || !item.geometry ||
      item.geometry.type !== 'MultiPoint' ||
      !Array.isArray(item.geometry.coordinates)) {
    return [];
  }

  const seen = new Set();
  return item.geometry.coordinates.filter(point => {
    if (!Array.isArray(point) || point.length < 2 ||
        !Number.isFinite(point[0]) || !Number.isFinite(point[1]) ||
        Math.abs(point[0]) > 180 || Math.abs(point[1]) > 90) {
      return false;
    }
    const key = `${point[0]},${point[1]}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map(point => L.latLng(point[1], point[0]));
}

// Load geometry only for visible objects, using batched requests.
const geometryReadyIds = new Set();
const geometryPendingIds = new Set();

function needsAtlasGeometry(item) {
  return ['river', 'canal', 'waterfall', 'reservoir'].includes(item.type) ||
    (item.type === 'lake' && (item.name_hy === 'Սևանա լիճ' || isOutlinedLake(item)));
}

function queueAtlasGeometry(items) {
  const pending = items.filter(item => needsAtlasGeometry(item) &&
    !geometryReadyIds.has(item.id) && !geometryPendingIds.has(item.id));
  pending.forEach(item => geometryPendingIds.add(item.id));
  for (let offset = 0; offset < pending.length; offset += 150) {
    const batch = pending.slice(offset, offset + 150);
    loadAtlasGeometryBatch(batch);
  }
}

async function loadAtlasGeometryBatch(batch) {
  try {
    const ids = batch.map(item => Number(item.id)).join(',');
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/water_objects?select=id,geometry&id=in.(${ids})`,
      { headers: { apikey: SUPABASE_KEY } }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const records = await response.json();
    const byId = new Map(records.map(item => [Number(item.id), item.geometry]));
    batch.forEach(item => {
      if (!byId.has(Number(item.id))) throw new Error(`Missing geometry record ${item.id}`);
    });
    batch.forEach(item => {
      item.geometry = byId.get(Number(item.id)) || null;
      geometryLoadFailures.delete(item.id);
    });
  } catch (error) {
    batch.forEach(item => geometryLoadFailures.add(item.id));
    console.error('Map geometry load error:', error);
  } finally {
    batch.forEach(item => {
      geometryPendingIds.delete(item.id);
      geometryReadyIds.add(item.id);
    });
    updateRiverOverviewStats();
    updateWaterfallOverviewStats();
    updateLakeOverviewStats();
    updateReservoirOverviewStats();
    // Re-read the current controls: a user may have changed them while loading.
    applyFilters();
  }
}


function renderMarkers(data) {

  clearMarkers();

  const mapped =
    data.filter(item => {
      // Never render temporary point fallbacks while a map line is loading.
      if (needsAtlasGeometry(item) &&
          (!geometryReadyIds.has(item.id) || geometryLoadFailures.has(item.id))) {
        return false;
      }

      // Keep all canal records in the database and list, but show only
      // mapped canal lines. Point-only records never create map symbols.
      if (item.type === 'canal') {
        return Boolean(
          item.geometry &&
          ['LineString', 'MultiLineString'].includes(item.geometry.type) &&
          Array.isArray(item.geometry.coordinates) &&
          item.geometry.coordinates.length > 0
        );
      }

      return (
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
    });

  mapped.forEach(item => {

    let layer = null;

    const isLake =
      item.type === 'lake';

    const isSevan =
      isLake &&
      item.name_hy === 'Սևանա լիճ';

    const isOutlinedWaterPolygon =
      (isOutlinedLake(item) || isOutlinedReservoir(item)) &&
      item.geometry &&
      ['Polygon', 'MultiPolygon'].includes(item.geometry.type);

    const isSmallLake =
      isLake &&
      !isSevan &&
      !isOutlinedWaterPolygon;

    const isWaterfall =
      item.type === 'waterfall';

    const isHydropower =
      item.type === 'hydropower';

    const isReservoir =
      item.type === 'reservoir';

    const isCanal =
      item.type === 'canal';

    // Hide any legacy point-marker record for the Arzni–Shamiram canal,
    // even if an older duplicate row has no geometry.
    const isArzniShamiramCanal =
      isCanal &&
      typeof item.name_hy === 'string' &&
      item.name_hy.includes('Արզնի') &&
      item.name_hy.includes('Շամիրամ');

    const isWetland =
      item.type === 'wetland';

    const isSpring =
      item.type === 'spring';

    const hasCoordinates =
      item.latitude !== null &&
      item.longitude !== null;

    const waterfallPoints = getWaterfallPoints(item);

    if (waterfallPoints.length) {
      // One database object, with one custom symbol at each cascade location.
      layer = L.featureGroup().addTo(map);
      layer.waterObjectId = item.id;
      layer.waterfallBounds = L.latLngBounds(waterfallPoints);

      waterfallPoints.forEach(point => {
        const marker = L.marker(point, {
          icon: createWaterfallIcon(),
          zIndexOffset: 500
        }).addTo(layer);

        marker.waterObjectId = item.id;
        marker.trueLatLng = point;
        marker.bindTooltip(buildHoverInfo(item), {
          direction: 'auto',
          offset: [0, 0],
          opacity: 1,
          sticky: false,
          interactive: false,
          className: 'object-hover-tooltip'
        });
        smallLakeCollisionMarkers.push({ marker, trueLatLng: point });
        marker.on('click', () => {
          marker.closeTooltip();
          openObjectDetails(item, true);
          focusObjectOnMap(item, 13);
        });
      });

    } else if (
      (isSmallLake || isWaterfall || isHydropower || isReservoir || isCanal || isWetland || isSpring) &&
      hasCoordinates &&
      !isArzniShamiramCanal &&
      !(isCanal && item.geometry) &&
      !isOutlinedWaterPolygon
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
                    : isCanal
                      ? createCanalIcon()
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
                  : isCanal
                    ? 590
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

      // Rivers and canals remain visually distinct.
      // Canals: continuous darker-green line. Rivers: established solid blue.
      const geometryStyle =
        isOutlinedWaterPolygon
          ? {
              color: isTailingsPond(item) ? '#8d6e63' : '#1976d2',
              weight: 3,
              opacity: 0.95,
              fillColor: isTailingsPond(item) ? '#bcaaa4' : '#64b5f6',
              fillOpacity: 0.18
            }
          : isCanal
          ? {
              color: '#388e3c',
              weight: 3,
              opacity: 0.95,
              lineCap: 'round',
              lineJoin: 'round'
            }
          : {
              color: '#1976d2',
              weight: 4,
              opacity: 0.9
            };

      const geometryLayer =
        L.geoJSON(
          item.geometry,
          {
            style: geometryStyle
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
                ...geometryStyle,
                weight: geometryStyle.weight + 2
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
              part.setStyle(
                geometryStyle
              );
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

      // Every lake and reservoir keeps its outline and its conventional symbol.
      if (
        (isLake || isReservoir) &&
        hasCoordinates
      ) {

        const waterMarker =
          L.marker(
            [
              item.latitude,
              item.longitude
            ],
            {
              icon: isReservoir ? createReservoirIcon(item.status) : createLakeIcon(),
              zIndexOffset: 700
            }
          ).addTo(map);

        waterMarker.bindTooltip(
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

        waterMarker.waterObjectId =
          item.id;

        waterMarker.on(
          'click',
          () => {

            waterMarker.closeTooltip();

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
          waterMarker
        );
      }

      // Geometry-bearing canals are represented by their real polyline only.
      // Their representative latitude/longitude marker is intentionally omitted.

    } else {

      // Do not let a legacy Arzni–Shamiram point-only duplicate fall through
      // to Leaflet's standard blue marker. The canal is represented only by
      // its reviewed polyline geometry.
      if (isArzniShamiramCanal) {
        return;
      }

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
  highlightSelectedRiver();

  document
    .getElementById(
      'map-count'
    )
    .textContent =
      `Քարտեզագրված՝ ${mapped.length}`;

  // Redrawing layers must preserve the user's current center and zoom.
  // Only explicit navigation actions may change the viewport.
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

function normalizeAtlasSearch(value) {
  return String(value || '').normalize('NFKC').toLowerCase()
    .replace(/և/g, 'եվ').replace(/եւ/g, 'եվ')
    .replace(/[«»"'(),՝։:;–—-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function matchesAtlasSearch(item, query) {
  const words = normalizeAtlasSearch(query).split(' ').filter(Boolean);
  if (!words.length) return true;
  const text = normalizeAtlasSearch([
    item.name_hy, item.name_en, item.name_ru, objectTypeLabel(item)
  ].filter(Boolean).join(' '));
  return words.every(word => text.includes(word));
}

function hasAtlasMapLocation(item) {
  return Boolean(item.geometry) || (
    Number.isFinite(item.latitude) && Number.isFinite(item.longitude) &&
    Math.abs(item.latitude) <= 90 && Math.abs(item.longitude) <= 180
  );
}


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
        ${objectTypeLabel(item)}${needsAtlasGeometry(item) && !geometryReadyIds.has(item.id) ? ' · Քարտեզը բեռնվում է' : hasAtlasMapLocation(item) ? '' : ' · Քարտեզային նշում չկա'}
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

  selectedObjectId = Number(item.id);
  highlightSelectedRiver();

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
      objectTypeLabel(item);


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
    hydropowerDisplayFields(item).forEach(([label, value]) => {
      addDetailField(dataContainer, label, value);
    });
  }


  if (!hasAtlasMapLocation(item) &&
      (!needsAtlasGeometry(item) || geometryReadyIds.has(item.id))) {
    addDetailField(dataContainer, 'Քարտեզային նշում',
      'Կոորդինատները դեռ ճշտված չեն։ Օբյեկտը հասանելի է ցանկում և որոնմամբ։');
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

  selectedObjectId = null;
  clearSelectedRiver();

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


  // Closing details keeps the current map view.
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

function getRiverMinimumLength() {
  const value = Number(document.getElementById('river-min-length')?.value || 0);
  return [0, 10, 25, 50, 100].includes(value) ? value : 0;
}
function matchesRiverLength(item, minimum, includeUnknown) {
  if (item.type !== 'river' || minimum === 0) return true;
  const length = item.length_km;
  if (length === null || length === undefined || length === '' || !Number.isFinite(Number(length)) || Number(length) <= 0) return includeUnknown;
  return Number(length) >= minimum;
}
function syncRiverFilterVisibility() {
  document.getElementById('river-length-controls').hidden = !getSelectedTypes().includes('river');
}

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


function getSelectedRegion() {

  const regionFilter =
    document.getElementById(
      'region-filter'
    );


  return regionFilter
    ? regionFilter.value
    : 'Հայաստան';
}


function matchesSelectedRegion(
  item,
  selectedRegion = getSelectedRegion()
) {

  if (
    !selectedRegion ||
    selectedRegion === 'Հայաստան'
  ) {
    return true;
  }


  const provinceText =
    String(
      item.province || ''
    )
      .replace(/\s+/g, ' ')
      .trim();


  if (!provinceText) {
    return false;
  }


  // The province field may contain more than one territory, for example
  // "Երևան, Արարատ". Substring matching also covers forms such as
  // "Արարատի մարզ" and "Վայոց ձորի մարզ".
  return provinceText.includes(
    selectedRegion
  );
}


function getRegionScopedObjects(
  selectedRegion = getSelectedRegion()
) {

  return allObjects.filter(
    item =>
      matchesSelectedRegion(
        item,
        selectedRegion
      )
  );
}


function trimPinnedObjectsToRegion(
  selectedRegion = getSelectedRegion()
) {

  Array.from(
    pinnedObjectIds
  ).forEach(objectId => {

    const item =
      findObjectById(
        objectId
      );


    if (
      !item ||
      !matchesSelectedRegion(
        item,
        selectedRegion
      )
    ) {
      pinnedObjectIds.delete(
        Number(objectId)
      );
    }
  });
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


function showSearchEmptyMessage() {

  const mapContainer = document.getElementById('map');
  if (!mapContainer) return;

  let message = document.getElementById('map-search-empty-message');

  if (!message) {
    message = document.createElement('div');
    message.id = 'map-search-empty-message';
    message.textContent = 'Որոնման արդյունքում ոչինչ չգտնվեց։';

    Object.assign(message.style, {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: '1000',
      background: 'rgba(255, 255, 255, 0.94)',
      border: '1px solid rgba(0, 0, 0, 0.18)',
      borderRadius: '10px',
      padding: '12px 18px',
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.16)',
      fontSize: '16px',
      fontWeight: '600',
      lineHeight: '1.4',
      textAlign: 'center',
      pointerEvents: 'none',
      maxWidth: '80%'
    });

    mapContainer.appendChild(message);
  }

  message.hidden = false;
}


function hideSearchEmptyMessage() {
  const message = document.getElementById('map-search-empty-message');
  if (message) message.hidden = true;
}


function applyFilters() {
  syncRiverFilterVisibility();

  // Preserve controls during loading, but do not render incomplete geometries.
  if (objectsLoading) {
    document.getElementById('status').textContent =
      'Տվյալները բեռնվում են… Ձեր ընտրությունը կկիրառվի բեռնման ավարտին։';
    return;
  }


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


  const selectedRegion =
    getSelectedRegion();


  const regionObjects =
    getRegionScopedObjects(
      selectedRegion
    );


  // Keep search results visible while independently adding enabled layers.
  // A river search must not restrict the added hydropower layer to its name.
  const searchObjects = search
    ? regionObjects.filter(item => matchesAtlasSearch(item, search))
    : [];
  const minimumRiverLength = getRiverMinimumLength();
  const includeUnknownRivers = document.getElementById('river-include-unknown').checked;
  const enabledLayerObjects = regionObjects.filter(item => selectedTypes.includes(item.type) && matchesRiverLength(item, minimumRiverLength, includeUnknownRivers));
  const layerObjects = mergeObjectsById(searchObjects, enabledLayerObjects);


  // Explicitly opened objects remain pinned only while they belong to the
  // currently selected territory. Changing from Armenia to a marz must not
  // leave unrelated objects from another marz on the map.
  const pinnedObjects =
    getPinnedObjects().filter(
      item =>
        matchesSelectedRegion(
          item,
          selectedRegion
        )
    );


  const mapObjects =
    mergeObjectsById(
      layerObjects,
      pinnedObjects
    );


  // The side list includes search results and every enabled map layer.
  const listObjects = mapObjects.filter(item => matchesSelectedRegion(item, selectedRegion));


  renderList(
    listObjects
  );


  renderMarkers(
    mapObjects
  );

  queueAtlasGeometry(mapObjects);


  if (
    search &&
    searchObjects.length === 0
  ) {
    showSearchEmptyMessage();
  } else {
    hideSearchEmptyMessage();
  }


  const status =
    document.getElementById(
      'status'
    );


  const regionLabel =
    selectedRegion ||
    'Հայաստան';


  if (
    selectedTypes.length === 0 &&
    pinnedObjects.length === 0 &&
    !search
  ) {

    status.textContent =
      `${regionLabel} · Ընտրեք մեկ կամ մի քանի շերտ, բացեք որևէ օբյեկտ կամ սկսեք որոնել։`;

  } else if (search) {

    status.textContent =
      `${regionLabel} · Որոնմամբ գտնվել է՝ ${searchObjects.length}։ Միացված է ${selectedTypes.length} շերտ։ Ընդամենը՝ ${mapObjects.length} օբյեկտ։`;

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
      `${regionLabel} · ${layerLabel}${pinnedLabel}։ Շտեմարանում՝ ${mapObjects.length} օբյեկտ։`;
  }
  const pendingMapCount = mapObjects.filter(item =>
    needsAtlasGeometry(item) && !geometryReadyIds.has(item.id)).length;
  if (pendingMapCount) {
    status.textContent += ` Քարտեզային տվյալները բեռնվում են՝ ${pendingMapCount} օբյեկտ։`;
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


    const geometry = await response.json();
    geometryLoadFailures.delete(objectId);
    return geometry;


  } catch (error) {

    console.error(
      `Geometry load error for object ${objectId}:`,
      error
    );

    geometryLoadFailures.add(objectId);
    return null;
  }
}


/* =========================================
   LOAD OBJECTS
   ========================================= */

function hasRiverOutline(geometry) {
  if (!geometry) return false;
  if (geometry.type === 'Feature') return hasRiverOutline(geometry.geometry);
  if (geometry.type === 'GeometryCollection') {
    return Array.isArray(geometry.geometries) && geometry.geometries.some(hasRiverOutline);
  }
  const validLine = line => Array.isArray(line) && line.length >= 2 &&
    line.every(point => Array.isArray(point) && Number.isFinite(point[0]) &&
      Number.isFinite(point[1]) && Math.abs(point[0]) <= 180 && Math.abs(point[1]) <= 90);
  if (geometry.type === 'LineString') return validLine(geometry.coordinates);
  return geometry.type === 'MultiLineString' && Array.isArray(geometry.coordinates) &&
    geometry.coordinates.some(validLine);
}

function updateRiverOverviewStats() {
  const element = document.getElementById('river-overview-count');
  if (!element) return;
  const rivers = allObjects.filter(item => item.type === 'river');
  if (rivers.some(item => needsAtlasGeometry(item) && !geometryReadyIds.has(item.id))) return;
  // Keep the dated, verified snapshot if any river geometry could not be read.
  if (rivers.some(item => geometryLoadFailures.has(item.id))) return;
  const outlined = rivers.filter(item => hasRiverOutline(item.geometry)).length;
  element.textContent = `Ատլասի շտեմարանում կա ${rivers.length} գետի գրառում, որոնցից ${outlined}-ն ունեն քարտեզային ուրվագիծ։`;
}

function updateWaterfallOverviewStats() {
  const element = document.getElementById('waterfall-overview-count');
  if (!element) return;
  const waterfalls = allObjects.filter(item => item.type === 'waterfall');
  if (waterfalls.some(item => needsAtlasGeometry(item) && !geometryReadyIds.has(item.id))) return;
  const hasPoint = item => Number.isFinite(item.latitude) &&
    Number.isFinite(item.longitude) && Math.abs(item.latitude) <= 90 &&
    Math.abs(item.longitude) <= 180;
  // Retain the verified snapshot when an unmapped object's geometry could not be read.
  if (waterfalls.some(item => !hasPoint(item) && geometryLoadFailures.has(item.id))) return;
  const mapped = waterfalls.filter(item =>
    hasPoint(item) || getWaterfallPoints(item).length > 0
  ).length;
  element.textContent = `Ատլասի շտեմարանում կա ${waterfalls.length} ջրվեժի գրառում, որոնցից ${mapped}-ը ունեն քարտեզային նշում։`;
}

function updateLakeOverviewStats() {
  const element = document.getElementById('lake-overview-count');
  if (!element) return;
  const lakes = allObjects.filter(item => item.type === 'lake');
  if (lakes.some(item => needsAtlasGeometry(item) && !geometryReadyIds.has(item.id))) return;
  const hasPoint = item => Number.isFinite(item.latitude) &&
    Number.isFinite(item.longitude) && Math.abs(item.latitude) <= 90 &&
    Math.abs(item.longitude) <= 180;
  const hasGeometry = geometry => {
    if (!geometry) return false;
    if (geometry.type === 'Feature') return hasGeometry(geometry.geometry);
    if (geometry.type === 'GeometryCollection') {
      return Array.isArray(geometry.geometries) && geometry.geometries.some(hasGeometry);
    }
    return ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon']
      .includes(geometry.type) && Array.isArray(geometry.coordinates) &&
      geometry.coordinates.length > 0;
  };
  if (lakes.some(item => !hasPoint(item) && geometryLoadFailures.has(item.id))) return;
  const mapped = lakes.filter(item => hasPoint(item) || hasGeometry(item.geometry)).length;
  const suffix = mapped % 10 === 8 ? '-ն' : '-ը';
  element.textContent = `Ատլասի շտեմարանում կա ${lakes.length} լճի գրառում, որոնցից ${mapped}${suffix} ունեն քարտեզային նշում։`;
}

function updateReservoirOverviewStats() {
  const element = document.getElementById('reservoir-overview-count');
  if (!element) return;
  const reservoirs = allObjects.filter(item => item.type === 'reservoir' && !isTailingsPond(item));
  if (reservoirs.some(item => needsAtlasGeometry(item) && !geometryReadyIds.has(item.id))) return;
  const hasPoint = item => Number.isFinite(item.latitude) &&
    Number.isFinite(item.longitude) && Math.abs(item.latitude) <= 90 &&
    Math.abs(item.longitude) <= 180;
  const hasGeometry = geometry => {
    if (!geometry) return false;
    if (geometry.type === 'Feature') return hasGeometry(geometry.geometry);
    if (geometry.type === 'GeometryCollection') {
      return Array.isArray(geometry.geometries) && geometry.geometries.some(hasGeometry);
    }
    return ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon']
      .includes(geometry.type) && Array.isArray(geometry.coordinates) &&
      geometry.coordinates.length > 0;
  };
  if (reservoirs.some(item => !hasPoint(item) && geometryLoadFailures.has(item.id))) return;
  const mapped = reservoirs.filter(item => hasPoint(item) || hasGeometry(item.geometry)).length;
  const suffix = mapped % 10 === 6 || mapped % 10 === 8 ? '-ն' : '-ը';
  element.textContent = `Ատլասի շտեմարանում կա ${reservoirs.length} ջրամբարի գրառում, որոնցից ${mapped}${suffix} ունեն քարտեզային նշում։`;
}

function updateSpringOverviewStats() {
  const element = document.getElementById('spring-overview-count');
  if (!element) return;
  const springs = allObjects.filter(item => item.type === 'spring');
  const mapped = springs.filter(item => Number.isFinite(item.latitude) &&
    Number.isFinite(item.longitude) && Math.abs(item.latitude) <= 90 &&
    Math.abs(item.longitude) <= 180).length;
  const suffix = [6, 7, 8].includes(mapped % 10) ? '-ն' : '-ը';
  element.textContent = `Ատլասի շտեմարանում կա ${springs.length} աղբյուրի գրառում, որոնցից ${mapped}${suffix} ունեն քարտեզային նշում։`;
}

function updateWetlandOverviewStats() {
  const element = document.getElementById('wetland-overview-count');
  if (!element) return;
  const wetlands = allObjects.filter(item => item.type === 'wetland');
  const mapped = wetlands.filter(item => Number.isFinite(item.latitude) &&
    Number.isFinite(item.longitude) && Math.abs(item.latitude) <= 90 &&
    Math.abs(item.longitude) <= 180).length;
  const suffix = [4, 5, 6, 7, 8].includes(mapped % 10) ? '-ն' : '-ը';
  element.textContent = `Ատլասի շտեմարանում կա խոնավ տարածքի ${wetlands.length} գրառում, որոնցից ${mapped}${suffix} ունեն քարտեզային նշում։`;
}

async function loadObjects() {

  const url =
    `${SUPABASE_URL}/rest/v1/water_objects` +
    `?select=id,type,name_hy,name_en,name_ru,province,basin,description_hy,status,latitude,longitude,elevation_m,length_km,area_km2,max_depth_m,volume_m3,discharge_m3s,year,height_m,height_min_m,height_max_m,river_name,cascade_name,installed_capacity_mw,available_capacity_mw,annual_generation_gwh,hydropower_kind,operation_regime,operator,water_source,average_delivery_gwh,average_delivery_period_start,average_delivery_period_end,delivery_group,group_average_delivery_gwh,actual_delivery_gwh_2025,hydropower_source_data` +
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


    const loadedObjects = await response.json();


    // Metadata and point symbols are immediately usable; selected map
    // geometries are fetched separately in batches.
    allObjects = loadedObjects;
    objectsLoading = false;

    updateRiverOverviewStats();
    updateWaterfallOverviewStats();
    updateLakeOverviewStats();
    updateReservoirOverviewStats();
    updateSpringOverviewStats();
    updateWetlandOverviewStats();

    // Apply the latest controls without clearing choices made during loading.
    applyFilters();

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


        if (!sharedAtlasView) focusObjectOnMap(item, 13);


        await openObjectDetails(
          item,
          false
        );
      }
    }


  } catch (error) {

    objectsLoading = false;

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


      document.getElementById('river-min-length').value = '0';
      document.getElementById('river-include-unknown').checked = true;
      document.getElementById('river-basin-select').value = '';
      syncRiverBasin();
      pinnedObjectIds.clear();


      const searchInput =
        document.getElementById(
          'search'
        );


      if (searchInput) {
        searchInput.value = '';
      }


      applyFilters();


      showArmeniaOverview();


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


const regionFilter =
  document.getElementById(
    'region-filter'
  );


if (regionFilter) {

  regionFilter.addEventListener(
    'change',
    () => {

      const selectedRegion =
        getSelectedRegion();


      trimPinnedObjectsToRegion(
        selectedRegion
      );


      const currentId =
        getObjectIdFromUrl();


      const currentItem =
        currentId
          ? findObjectById(
              currentId
            )
          : null;


      if (
        currentItem &&
        !matchesSelectedRegion(
          currentItem,
          selectedRegion
        )
      ) {
        closeObjectDetails(
          true
        );
      }


      applyFilters();
    }
  );
}


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

// Initialize the clean default state synchronously, before the first fetch.
// Resetting controls after an await would erase the user's first selection.
document.querySelectorAll('.type-filter').forEach(input => {
  input.checked = !!sharedAtlasView && sharedAtlasView.types.includes(input.value);
});
if (sharedAtlasView) {
  const region = document.getElementById('region-filter');
  if (region && Array.from(region.options).some(option => option.value === sharedAtlasView.region)) region.value = sharedAtlasView.region;
  document.getElementById('search').value = sharedAtlasView.query;
  document.getElementById('river-min-length').value = String(sharedAtlasView.riverMin);
  document.getElementById('river-include-unknown').checked = sharedAtlasView.riverUnknown;
}
for (const id of ['river-min-length', 'river-include-unknown']) document.getElementById(id).addEventListener('change', applyFilters);
document.getElementById('river-basin-select').value = sharedAtlasView ? sharedAtlasView.riverBasin : '';
document.getElementById('river-basin-select').addEventListener('change', () => syncRiverBasin(true));
syncRiverBasin();
syncRiverFilterVisibility();
document.getElementById('share-map').addEventListener('click', copyAtlasView);
map.on('movestart', clearShareMapNotice);
for (const eventName of ['click', 'input', 'change']) {
  document.addEventListener(eventName, clearShareNoticeOnAction, true);
}
renderList([]);
renderMarkers([]);
document.getElementById('status').textContent = 'Տվյալները բեռնվում են…';
loadObjects();
