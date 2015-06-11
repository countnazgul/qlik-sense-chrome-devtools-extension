var activeApp = null;
var qsGlobal = null;
var server = '';
var isSecure = false;
var app = '';

$( document ).ready(function() {  
  $('texta  rea#expression').val('Expression');  
  $('#dimensions').append($("<option />").val('').text('-- Empty dimension --'));
  
  $('#qdocopen').prop('disabled', true);
  $('#dimensions').prop('disabled', true);
  $('#expression').prop('disabled', true);
  $('#calculate').prop('disabled', true);  
  $('#loadingdims').hide();
  $('#loadingqsversion').show();
  $('#qsconnecting').show();
         
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
      global.qvVersion().then(function(version) {
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
    var dim = $("#dimensions option:selected").text();
    if(dim === '-- Empty dimension --') {      dim = "=''";
    }
     var expr = $('#expression').val();
    
    var obj = {
      "qInfo": {
        "qId": "LB01",
        "qType": "ListObject"
      },
      "qListObjectDef": {
        "qDef": {
          "qFieldDefs": [
            dim
          ],
          "qFieldLabels": [
            ""
          ],
          "qSortCriterias": [{
            "qSortByExpression": -1,
            "qExpression": {
              "qv": expr
            }
          }]
        },
        "qInitialDataFetch": [{
          "qTop": 0,
          "qLeft": 0,
          "qHeight": 100,
          "qWidth": 2
        }],
        "qExpressions": [{
          "qExpr": expr
        }]
      }
    };
    var obj1 = {};
    
    activeApp.createSessionObject(obj1).then(function(list) {
      list.getLayout().then(function(layout) {
        var row = layout.qListObject.qDataPages[0].qMatrix;
        $('#result').html('');
        var res = '';
        if( $("#dimensions option:selected").text() === '-- Empty dimension --') {
          res = '<table class="sortable" id="resultTable" style="white-space: nowrap"><thead><tr><th>'+'Calculation'+'</th></tr></thead><tbody>';
          res += '<tr><td>'+row[0][1].qText+'</td></tr>';  
        } else {
          res = '<table class="sortable" id="resultTable" style="white-space: nowrap"><thead><tr><th>'+ dim +'</th><th>'+'Calculation'+'</th></tr></thead><tbody>';                            
                                
            for(var r = 0; r < row.length; r++) {
              var dr = row[r];
              res += '<tr><td>'+dr[0].qText+'</td><td>'+dr[1].qText+'</td></tr>';            
            }
        }
        res += '</tbody></table>';
        $('#result').html(res);
      });
    });    
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
      $('#dimensions').append($("<option />").val('').text(allFields[a]));  
    }         
  }
  
  function OpenDoc() {
      $('#loadingdims').show();
      qsGlobal.openDoc(app).then(function(doc) {
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
          GetFields(docDataObjects);
        });
      });
  }

  $( "#calculate" ).on( "click", function() {
    $('#result').html();
    RunCalculation();
  });

  $( "#testConnection" ).on( "click", function() {
    $('#connectionResult').text();
    $('#connectionResult').text('test');
  });
  
  $( "#qdocopen" ).on( "click", function() {
    OpenDoc();
  });  
});