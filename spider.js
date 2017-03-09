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
 
  function getSecTwpRng(legal)
  {
    var lotReg = '(lot[s]? [0-9]{1,2}&[0-9]{1,2})|(lot[s]? [0-9]{1,2}-[0-9]{1,2})|(lot[s]? [0-9]{1,2})';
    var blkReg = '(blk[s]? [0-9]{1,2}&[0-9]{1,2})|(blk[s]? [0-9]{1,2}-[0-9]{1,2})|(blk[s]? [0-9]{1,2})';
    var sec = '';
    var twp = '';
    var rng = '';
    var blk = '';
    var lot = '';
    var subdivision = '';
    var matches = legal.match('( [0-9]{1,2}-[0-9]{1,2}-[0-9]{1,2})|(^[0-9]{1,2}-[0-9]{1,2}-[0-9]{1,2})');
    if(matches)
      {
        return $.trim(matches[0]).split('-');
      }
    matches = legal.match('( [0-9]{1,2} [0-9]{1,2} [0-9]{1,2})|(^[0-9]{1,2} [0-9]{1,2} [0-9]{1,2})');
    if(matches)
      {
        return $.trim(matches[0]).split(' ');
      }
    var lower = legal.toLowerCase();
    var secReg = '(sec [0-9]{1,2})|(sec:[0-9]{1,2})';
    var tpReg = '(tp [0-9]{1,2})|(tp:[0-9]{1,2})';
    var rngReg = '(rng [0-9]{1,2})|(rng:[0-9]{1,2})';
    sec = lower.match(secReg) == null ? '' : lower.match(secReg)[0].replace('sec ', '').replace('sec:', '');
    twp = lower.match(tpReg) == null ? '' : lower.match(tpReg)[0].replace('tp ', '').replace('tp:', '');
    rng = lower.match(rngReg) == null ? '' : lower.match(rngReg)[0].replace('rng ', '').replace('rng:', '');
    blk = lower.match(blkReg) == null ? '' : lower.match(blkReg)[0].replace('blk ', '');
    lot = lower.match(lotReg) == null ? '' : lower.match(lotReg)[0].replace('lot ', '').replace('lots ', '');
    if(lot != '' & blk != '')
    {
        subdivision = lower.match('((' + blkReg + ') .*)') == null ? '' : lower.match('((' + blkReg + ') .*)')[0].replace('blk ' + blk + ' ', '');
    }
    else if (lot != '')
    {
        subdivision = lower.match('((' + lotReg + ') .*)') == null ? '' : lower.match('((' + lotReg + ') .*)')[0].replace('lot ' + lot + ' ', '').replace('lots ' + lot + ' ', '');
    }
    return [sec, twp, rng, blk, lot, subdivision.toUpperCase()];
  }
 
  var data = {};
  data['instrument'] = doc.getElementById('lblCfn').innerText;
  var l = data['instrument'].length;
  data['recep'] = data['instrument'].substring(l - 7);
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
  data['recep'] = data['recep'].substring(toSubstring);
  data['year'] = data['instrument'].substring(0, 4);
  data['Reception No'] = data['recep'] + '-' + data['year'];
  data['docType'] = getValue('trDocumentType');
  data['modifyDate'] = getValue('trModifyDate');
  data['recordDate'] = getValue('trRecordDate');
  data['acknowledgementDate'] = getValue('trAcknowledgementDate');
  data['grantor'] = getValue('trGrantor');
  data['grantee'] = getValue('trGrantee');
  data['bookType'] = getValue('trBookType');
  data['bookPage'] = getValue('trBookPage');
  data['book'] = $.trim(data['bookPage'].split('/')[0]);
  data['page'] = $.trim(data['bookPage'].split('/')[1]);
  data['numberPages'] = getValue('trNumberPages');
  data['consideration'] = getValue('trConsideration');
  data['comments'] = getValue('trComments');
  data['comments2'] = getValue('trComments2');
  data['marriageDate'] = getValue('trMarriageDate');
  data['legal'] = getValue('trLegal');
  var coords = getSecTwpRng(data['legal']);
  data['sec'] = coords[0];
  data['twp'] = coords[1];
  data['rng'] = coords[2];
  data['block'] = coords[3];
  data['lot'] = coords[4];
  data['subdivision'] = coords[5].toUpperCase();
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
 
  return data;
}
 
function toCsv(array){
    array = remove_duplicates(array);
    var keys = ['grantor','grantee','Reception No','docType','recordDate','book','page','comments','legal',
    'sec','twp','rng','block','lot','subdivision','address','futureDocs','prevDocs','unresolvedLinks',
    'relatedDocs','docHistory','refNum','rerecord','instrument','recep','year','modifyDate',
    'acknowledgementDate','bookType','bookPage','numberPages','consideration','comments2','marriageDate','caseNumber','parse1Id'];
 
    var result = '"' + keys.join('","') + '"' + '\n';
 
    array.forEach(function(obj){
        keys.forEach(function(k, ix){
          if(obj[k] == undefined) { obj[k] = '';}
            if (ix == 0){
            result += '"' + obj[k].replace('\n', '') + '"';
        }
        else
        {
            result += ',"' + obj[k].replace('\n', '') + '"';
        }
        });
        result += "\n";
    });
 
    return result;
}
 
function remove_duplicates(objectsArray) {
    var usedObjects = {};
 
    for (var i=objectsArray.length - 1;i>=0;i--) {
        var so = JSON.stringify(objectsArray[i]);
 
        if (usedObjects[so]) {
            objectsArray.splice(i, 1);
 
        } else {
            usedObjects[so] = true;          
        }
    }
 
    return objectsArray;
 
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