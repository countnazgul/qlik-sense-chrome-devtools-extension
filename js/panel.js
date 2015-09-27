var activeApp = null;
var qsGlobal = null;
var server = '';
var isSecure = false;
var app = '';

$( document ).ready(function() {

  $("#usual1 ul").idTabs(); 

  $('texta  rea#expression').val('Expression');
  $('#dimensions').append($("<option />").val('-- Empty dimension --').text('-- Empty dimension --'));

  $('#qdocopen').prop('disabled', true);
  $('#dimensions').prop('disabled', true);
  $('#expression').prop('disabled', true);
  $('#calculate').prop('disabled', true);
  $('#loadingdims').hide();
  $('#loadingqsversion').show();
  $('#qsconnecting').show();
  $('#export').prop('disabled', true);

  $('textarea#expression').focus(function() {
     if($(this).val() === 'Expression') {
       $(this).val('');
     }
  });

  $('textarea#expression').focusout(function() {
     if($(this).val().trim() === '') {
       $(this).val('Expression');
     }
  });

  var port = chrome.extension.connect({
        name: "Sample Communication"
  });

  port.postMessage(chrome.devtools.inspectedWindow.tabId);
  port.onMessage.addListener(function (url) {

    if(url.indexOf('https://') > -1) {
      isSecure = true;
    } else {
      isSecure = false;
    }

    url = url + '/';

    if(url.indexOf('/app/') > -1) {
      server = url.substring(url.indexOf('://') + 3, url.indexOf('/',url.indexOf('://') + 3));
      app = url.substring(url.indexOf('app/') + 4, url.indexOf('/',url.indexOf('app/') + 4));
      $('#qsserver').text(server);
      $('#qsserver_session').val(server);      
      $('#qsdoc').text(decodeURIComponent(app));
      $('#qdocopen').prop('disabled', false);
    } else {

    }

    if(app.indexOf('%5CApps%5C') > -1) {
      app = decodeURIComponent(app.substring(app.indexOf('%5CApps%5C') + 10, url.indexOf('/',app.indexOf('%5CApps%5C') + 10)));
    }

  var config = {
    host: server, // + '123',
    isSecure: isSecure
  };

  qsocks.Connect(config).then(function(global) {
    qsGlobal = global;
    
     // global.openDoc('Sales Discovery').then(function(app) {
      //  console.log(app)
     // })
    
      global.productVersion().then(function(version) {
        console.log(version)
        $('#qdocopen').prop('disabled', false);
        $('#qsconnectingerror').hide();
        $('#loadingqsversion').hide();
        $('#qsconnecting').hide();
        $('#qsversion').text('');
        $('#qsversion').text('(QS Version: ' + version + ')');        
      });
    });
});

/*
  if(!qsGlobal) {
    $('#loadingqsversion').hide();
    $('#qsconnectingerror').show();
    $('#qdocopen').prop('disabled', true);
    $('#qsconnectingerror').text('Error connecting to host. Make sure that you are logged in to Qlik Sense');
  }
*/

  function RunCalculation() {
    var dims = [];
    var dims1 = [];
    var expr = $('#expression').val();
    var dimenstionsCount = $('.dimensions').length;

    $('.dimensions option:selected').each(function() {
      var fieldDimension = $(this).text();
      dims1.push(fieldDimension);
      if(dimenstionsCount == 1) {
          dims.push(fieldDimension);
      } else if(fieldDimension != '-- Empty dimension --') {
        dims.push(fieldDimension);
      }
    });

    var cubedef = {
      "qInfo": {
        "qId": "BarChart01",
        "qType": "Chart"
      },
      "qHyperCubeDef": {
        "qDimensions": [

        ],
        "qMeasures": [
          {
            "qLibraryId": "",
            "qSortBy": {
              "qSortByState": 0,
              "qSortByFrequency": 0,
              "qSortByNumeric": 0,
              "qSortByAscii": 0,
              "qSortByLoadOrder": 1,
              "qSortByExpression": 0,
              "qExpression": {
                "qv": ""
              }
            },
            "qDef": {
              "qLabel": "",
              "qDescription": "",
              "qTags": [
                "tags"
              ],
              "qGrouping": "N",
              "qDef": expr
            }
          }
        ],
        "qInitialDataFetch": [
          {
            "qTop": 0,
            "qLeft": 0,
            "qHeight": 1000,
            "qWidth": dims.length + 1
          }
        ]
      }
    };

    var dimHistory = '';
    for(var d = 0; d < dims1.length; d++) {

      if(dimHistory == '') {
        dimHistory += dims1[d];
      } else {
        dimHistory += ',' + dims1[d];
      }

      cubedef.qHyperCubeDef.qDimensions.push(
      { "qLibraryId": "",
        "qNullSuppression": false,
        "qDef": {
          "qGrouping": "N",
          "qFieldDefs": [ dims[d] ],
          "qFieldLabels": [ "" ] }
       });
    }

activeApp.createSessionObject(cubedef).then(function(obj) {
  obj.getLayout().then(function(layout) {
    var row = layout.qHyperCube.qDataPages[0].qMatrix;
    //console.log(layout.qHyperCube);
    $('#result').html('');

    res = '<table class="tablesorter" id="resultTable" style="white-space: nowrap"><thead><tr>';
    for(var i = 0; i < dims.length; i++) {
      res += '<th>'+ dims[i] +'</th>';
    }

    res += '<th>'+'Calculation'+'</th></tr></thead><tbody>';

    for(var r = 0; r < row.length; r++) {
      var dr = row[r];
      res += '<tr>';

      for(var d = 0; d < dr.length; d++) {
        res += '<td>'+dr[d].qText+'</td>';
      }
      res += '</tr>';
    }

    res += '</tbody></table>';
    res += 'TIP! Sort multiple columns simultaneously by holding down the shift key and clicking a second, third or even fourth column header!<br/>';
    $('#result').html(res);
    $("#resultTable").tablesorter();
    $('#histinner').append('<div>Dimensions: ' + dimHistory + ' Expression: ' + expr +' <a href="#" class="historyValue">Re-use</a>&nbsp;<a href="#" class="historyValueRemove">Remove</a></div>');
    $('#export').prop('disabled', false);
    $( ".historyValueRemove" ).click(function() {
      $(this).parent().remove();
    });

    $( ".historyValue" ).click(function() {
      var hist = $(this).parent().text();
      var histDimensions = hist.substring(0, hist.indexOf('Expression')).trim().replace('Dimensions: ', '').trim().split(',')

      var histExpression = hist.substring(hist.indexOf('Expression: ')).replace('Expression: ','').trim().replace(/ /ig,"").replace('Re-use', '').replace('Remove', '').trim();
      $('#newOptions').remove();

      if(histDimensions[0] == 'Dimensions:') {
        $("#dimensions").val('-- Empty dimension --');
      } else {
        $("#dimensions").val(histDimensions[0]);
      }
      for(var d = 1; d < histDimensions.length; d++) {
        $('#dimensions').clone().attr('id', 'newOptions').appendTo('#dims');
        $('#dims select').last().val(histDimensions[d]);
      }

      $('#expression').val(histExpression);

    });

  }, function(error) {
    console.log(error);
  });
}, function(error) {
  console.log(error);
});



/*    activeApp.createSessionObject(obj).then(function(list) {
      list.getLayout().then(function(layout) {
        var row = layout.qListObject.qDataPages[0].qMatrix;
        console.log(row)
        $('#result').html('');
        var res = '';
        //if( $("#dimensions option:selected").text() === '-- Empty dimension --') {
//          res = '<table class="sortable" id="resultTable" style="white-space: nowrap"><thead><tr><th>'+'Calculation'+'</th></tr></thead><tbody>';
          //res += '<tr><td>'+row[0][1].qText+'</td></tr>';
        //} else {
          res = '<table class="sortable" id="resultTable" style="white-space: nowrap"><thead><tr><th>'+ dim +'</th><th>'+'Calculation'+'</th></tr></thead><tbody>';

            for(var r = 0; r < row.length; r++) {
              var dr = row[r];
              res += '<tr><td>'+dr[0].qText+'</td><td>'+dr[1].qText+'</td></tr>';
            }
        //}
        res += '</tbody></table>';
        $('#result').html(res);
      });
    });*/
  }

  function GetFields(docDataObjects) {
    var allFields = [];

    var qtr = docDataObjects.qtr;
    for(var i = 0; i <qtr.length; i++) {
      var fields = qtr[i].qFields;

      for(var f = 0; f < fields.length; f++) {
        allFields.push(fields[f].qName);
      }

      allFields.sort();
    }

    for(var a = 0; a < allFields.length; a++) {
      $('#dimensions').append($("<option />").val(allFields[a]).text(allFields[a]));
    }
  }

  function OpenDoc() {
      $('#loadingdims').show();     
      qsGlobal.openDoc('Sales Discovery').then(function(doc) { //app
        console.log(doc)
        
        activeApp = doc;
        
        doc.getAppProperties().then(function(props) {
          console.log(props);
          $('#qsdoc').text(props.qTitle);
            $('#loadingdims').hide();
            $('#dimensions').prop('disabled', false);
            $('#expression').prop('disabled', false);
            $('#calculate').prop('disabled', false);
        });

        doc.getTablesAndKeys({"qcx": 1000,"qcy": 1000},{"qcx": 0,"qcy": 0},30,true,false).then(function(docDataObjects) {
          console.log(docDataObjects)
          GetFields(docDataObjects);
        });
      });
  }

  $( "#adddim" ).on( "click", function() {
    $('#dimensions').clone().attr('id', 'newOptions').appendTo('#dims');
  });

  $( "#removedim" ).on( "click", function() {
    //$('#dimensions').clone().attr('id', 'newOptions').appendTo('#dims');
    if( $('#dims').children().size() > 1) {
      $('#dims select').last().remove();
    }
  });

  $( "#history" ).on( "click", function() {
    var container = $( "#histcontainer" );
     if (container.is( ":visible" )){
         container.slideUp( 500 );
     } else {
         container.slideDown( 500 );
     }
  });

  $( "#calculate" ).on( "click", function() {
    $('#result').html();
    $('#export').prop('disabled', true);
    RunCalculation();
  });

  $( "#testConnection" ).on( "click", function() {
    $('#connectionResult').text();
    $('#connectionResult').text('test');
  });

  $( "#qdocopen" ).on( "click", function() {
    OpenDoc();
  });

  $( "#export" ).on( "click", function() {
    var exportData = $('#resultTable').table2CSV({delivery:'value'});
    var file = new Blob([exportData]);
    var link = document.createElement("a");
    link.href = window.URL.createObjectURL(file);
    link.download = 'ExportData.csv';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    delete link;
  });
  
    $('#loadscript_session').focus(function () {
      $(this).animate({ height: "15em" }, 500); 
  });
  
  $('#loadscript_session').focusout(function () {
      $(this).animate({ height: "2em" }, 500); 
  });
  
  var gSessionApp = '';
  $( "#qdoccreate_session" ).on( "click", function() {
    var config = {
      host: server, // + '123',
      isSecure: isSecure
    };
    
    
    //qsocks.Connect(config).then(function (global) {
      qsGlobal.createSessionApp().then(function (sessionApp) {
        console.log(sessionApp);
        gSessionApp = sessionApp;
        sessionApp.getProperties().then(function (sessionAppProps) {
          $( '#qsdoc_session' ).text(sessionAppProps.qAppProperties.qTitle);
          sessionApp.setScript( $( '#loadscript_session' ).val() ).then( function() {
            sessionApp.doReload().then( function(status) {
              console.log(status);
              
            })
          })
        });
      });
    //});
  });
  
    $( "#qdocreload_session" ).on( "click", function() {
      gSessionApp.setScript( $( '#loadscript_session' ).val() ).then( function() {
        gSessionApp.checkScriptSyntax().then( function( scriptStatus ) {
          console.log( scriptStatus );
          if( scriptStatus.length > 0 ) {
            gSessionApp.doReload().then(function (status) {
              console.log(status);
            });
          } else {
            console.log(scriptStatus)
          }
       });
     });
  });
  
});
