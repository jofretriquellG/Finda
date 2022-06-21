//Mapbox init
// eslint-disable-next-line no-undef
mapboxgl.accessToken = 'pk.eyJ1Ijoiam9mcmV0cmlxdWVsbCIsImEiOiJjbDFraDIwY2UwMHI4M3BwNXltdmFxcmxoIn0.epHk7taelkdTQfBaKVbqyw';

const permission= await navigator.permissions.query({ name: 'geolocation' });

if (permission.state=="granted") {
    navigator.geolocation.getCurrentPosition(e => {
        initMap([e.coords.longitude, e.coords.latitude],10)
    })
} else {
    initMap([ 12.325704152948152,50.12479049284618 ],3);
}


function initMap(lngLat, zoomSize) {
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: lngLat,
        zoom: zoomSize
    });

//On load mapbox
    map.on('load', async function () {
        await fetch("http://localhost:8000/all")
            .then((response) => response.json())
            .then((data) => {
                createSource(geoJSON(data.features), map);
            })
        map.setLayoutProperty("poi-label", 'visibility', 'none');
        geolocate.trigger();
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
        // eslint-disable-next-line no-undef
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

    let box = document.getElementById("map");
    const mapbox = document.createElement('div');
    mapbox.setAttribute('class', 'ctrl-map');
    mapbox.setAttribute('id', 'personalized');
    //box.appendChild(mapbox);
    const controls = document.getElementsByClassName('mapboxgl-control-container');
    controls[0].appendChild(mapbox);

// eslint-disable-next-line no-undef
    map.addControl(new mapboxgl.FullscreenControl());
    map.addControl(mapboxglSearchControl);
// eslint-disable-next-line no-undef
    const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
    });
    map.addControl(geolocate);
    map.addControl(new mapboxgl.NavigationControl());

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
// eslint-disable-next-line no-undef
    const searchClient =
        // eslint-disable-next-line no-undef
        algoliasearch(apiId, apiKey);

//Autocomplete plugins
// eslint-disable-next-line no-undef
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
// eslint-disable-next-line no-undef
    autocomplete({
        container: '#autocomplete',
        placeholder: 'Search pharmacies',
        openOnFocus: true,
        plugins: [],
        highlightPreTag: '<em>',
        highlightPostTag: '</em>',
        debug: true,
        getSources() {
            return [{
                sourceId: 'querySuggestions',
                getItemInputValue: ({item}) => item.query,
                getItems({query}) {
                    // eslint-disable-next-line no-undef
                    return getAlgoliaResults({
                        searchClient,
                        queries: [{
                            indexName: 'pharmacies',
                            query,
                            params: {

                                hitsPerPage: 10,

                            },
                        },],
                    });
                },
                templates: {
                    item({item, components, html}) {
                        return html`
                            <div>
                                ${components.Highlight({
                                    hit: item,
                                    attribute: ['properties', 'address'],
                                })}
                            </div>`;

                    },
                },
                onSelect({item}) {
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
            },];
        }
    });
}

function schedule(){

}