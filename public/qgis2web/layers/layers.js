var wms_layers = [];

var lyr_OSMStandard_0 = new ol.layer.Tile({
    'title': 'OpenStreetMap',
    'type': 'base',
    'opacity': 1.000000,
    source: new ol.source.OSM()
});

// Commune Abomey Boundary Layer
var format_Commune_abomey_2 = new ol.format.GeoJSON();
var features_Commune_abomey_2 = format_Commune_abomey_2.readFeatures(json_Commune_abomey_2, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_Commune_abomey_2 = new ol.source.Vector({
    attributions: 'IGN Bénin & Mairie d\'Abomey',
});
jsonSource_Commune_abomey_2.addFeatures(features_Commune_abomey_2);
var lyr_Commune_abomey_2 = new ol.layer.Vector({
    declutter: true,
    source: jsonSource_Commune_abomey_2, 
    style: style_Commune_abomey_2,
    popuplayertitle: "Commune d'Abomey",
    interactive: true,
    title: "Commune d'Abomey"
});

// BENIN_PEPI Nurseries Layer
var format_BENIN_PEPI_3 = new ol.format.GeoJSON();
var features_BENIN_PEPI_3 = format_BENIN_PEPI_3.readFeatures(json_BENIN_PEPI_3, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_BENIN_PEPI_3 = new ol.source.Vector({
    attributions: 'Inventaire Sylvicole Zou',
});
jsonSource_BENIN_PEPI_3.addFeatures(features_BENIN_PEPI_3);
var lyr_BENIN_PEPI_3 = new ol.layer.Vector({
    declutter: true,
    source: jsonSource_BENIN_PEPI_3, 
    style: style_BENIN_PEPI_3,
    popuplayertitle: "Pépinières BENIN_PEPI",
    interactive: true,
    title: "Pépinières (BENIN_PEPI)"
});

lyr_OSMStandard_0.setVisible(true);
lyr_Commune_abomey_2.setVisible(true);
lyr_BENIN_PEPI_3.setVisible(true);

var layersList = [lyr_OSMStandard_0, lyr_Commune_abomey_2, lyr_BENIN_PEPI_3];

lyr_Commune_abomey_2.set('fieldAliases', {
    'nom_commune': 'Commune', 
    'departement': 'Département', 
    'arrondissements': 'Arrondissements',
    'superficie_km2': 'Superficie (km²)',
    'description': 'Description'
});

lyr_BENIN_PEPI_3.set('fieldAliases', {
    'nom': 'Nom du site', 
    'type': 'Type (École / Privée)', 
    'commune': 'Commune', 
    'arrondissement': 'Arrondissement', 
    'promoteur': 'Promoteur / Responsable', 
    'capaciteAnnuelle': 'Capacité annuelle', 
    'statut': 'Statut',
    'telephone': 'Téléphone',
    'especes': 'Espèces produites',
    'systemeArrosage': 'Système d\'arrosage'
});

lyr_BENIN_PEPI_3.set('fieldImages', {
    'nom': 'TextEdit', 
    'type': 'TextEdit', 
    'commune': 'TextEdit', 
    'arrondissement': 'TextEdit', 
    'promoteur': 'TextEdit', 
    'capaciteAnnuelle': 'Range', 
    'statut': 'TextEdit'
});
