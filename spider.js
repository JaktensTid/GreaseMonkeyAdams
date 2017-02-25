// ==UserScript==
// @name        Adcogovscraper
// @namespace   Adams
// @include     http://apps.adcogov.org/oncoreweb/showdetails.aspx?id=*
// @require https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js
// @version     1
// @grant       none
// ==/UserScript==
 
// Particular document from frameset
var doc = undefined;
// Table with paginator
var table = undefined;
var paginatorContent = undefined;
var maxPage = undefined;
var currentPage = undefined;
var data = [];
 
String.prototype.replaceAll = function(search, replace){
  return this.split(search).join(replace);
}
 
function initVariables(){
  doc = window.frames[1].document;
  table = doc.getElementById('dgNav');
  paginatorContent = table.childNodes[1].children[1].innerText.replace('Prev', '').replace('Next','').replace('of','').split(' ');
  currentPage = parseInt(paginatorContent[0]);
}
 
//Get data from concrete frame
function getDataFromDocument(doc){
  function getValue(id)
  {
    var element = doc.getElementById(id);
   
    if(element.style.display == 'none')
      {
        return '';
      }
   
    return element.children[1].innerText;
  }
  var data = {};
  data['instrument'] = getValue('lblCfn');
  var l = data['instrument'].length;
  data['recep'] = data['instrument'].substring(l - 8, l - 1);
  var toSubstring = 0;
  for(var i = 0; i < data['recep'].length; i++)
    {
      if(data['recep'][i] == '0')
        {
          toSubstring++;
        }
      else
        break;
    }
  data['recep'] = data['recep'].substring(toSubstring, data['recep'].length - 1);
  data['year'] = data['instrument'].substring(0, 5);
  data['Reception No'] = data['year'] + '-' + data['recep'];
  data['docType'] = getValue('trDocumentType');
  data['modifyDate'] = getValue('trModifyDate');
  data['recordDate'] = getValue('trRecordDate');
  data['acknowledgementDate'] = getValue('trAcknowledgementDate');
  data['grantor'] = getValue('trGrantor');
  data['grantee'] = getValue('trGrantee');
  data['bookType'] = getValue('trBookType');
  data['bookPage'] = getValue('trBookPage');
  data['book'] = $.trim(data['bookPage'].split('/')[0])
  data['page'] = $.trim(data['bookPage'].split('/')[1])
  data['numberPages'] = getValue('trNumberPages');
  data['consideration'] = getValue('trConsideration');
  data['comments'] = getValue('trComments');
  data['comments2'] = getValue('trComments2');
  data['marriageDate'] = getValue('trMarriageDate');
  data['legal'] = getValue('trLegal');
  data['address'] = getValue('trAddress');
  data['caseNumber'] = getValue('trCaseNumber');
  data['parse1Id'] = getValue('trParcelId');
  data['furureDocs'] = getValue('trFutureDocs');
  data['prevDocs'] = getValue('trPrevDocs');
  data['unresolvedLinks'] = getValue('trUnresolvedLinks');
  data['relatedDocs'] = getValue('trRelatedDocs');
  data['docHistory'] = getValue('trDocHistory');
  data['refNum'] = getValue('trRefNum');
  data['rerecord'] = getValue('trRerecord');
 
  for (var p in data) {
    if( data.hasOwnProperty(p) ) {
      data[p] = data[p].replaceAll('\n','');
    }
  }      
 
  return data;
}
 
function toCsv(array){
    var keys = Object.keys(array[0]);
 
    var result = '"' + keys.join('","') + '"' + '\n';
 
    array.forEach(function(obj){
        keys.forEach(function(k, ix){
            if (ix == 0){
            result += '"' + obj[k] + '"';
        }
        else
        {
            result += ',"' + obj[k] + '"';
        }
        });
        result += "\n";
    });
 
    return result;
}
 
function next(){
  var td = table.children[0].children[1].children[0];
  var a = td.children[3];
  var evt = doc.createEvent ("MouseEvents");
  evt.initEvent ("click", true, true);
  a.dispatchEvent(evt);
}
 
// Wait while all frames loads
$(window).on('load', function() {
  initVariables();
  maxPage = parseInt(paginatorContent[paginatorContent.length - 1]);
 
if(currentPage == 1)
  {
    if (confirm('Are you about to scrape information to .csv?')) {
     
      // Frame event should be fired only once per load
      $("frame[name=contents]").on("load", function () {
      if(currentPage != maxPage - 1){
        initVariables();
        data.push(getDataFromDocument(doc));
        next();
        }
      else
        {
          initVariables();
          data.push(getDataFromDocument(doc));
          csv = toCsv(data);
          var a = document.createElement('a');
          a.href  = 'data:attachment/csv,' +  encodeURIComponent(csv);
          a.target = '_blank';
          a.download = 'result.csv';
          document.body.appendChild(a);
          a.click();
        }
        });
          data.push(getDataFromDocument(doc));
          next();
    }
  }
});