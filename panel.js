var activeApp = null;
var qsGlobal = null;
var server = '';
var isSecure = '';
var app = '';

$( document ).ready(function() {  
  $('texta  rea#expression').val('Expression');  
  $('#dimensions').append($("<option />").val('').text('-- Empty dimension --'));
  
  $('#qdocopen').prop('disabled', true);
  $('#dimensions').prop('disabled', true);
  $('#expression').prop('disabled', true);
  $('#calculate').prop('disabled', true);
  
  //$('#documentStatus').text('Not open');
  
  $( "#qdocopen" ).on( "click", function() {
    
    //$('#documentStatus').text('Open');
    //$('#documentStatus').toggleClass('connected');
    
    $('#dimensions').prop('disabled', false);
    $('#expression').prop('disabled', false);
    $('#calculate').prop('disabled', false);          
    
  });    
  
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
  
  function getServerandUrl () {
    
  }
  
  
  port.postMessage(chrome.devtools.inspectedWindow.tabId);
  port.onMessage.addListener(function (url) {
  //console.log(url);

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
      //console.log(app);
    } else {
      // App is not available!!!!! disable
    }
    
    if(app.indexOf('%5CApps%5C') > -1) {
      app = decodeURIComponent(app.substring(app.indexOf('%5CApps%5C') + 10, url.indexOf('/',app.indexOf('%5CApps%5C') + 10)));
    }

    
  var config = {
    host: server,
    isSecure: isSecure
  };
  

  qsocks.Connect(config).then(function(global) {
    qsGlobal = global;
      global.qvVersion().then(function(version) {
        $('#qsversion').text('');
        $('#qsversion').text('QS Version: ' + version);
        //console.log(version);
      });
    });
  });
  
  
  
  function RunCalculation() {
    //var dim = $('#dimensions').val();
    var dim = $("#dimensions option:selected").text();
    if(dim === '-- Empty dimension --') {
      dim = '=0';
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
    
    
    activeApp.createSessionObject(obj).then(function(list) {
      list.getLayout().then(function(layout) {  //'/qListObjectDef', l
        var row = layout.qListObject.qDataPages[0].qMatrix;
        var res = '<table class="sortable" id="resultTable" style="white-space: nowrap"><thead><tr><th>'+'Dim'+'</th><th>'+'Calc'+'</th></tr></thead><tbody>';
        
        $('#result').html('');
        
        for(var r = 0; r < row.length; r++) {
          var dr = row[r];
          res += '<tr><td>'+dr[0].qText+'</td><td>'+dr[1].qText+'</td></tr>';            
        }
        
        res += '</tbody></table>';
        $('#result').html(res);
        
        var resultTable = $('#resultTable');

        //$('#resultTable').addClass('datagrid'); 

        console.log(layout);        
      });
    });
    
  }

  function GetFields(docDataObjects) {
    var allFields = [];
    
    var qtr = docDataObjects.qtr;
    for(var i = 0; i <qtr.length; i++) {
      //var tableName = qtr[i].qName;
      //var noOfRows = qtr[i].qNoOfRows;
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
      qsGlobal.openDoc(app).then(function(doc) {
        activeApp = doc;
        
        doc.getAppProperties().then(function(props) {
          console.log(props);
          $('#qsdoc').text(props.qTitle);
        });
        
        doc.getTablesAndKeys({"qcx": 1000,"qcy": 1000},{"qcx": 0,"qcy": 0},30,true,false).then(function(docDataObjects) {
          GetFields(docDataObjects);
          //console.log(docDataObjects);
        });
      });
  }

  $( "#calculate" ).on( "click", function() {
    RunCalculation();
  });

  $( "#testConnection" ).on( "click", function() {
    $('#connectionResult').text();
    $('#connectionResult').text('test');
  });
  
  $( "#qdocopen" ).on( "click", function() {
    OpenDoc();
    //$('#connectionResult').text();
    //$('#connectionResult').text('test');
  });  
});