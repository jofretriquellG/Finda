//import mapboxgl from '../mapbox-gl/dist/mapbox-gl-csp';
//import algoliasearch from './algoliasearch';
//import { autocomplete,getAlgoliaResults } from './@algolia/autocomplete-js';
//import { createQuerySuggestionsPlugin } from './@algolia/autocomplete-plugin-query-suggestions';

//Mapbox init
mapboxgl.accessToken = 'pk.eyJ1Ijoiam9mcmV0cmlxdWVsbCIsImEiOiJjbDFraDIwY2UwMHI4M3BwNXltdmFxcmxoIn0.epHk7taelkdTQfBaKVbqyw';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11'
});
//Print markers from GraphCMS query
window.onload = () => {
    const url = "http://localhost:8080/graphcms";
    fetch(url, {
            method: 'POST',
            body: { query: "" }
        }).then((response) => response.json())
        .then((data) => {
            createSource(geoJSON(data.pharmacies), map);
        })
}

//On load mapbox
map.on('load', function() {
    map.setLayoutProperty("poi-label", 'visibility', 'none');
});
//On click 
let popup;
map.on('click', 'pharmacies', (e) => {

    // Copy coordinates array.
    let coordinates = e.features[0].geometry.coordinates.slice();

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }
    popup = popupInit(coordinates, e.features[0]);

});

//Popup
function popupInit(coordinates, data) {
    return new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(popupInfo(data))
        .addTo(map);

}

function popupInfo(data) {

    const name = data.properties.name;
    const address = data.properties.address;
    const tel = data.properties.tel;
    const html = "<h2>" + name + "</h2>" + "<p>" + address + "</p><p>Tel:" + tel + "</p>";
    return html;
}

//Search container over mapbox
const mapboxglSearchControl = {
    onAdd: (map) => {
        const searchContainer = document.createElement('div');
        searchContainer.setAttribute('id', 'autocomplete');
        searchContainer.setAttribute("class", "mapboxgl-ctrl")
        return searchContainer;
    },
    getDefaultPosition: () => {
        return 'top-left'
    }
};
map.addControl(mapboxglSearchControl);

//Create mapbox source
function createSource(geojson, map) {
    map.addSource('pharmacies', {
        'type': 'geojson',
        'data': geojson
    });

    // Add a symbol layer
    map.addLayer({
        'id': 'pharmacies',
        'type': 'circle',
        'source': 'pharmacies',
        'paint': {
            'circle-radius': 5,
            'circle-color': '#fff',
            'circle-stroke-color': '#03c383',
            'circle-stroke-width': 5,
        }
    });
}
//JSON to GeoJSON
function geoJSON(data) {
    return {
        type: "FeatureCollection",
        features: data
    }
}

// Algolia
const apiKey = 'b388e0b552136717565c18ffd71199d5';
const apiId = 'CD279WEMBF';
const searchClient = algoliasearch(apiId, apiKey);


//Autocomplete plugins
const querySuggestionsPlugin = createQuerySuggestionsPlugin({
    searchClient,
    indexName: 'pharmacies',
    getSearchParams() {
        return {
            hitsPerPage: 10,
        };
    },
});

//Autocomplete 
autocomplete({
    container: '#autocomplete',
    placeholder: 'Search pharmacies',
    openOnFocus: true,
    plugins: [],
    getSources() {
        return [{
            sourceId: 'querySuggestions',
            getItemInputValue: ({ item }) => item.query,
            getItems({ query }) {
                return getAlgoliaResults({
                    searchClient,
                    queries: [{
                        indexName: 'pharmacies',
                        query,
                        params: {

                            hitsPerPage: 10,

                        },
                    }, ],
                });
            },
            templates: {
                item({ item, components, html }) {
                    return html `<div>     
                ${components.Highlight({
                  hit: item,
                  attribute: ['properties', 'address'],
                    color:'#03c383'
                })}
            </div>`;

                },
            },
            onSelect({ item }) {
                if (popup) {
                    popup.remove();
                }
                let coordinates = item.geometry.coordinates;
                map.flyTo({
                    center: item.geometry.coordinates,
                    essential: true,
                    zoom: 15
                });

                popup = popupInit(item.geometry.coordinates, item);
            },
        }, ];
    }
});