var size = 0;
var placement = 'point';

var style_BENIN_PEPI_3 = function(feature, resolution){
    var isEcole = (feature.get("type") || '').toLowerCase().includes('ecole');
    var fillColor = isEcole ? 'rgba(16, 185, 129, 0.95)' : 'rgba(245, 158, 11, 0.95)';
    var strokeColor = isEcole ? '#064e3b' : '#78350f';
    
    var labelText = "";
    if (feature.get("nom") !== null && resolution < 150) {
        labelText = String(feature.get("nom"));
    }

    return [ new ol.style.Style({
        image: new ol.style.Circle({
            radius: 8.0,
            stroke: new ol.style.Stroke({
                color: strokeColor,
                width: 2.0
            }),
            fill: new ol.style.Fill({
                color: fillColor
            })
        }),
        text: new ol.style.Text({
            font: "bold 11px 'Plus Jakarta Sans', Arial, sans-serif",
            text: labelText,
            offsetY: -14,
            fill: new ol.style.Fill({color: '#0f172a'}),
            stroke: new ol.style.Stroke({color: '#ffffff', width: 3.0})
        })
    })];
};
