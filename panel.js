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
  
  var server = '';
  var isSecure = '';
  var app = '';
  
  var port = chrome.extension.connect({
        name: "Sample Communication"
  });
  
  port.postMessage(chrome.devtools.inspectedWindow.tabId);
  port.onMessage.addListener(function (url) {
  console.log(url);

    if(url.indexOf('https://') > -1) {
      isSecure = true;
    } else {
      isSecure = false;
    }
    
    url = url + '/';
    server = url.substring(url.indexOf('://') + 3, url.indexOf('/',url.indexOf('://') + 3));
    //app = url.substring(url.indexOf('app/') + 4, url.indexOf('/',url.indexOf('app/') + 4));
    app = 'd14e5c9c-d328-4acf-86d2-4b2c2fda82cc';
    
    // var data = {
    //   'issecure' : isSecure,
    //   'server' : server,
    //   'app': app
    // };
    $('#qsserver').text(server);
    
  var config = {
    host: server,
    isSecure: isSecure
  };
  
  var activeApp = null;
  //Connect to a server using the config object.
  //Connecting without a config object automatically assumes a instance of Qlik Sense Desktop
  //When connected we are returned with a handle that represents the Global class.
  qsocks.Connect(config).then(function(global) {
    //We can now interact with the global class, for example fetch the document list.
    //qsocks mimics the Engine API, refer to the Engine API documentation for available methods.
    
    //global.getDocList().then(function(docList) {
      //docList.forEach(function(doc) {
        //$('#documents').append($("<option />").val(doc.qDocId).text(doc.qTitle));
        //console.log(doc);
        
        //if(doc.qTitle === "Sales Discovery") {
          //var docId = doc.qDocId;
          //var docName = doc.qDocName;
          
          global.openDoc(app).then(function(doc) {
            activeApp = doc;
            
            doc.getAppProperties().then(function(props) {
              console.log(props);
              $('#qsdoc').text(props.qTitle);
            });
            
            //console.log(app);
            doc.getTablesAndKeys({"qcx": 1000,"qcy": 1000},{"qcx": 0,"qcy": 0},30,true,false).then(function(docDataObjects) {
              
              GetFields(docDataObjects);
              console.log(docDataObjects);

              
            });
          });
        //}
      });    
    
    
    
    //console.log(data);
  });
  
  
  
  function RunCalculation() {
    var dim = $('#dimension').val();
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

  $( "#calculate" ).on( "click", function() {
    RunCalculation();
  });

  $( "#testConnection" ).on( "click", function() {
    $('#connectionResult').text();
    $('#connectionResult').text('test');
  });
  
  $( "#openDoc" ).on( "click", function() {
    //$('#connectionResult').text();
    //$('#connectionResult').text('test');
  });  
  
  

//    });
  //});  

  
});