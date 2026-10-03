// qgis2web OpenLayers Map Initializer
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

var overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 250
    }
});

closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};

// Center on Abomey, Zou, Benin: [1.9912, 7.1845] in EPSG:4326 -> EPSG:3857
var abomeyCenter = ol.proj.fromLonLat([1.995, 7.185]);

var view = new ol.View({
    center: abomeyCenter,
    zoom: 12,
    minZoom: 9,
    maxZoom: 19
});

var map = new ol.Map({
    target: 'map',
    layers: layersList,
    overlays: [overlay],
    view: view
});

// Fit map to layer bounds if available
if (typeof features_Commune_abomey_2 !== 'undefined' && features_Commune_abomey_2.length > 0) {
    var extent = jsonSource_Commune_abomey_2.getExtent();
    view.fit(extent, { padding: [40, 40, 40, 40], maxZoom: 13 });
}

// Single click to inspect features
map.on('singleclick', function(evt) {
    var coordinate = evt.coordinate;
    var foundFeature = null;
    var foundLayer = null;

    map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
        if (!foundFeature && layer) {
            foundFeature = feature;
            foundLayer = layer;
        }
    });

    if (foundFeature && foundLayer) {
        var html = createPopupContent(foundFeature, foundLayer);
        content.innerHTML = html;
        overlay.setPosition(coordinate);
    } else {
        overlay.setPosition(undefined);
        closer.blur();
    }
});

// Pointer cursor over interactive features
map.on('pointermove', function(e) {
    if (e.dragging) return;
    var pixel = map.getEventPixel(e.originalEvent);
    var hit = map.hasFeatureAtPixel(pixel);
    map.getTargetElement().style.cursor = hit ? 'pointer' : '';
});

// Allow updating data dynamically from parent application
window.updateQGISData = function(newGeoJSON) {
    try {
        if (!newGeoJSON || !newGeoJSON.features) return;
        jsonSource_BENIN_PEPI_3.clear();
        var format = new ol.format.GeoJSON();
        var newFeatures = format.readFeatures(newGeoJSON, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        });
        jsonSource_BENIN_PEPI_3.addFeatures(newFeatures);
        console.log('[qgis2web] Couche BENIN_PEPI actualisée avec', newFeatures.length, 'pépinières');
    } catch (err) {
        console.error('[qgis2web] Erreur lors de l\'actualisation des données :', err);
    }
};

// Check for custom features saved in localStorage on initialization
try {
    var stored = localStorage.getItem('qgis2web_custom_features');
    if (stored) {
        var parsedStored = JSON.parse(stored);
        if (parsedStored && parsedStored.features) {
            window.updateQGISData(parsedStored);
        }
    }
} catch (e) {
    console.warn('[qgis2web] Impossible de charger le cache local', e);
}

// Listen to postMessage from parent window
window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'UPDATE_QGIS_DATA' && event.data.geojson) {
        window.updateQGISData(event.data.geojson);
    }
});
