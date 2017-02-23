// ==UserScript==
// @name        Adcogovscraper
// @namespace   Adams
// @include     http://apps.adcogov.org/oncoreweb/showdetails.aspx?id=*
// @require https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js
// @version     1
// @grant       none
// ==/UserScript==

var doc = undefined;
var table = undefined;
var paginatorContent = undefined;
var maxPage = undefined;
var currentPage = undefined;
var data = [];

function sleep(ms) {
  ms += new Date().getTime();
  while (new Date() < ms){}
} 

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
  var data = {};
  data['docType'] = doc.getElementById('trDocumentType').children[1].innerText;
  data['modifyDate'] = doc.getElementById('trModifyDate').children[1].innerText;
  data['recordDate'] = doc.getElementById('trRecordDate').children[1].innerText;
  data['acknowledgementDate'] = doc.getElementById('trAcknowledgementDate').children[1].innerText;
  data['grantor'] = doc.getElementById('trGrantor').children[1].innerText;
  data['grantee'] = doc.getElementById('trGrantee').children[1].innerText;
  data['bookType'] = doc.getElementById('trBookType').children[1].innerText;
  data['bookPage'] = doc.getElementById('trBookPage').children[1].innerText;
  data['numberPages'] = doc.getElementById('trNumberPages').children[1].innerText;
  data['consideration'] = doc.getElementById('trConsideration').children[1].innerText;
  data['comments'] = doc.getElementById('trComments').children[1].innerText;
  data['comments2'] = doc.getElementById('trComments2').children[1].innerText;
  data['marriageDate'] = doc.getElementById('trMarriageDate').children[1].innerText;
  data['legal'] = doc.getElementById('trLegal').children[1].innerText;
  data['address'] = doc.getElementById('trAddress').children[1].innerText;
  data['caseNumber'] = doc.getElementById('trCaseNumber').children[1].innerText;
  data['parse1Id'] = doc.getElementById('trParcelId').children[1].innerText;
  data['furureDocs'] = doc.getElementById('trFutureDocs').children[1].innerText;
  data['prevDocs'] = doc.getElementById('trPrevDocs').children[1].innerText;
  data['unresolvedLinks'] = doc.getElementById('trUnresolvedLinks').children[1].innerText;
  data['relatedDocs'] = doc.getElementById('trRelatedDocs').children[1].innerText;
  data['docHistory'] = doc.getElementById('trDocHistory').children[1].innerText;
  data['refNum'] = doc.getElementById('trRefNum').children[1].innerText;
  data['rerecord'] = doc.getElementById('trRerecord').children[1].innerText;
  for (var p in data) {
    if( data.hasOwnProperty(p) ) {
      data[p] = data[p].replaceAll('\n','');
    } 
  }      
  return data;
}

function storeDataAndGoNext(){
  var td = table.children[0].children[1].children[0];
  var a = td.children[3];
  var evt = doc.createEvent ("MouseEvents");
  evt.initEvent ("click", true, true);
  a.dispatchEvent(evt);
  $("frame[name=contents]").on("load", function () {
      if(currentPage != maxPage){
        console.log(currentPage);
        initVariables();
        //data.push(getDataFromDocument(doc));
        storeDataAndGoNext();
      }
    });
}

//Wait while all frames loads
$(window).on('load', function() {
  initVariables();
  maxPage = parseInt(paginatorContent[paginatorContent.length - 1]);
if(currentPage == 1)
  {
    if (confirm('Are you about to scrape information to .csv?')) {
          //data.push(getDataFromDocument(doc));
          storeDataAndGoNext();
    }
  }
});
