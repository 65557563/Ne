// qgis2web functions helper
window.qgis2web = window.qgis2web || {};

function createPopupContent(feature, layer) {
    var props = feature.getProperties();
    var title = props.nom || props.nom_commune || props.NOM || props.NAME || 'Entité géographique';
    var isEcole = (props.type || '').toLowerCase().includes('ecole');
    var isNursery = !!props.capaciteAnnuelle || !!props.type || !!props.promoteur;

    var html = '<div class="popup-header-title">' + title + '</div>';
    
    if (isNursery) {
        html += '<span class="popup-tag ' + (isEcole ? 'tag-ecole' : 'tag-privee') + '">' + 
                (isEcole ? '🌳 Pépinière École' : '🌲 Pépinière Privée') + '</span>';
    }

    html += '<table class="popup-table">';
    var aliases = layer.get('fieldAliases') || {};
    
    for (var key in props) {
        if (key === 'geometry' || key === 'nom' || key === 'id' || key === 'photoUrl') continue;
        var val = props[key];
        if (val !== undefined && val !== null && val !== '') {
            var label = aliases[key] || key;
            if (Array.isArray(val)) val = val.join(', ');
            html += '<tr><th>' + label + '</th><td>' + val + '</td></tr>';
        }
    }
    html += '</table>';
    return html;
}
