class Conference{
    constructor(confData){
        this.acronym = confData[0];
        this.name = confData[1];
        this.qualis = confData[2];
        this.when = confData[4];
        this.where = confData[5];
        this.submissionDeadline = confData[7];
    }
}

function createInfoWindows(confInfo){
    return '<div id="content"><div id="siteNotice"></div>'+
      '<h4><strong>' + confInfo.acronym + '</strong></h4>'+
      '<div id="bodyContent"><ul>'+
      '<li><strong>Name</strong>: '     + confInfo.name + '</li>' +
      '<li><strong>Qualis</strong>: '   + confInfo.qualis + '</li>' +
      '<li><strong>When</strong>: '     + confInfo.when + '</li>' +
      '<li><strong>Where</strong>: '    + confInfo.where + '</li>' +
      '<li><strong>Deadline</strong>: ' + confInfo.submissionDeadline + '</li>' +
      '</ul></div></div>';
}

function getConfDataSource(){
    return "https://spreadsheets.google.com/feeds/cells/1cVBI2Sx9z0CWiQ3cuQhKyWggljY5K6mxmMg_jsgOI7g/1/public/values?alt=json";
}

$(document).ready(function() {
    $.get(getConfDataSource(), function(confData) {
        var data = confData.feed.entry;

        /* Processing json data */
        var allDataTable = []; var confTable = [];
        var lines = data[data.length - 1]["gs$cell"]["row"] - 1;
        var columns = data[data.length - 1]["gs$cell"]["col"];

        for(var l = 0; l < lines; l++){
            for(var c = 0; c < columns; c++){
                allDataTable[l] = [];
            }   
        }
            
        for(var index = 0; index < data.length; index++){
            var sData = {
                row:    data[index]["gs$cell"]["row"], 
                col:    data[index]["gs$cell"]["col"], 
                value:  data[index]["gs$cell"]["$t"]
            };
            if(sData.row == 1) continue;
            allDataTable[sData.row - 2][sData.col - 1] = sData.value;
        }

        for(var l = 0; l < lines; l++){
            var confLine = [];
            for(var c = 0; c < columns; c++){
                if(![0, 3, 6, 8].includes(c)){
                    confLine.push(allDataTable[l][c]);
                }
            }

            if(confLine.length != 0){
                confTable.push(confLine);
            }
        }

        console.log(allDataTable);
        console.log(confTable);

        var geocoder = new google.maps.Geocoder();
        for(var l = 0; l < lines; l++){
            var confInfo = new Conference(allDataTable[l]);
            getGeocodeAddressAndPutMarker(geocoder, confInfo, map);
        }

        $('#dataTableConf').DataTable({
            data: confTable,
            columns:[
                { title: "Name", width: "30%" },
                { title: "Qualis", className: 'text-center', width: "10%" },
                { title: "When", className: 'text-center', width: "10%" },
                { title: "Where", className: 'text-center', width: "20%" },
                { title: "Deadline", className: 'text-center', width: "10%" },
                { title: "Link", width: "20%", render: function(data){
                    return '<a href="' + data + '" target="_blank">' + data + '</a>'
                }},
            ]
        });

        //$('tr').addClass('d-flex');

        //$('#dataTableJournals').DataTable();

    });
});

function getIconByQualis(confInfo){
    var iconPath;
    if(confInfo.qualis == 'A1'){
        iconPath = 'img/marker-a1.png';
    }else if(confInfo.qualis == 'A2'){
        iconPath = 'img/marker-a2.png';
    }else if(confInfo.qualis == 'B1'){
        iconPath = 'img/marker-b1.png';
    }else if(confInfo.qualis == 'B2'){
        iconPath = 'img/marker-b2.png';
    }else if(confInfo.qualis == 'B3'){
        iconPath = 'img/marker-b3.png';
    }else if(confInfo.qualis == 'B4'){
        iconPath = 'img/marker-b4.png';
    }else if(confInfo.qualis == 'B5'){
        iconPath = 'img/marker-b5.png';
    }else if(confInfo.qualis == 'C'){
        iconPath = 'img/marker-c.png';
    }
    return iconPath;
}

function getGeocodeAddressAndPutMarker(geocoder, confInfo, confMap) {
    geocoder.geocode({'address': confInfo.where}, function(results, status) {
        if (status === 'OK') {
            var iconPath = getIconByQualis(confInfo);
            var marker = new google.maps.Marker({
                map: confMap,
                position: results[0].geometry.location,
                icon: iconPath
            });
            var infowindow = new google.maps.InfoWindow({
                content: createInfoWindows(confInfo)
            });
            marker.addListener('click', function() {
                infowindow.open(confMap, marker);
            });
        } else {
            console.log('Geocode was not successful for the following reason: ' + status);
        }
    });
}