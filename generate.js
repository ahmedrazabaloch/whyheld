const fs = require('fs');
const path = require('path');

const destinations = [
  { id: "mock_kyoto_jp", city: "Kyoto", state: "Kyoto", country: "Japan", countryCode: "JP", lat: 35.0116, lng: 135.7681 },
  { id: "mock_shirakawa_jp", city: "Shirakawa-go", state: "Gifu", country: "Japan", countryCode: "JP", lat: 36.2591, lng: 136.9064 },
  { id: "mock_kanazawa_jp", city: "Kanazawa", state: "Ishikawa", country: "Japan", countryCode: "JP", lat: 36.5613, lng: 136.6562 },
  { id: "mock_nara_jp", city: "Nara", state: "Nara", country: "Japan", countryCode: "JP", lat: 34.6851, lng: 135.8048 },
  { id: "mock_florence_it", city: "Florence", state: "Tuscany", country: "Italy", countryCode: "IT", lat: 43.7696, lng: 11.2558 },
  { id: "mock_siena_it", city: "Siena", state: "Tuscany", country: "Italy", countryCode: "IT", lat: 43.3188, lng: 11.3308 },
  { id: "mock_positano_it", city: "Positano", state: "Campania", country: "Italy", countryCode: "IT", lat: 40.6281, lng: 14.4850 },
  { id: "mock_riomaggiore_it", city: "Riomaggiore", state: "Liguria", country: "Italy", countryCode: "IT", lat: 44.0997, lng: 9.7380 },
  { id: "mock_matera_it", city: "Matera", state: "Basilicata", country: "Italy", countryCode: "IT", lat: 40.6664, lng: 16.6043 },
  { id: "mock_colmar_fr", city: "Colmar", state: "Grand Est", country: "France", countryCode: "FR", lat: 48.0794, lng: 7.3585 },
  { id: "mock_annecy_fr", city: "Annecy", state: "Auvergne-Rhône-Alpes", country: "France", countryCode: "FR", lat: 45.8992, lng: 6.1294 },
  { id: "mock_avignon_fr", city: "Avignon", state: "Provence-Alpes-Côte d'Azur", country: "France", countryCode: "FR", lat: 43.9493, lng: 4.8055 },
  { id: "mock_ronda_es", city: "Ronda", state: "Andalusia", country: "Spain", countryCode: "ES", lat: 36.7413, lng: -5.1668 },
  { id: "mock_granada_es", city: "Granada", state: "Andalusia", country: "Spain", countryCode: "ES", lat: 37.1773, lng: -3.5986 },
  { id: "mock_san_sebastian_es", city: "San Sebastian", state: "Basque Country", country: "Spain", countryCode: "ES", lat: 43.3183, lng: -1.9812 },
  { id: "mock_sintra_pt", city: "Sintra", state: "Lisbon", country: "Portugal", countryCode: "PT", lat: 38.8029, lng: -9.3817 },
  { id: "mock_porto_pt", city: "Porto", state: "Porto", country: "Portugal", countryCode: "PT", lat: 41.1579, lng: -8.6291 },
  { id: "mock_evora_pt", city: "Évora", state: "Évora", country: "Portugal", countryCode: "PT", lat: 38.5667, lng: -7.9000 },
  { id: "mock_edinburgh_gb", city: "Edinburgh", state: "Scotland", country: "United Kingdom", countryCode: "GB", lat: 55.9533, lng: -3.1883 },
  { id: "mock_bath_gb", city: "Bath", state: "England", country: "United Kingdom", countryCode: "GB", lat: 51.3758, lng: -2.3599 },
  { id: "mock_galway_ie", city: "Galway", state: "County Galway", country: "Ireland", countryCode: "IE", lat: 53.2707, lng: -9.0568 },
  { id: "mock_hallstatt_at", city: "Hallstatt", state: "Upper Austria", country: "Austria", countryCode: "AT", lat: 47.5622, lng: 13.6493 },
  { id: "mock_salzburg_at", city: "Salzburg", state: "Salzburg", country: "Austria", countryCode: "AT", lat: 47.8095, lng: 13.0550 },
  { id: "mock_bled_si", city: "Bled", state: "Upper Carniola", country: "Slovenia", countryCode: "SI", lat: 46.3683, lng: 14.1146 },
  { id: "mock_giethoorn_nl", city: "Giethoorn", state: "Overijssel", country: "Netherlands", countryCode: "NL", lat: 52.7396, lng: 6.0796 },
  { id: "mock_reykjavik_is", city: "Reykjavik", state: "Capital Region", country: "Iceland", countryCode: "IS", lat: 64.1466, lng: -21.9426 },
  { id: "mock_bergen_no", city: "Bergen", state: "Vestland", country: "Norway", countryCode: "NO", lat: 60.3913, lng: 5.3221 },
  { id: "mock_luzern_ch", city: "Lucerne", state: "Lucerne", country: "Switzerland", countryCode: "CH", lat: 47.0502, lng: 8.3093 },
  { id: "mock_zermatt_ch", city: "Zermatt", state: "Valais", country: "Switzerland", countryCode: "CH", lat: 46.0207, lng: 7.7491 },
  { id: "mock_banff_ca", city: "Banff", state: "Alberta", country: "Canada", countryCode: "CA", lat: 51.1784, lng: -115.5708 },
  { id: "mock_victoria_ca", city: "Victoria", state: "British Columbia", country: "Canada", countryCode: "CA", lat: 48.4284, lng: -123.3656 },
  { id: "mock_sedona_us", city: "Sedona", state: "Arizona", country: "United States", countryCode: "US", lat: 34.8697, lng: -111.7610 },
  { id: "mock_taos_us", city: "Taos", state: "New Mexico", country: "United States", countryCode: "US", lat: 36.4072, lng: -105.5731 },
  { id: "mock_savannah_us", city: "Savannah", state: "Georgia", country: "United States", countryCode: "US", lat: 32.0809, lng: -81.0912 },
  { id: "mock_oaxaca_mx", city: "Oaxaca", state: "Oaxaca", country: "Mexico", countryCode: "MX", lat: 17.0732, lng: -96.7266 },
  { id: "mock_san_miguel_mx", city: "San Miguel de Allende", state: "Guanajuato", country: "Mexico", countryCode: "MX", lat: 20.9142, lng: -100.7436 },
  { id: "mock_cusco_pe", city: "Cusco", state: "Cusco", country: "Peru", countryCode: "PE", lat: -13.5226, lng: -71.9673 },
  { id: "mock_bariloche_ar", city: "Bariloche", state: "Río Negro", country: "Argentina", countryCode: "AR", lat: -41.1343, lng: -71.3085 },
  { id: "mock_chefchaouen_ma", city: "Chefchaouen", state: "Tanger-Tetouan-Al Hoceima", country: "Morocco", countryCode: "MA", lat: 35.1688, lng: -5.2684 },
  { id: "mock_marrakech_ma", city: "Marrakech", state: "Marrakech-Safi", country: "Morocco", countryCode: "MA", lat: 31.6295, lng: -7.9811 },
  { id: "mock_cape_town_za", city: "Cape Town", state: "Western Cape", country: "South Africa", countryCode: "ZA", lat: -33.9249, lng: 18.4241 },
  { id: "mock_franschhoek_za", city: "Franschhoek", state: "Western Cape", country: "South Africa", countryCode: "ZA", lat: -33.9135, lng: 19.1235 },
  { id: "mock_goreme_tr", city: "Göreme", state: "Nevşehir", country: "Turkey", countryCode: "TR", lat: 38.6431, lng: 34.8290 },
  { id: "mock_petra_jo", city: "Petra", state: "Ma'an", country: "Jordan", countryCode: "JO", lat: 30.3285, lng: 35.4444 },
  { id: "mock_siem_reap_kh", city: "Siem Reap", state: "Siem Reap", country: "Cambodia", countryCode: "KH", lat: 13.3611, lng: 103.8595 },
  { id: "mock_luang_prabang_la", city: "Luang Prabang", state: "Luang Prabang", country: "Laos", countryCode: "LA", lat: 19.8833, lng: 102.1333 },
  { id: "mock_ubud_id", city: "Ubud", state: "Bali", country: "Indonesia", countryCode: "ID", lat: -8.5069, lng: 115.2625 },
  { id: "mock_chiang_mai_th", city: "Chiang Mai", state: "Chiang Mai", country: "Thailand", countryCode: "TH", lat: 18.7953, lng: 98.9620 },
  { id: "mock_queenstown_nz", city: "Queenstown", state: "Otago", country: "New Zealand", countryCode: "NZ", lat: -45.0312, lng: 168.6626 },
  { id: "mock_hobart_au", city: "Hobart", state: "Tasmania", country: "Australia", countryCode: "AU", lat: -42.8821, lng: 147.3272 }
];

const results = destinations.map(d => ({
  id: d.id,
  formattedAddress: `${d.city}, ${d.country}`,
  location: {
    latitude: d.lat,
    longitude: d.lng
  },
  addressComponents: [
    {
      types: ["locality", "political"],
      longText: d.city,
      shortText: d.city
    },
    {
      types: ["administrative_area_level_1", "political"],
      longText: d.state,
      shortText: d.state
    },
    {
      types: ["country", "political"],
      longText: d.country,
      shortText: d.countryCode
    }
  ]
}));

const targetDir = path.join(__dirname, 'src', 'lib', 'location', 'data');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

fs.writeFileSync(
  path.join(targetDir, 'locations.json'),
  JSON.stringify(results, null, 2)
);
console.log('Done generating 50 locations!');
