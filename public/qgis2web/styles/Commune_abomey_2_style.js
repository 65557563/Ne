var size = 0;
var placement = 'point';

var style_Commune_abomey_2 = function(feature, resolution){
    var labelText = "";
    var labelFont = "bold 13px 'Plus Jakarta Sans', Arial, sans-serif";
    var labelFill = "#064e3b";
    var bufferColor = "#ffffff";
    var bufferWidth = 2.5;
    if (feature.get("nom_commune") !== null && resolution < 400) {
        labelText = String(feature.get("nom_commune"));
    }
    return [ new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(5, 150, 105, 0.9)', 
            lineDash: [6, 4], 
            width: 2.5
        }),
        fill: new ol.style.Fill({
            color: 'rgba(16, 185, 129, 0.10)'
        }),
        text: new ol.style.Text({
            font: labelFont,
            text: labelText,
            fill: new ol.style.Fill({color: labelFill}),
            stroke: new ol.style.Stroke({color: bufferColor, width: bufferWidth})
        })
    })];
};
