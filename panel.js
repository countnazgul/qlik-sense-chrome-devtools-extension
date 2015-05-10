// This one acts in the context of the panel in the Dev Tools
//
// Can use
// chrome.devtools.*
// chrome.extension.*
/*
document.querySelector('#executescript').addEventListener('click', function() {
    sendObjectToInspectedPage({action: "code", content: "console.log('Inline script executed')"});
}, false);

document.querySelector('#insertscript').addEventListener('click', function() {
    sendObjectToInspectedPage({action: "script", content: "inserted-script.js"});
}, false);

document.querySelector('#insertmessagebutton').addEventListener('click', function() {
    sendObjectToInspectedPage({action: "code", content: "document.body.innerHTML='<button>Send message to DevTools</button>'"});
    sendObjectToInspectedPage({action: "script", content: "messageback-script.js"});
}, false);
*/
  var activeApp = null;
  var qsGlobal = null;
  var server = '';
  var isSecure = '';
  var app = '';

$( document ).ready(function() {
  
  $('texta  rea#expression').val('Expression');
  
  $('#dimensions').append($("<option />").val('').text('-- Pick measure --'));
  $('#dimensions').append($("<option />").val('').text('-- Empty --'));
  
  $('#dimensions').prop('disabled', true);
  $('#expression').prop('disabled', true);
  $('#calculate').prop('disabled', true);
  
  $('#documentStatus').text('Not open');
  
  $( "#qdocopen" ).on( "click", function() {
    
    $('#documentStatus').text('Open');
    $('#documentStatus').toggleClass('connected');
    
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
    if(dim === '-- Empty --') {
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
      list.getLayout().then(function(layout) {
        console.log(layout);
        
      });
    });
    
  }

  function GetFields(docDataObjects) {
    var allFields = [];
    
    var qtr = docDataObjects.qtr;
    for( i = 0; i <qtr.length; i++) {
      var tableName = qtr[i].qName;
      var noOfRows = qtr[i].qNoOfRows;
      var fields = qtr[i].qFields;
      
      for(var f = 0; f < fields.length; f++) {
        allFields.push(fields[f].qName);
      }
      //var test = l;
      //return allFields;
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