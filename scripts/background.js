var logs = {};

function fetchLog(_shop,_token,_callback)
{
    console.log("fetching logs from url "+_shop);
    if(_shop.indexOf('http') !== 0) _shop = 'http://'+_shop;

    var url = _shop+'?fnc=bratMirEinenStorch&'+_token;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Accept", "application/json");
    //xhr.send(null);
    xhr.addEventListener('load', function (event)
    {
        if (xhr.status === 200) {
            console.log('xhr:');
            console.log(xhr);
            this.logs[_shop] = JSON.parse(xhr.response);
            //_callback(JSON.parse(xhr.response));
        }
        else {
            console.warn('Error ' + xhr.status + ': ' + xhr.statusText, xhr.responseText);
        }
    });
    xhr.send();
}
/*
function partyHard()
{
    console.log('  [ ' + new Date().toLocaleTimeString() + ' ] ' +"party hard!");
    var url = 'http://eingang.customer-service.intern.bestlife.ag/rest/issue/count?filter=Status%3A+Neu';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.setRequestHeader("Accept", "application/json");
    //xhr.send(null);
    xhr.addEventListener('load', function (event) {

        if (xhr.status === 200) {
            var data = JSON.parse(xhr.response);

            chrome.browserAction.setBadgeBackgroundColor({color: [208, 0, 24, 255]});
            chrome.browserAction.setBadgeText({
                text: data.value.toString()
            });
            console.log('  [ ' + new Date().toLocaleTimeString() + ' ] ' +"Partygäste: "+data.value.toString());
        }
        else {
            console.warn('Error ' + xhr.status + ': ' + xhr.statusText, xhr.responseText);
        }
    });
    xhr.send();
}*/
/*
function masterBlaster()
{
    console.log('  [ ' + new Date().toLocaleTimeString() + ' ] ' +"party hard!");
    var url = 'http://eingang.customer-service.intern.bestlife.ag/rest/issue/count?filter=Status%3A+Neu'; // Tickets zu besprechen,aber wie ist der Filter?
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.setRequestHeader("Accept", "application/json");
    //xhr.send(null);
    xhr.addEventListener('load', function (event) {

        if (xhr.status === 200) {
            var data = JSON.parse(xhr.response);

            chrome.browserAction.setBadgeBackgroundColor({color: [208, 0, 24, 255]});
            chrome.browserAction.setBadgeText({
                text: data.value.toString()
            });
            console.log('  [ ' + new Date().toLocaleTimeString() + ' ] ' +"Partygäste: "+data.value.toString());
        }
        else {
            console.warn('Error ' + xhr.status + ': ' + xhr.statusText, xhr.responseText);
        }
    });
    xhr.send();
}
*/
/*
chrome.alarms.onAlarm.addListener(function (alarm) {
    console.log('  [ ' + new Date().toLocaleTimeString() + ' ] ' +"alarm!");
    console.log(alarm);
    if (alarm && alarm.name == 'party hard!') partyHard();
});*/

//chrome.runtime.onInstalled.addListener(function () {
chrome.runtime.onStartup.addListener(function()
{
    console.log("start");
    chrome.browserAction.onClicked.addListener(function (tab) {
        chrome.runtime.openOptionsPage();
    });

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        console.log(request);
        if(request.hasOwnProperty("fetchLog")) {
            fetchLog(request.fetchLog.shop,request.fetchLog.token,sendResponse);
            return true;
        }
    });
});