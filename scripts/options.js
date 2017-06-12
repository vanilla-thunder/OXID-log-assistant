'use strict';

chrome.notifications.onClicked.addListener(function(notificationId) {
    chrome.tabs.getCurrent(function(tab) {
        chrome.tabs.update(tab.id, {selected: true});
    });
    chrome.notifications.clear(notificationId);
    //chrome.runtime.openOptionsPage();
});

angular.module('app', ['lumx']).controller('ctrl', function ($scope, $http, $interval, LxNotificationService) {

    $scope.new = { shop:'', token:''};
    $scope.shops = {};
    $scope.addShop = function() {
        $scope.shops[$scope.new.shop] = $scope.new.token;
        $scope.new.shop = '';
        $scope.new.token = '';
        $scope.saveShops();
    };
    $scope.removeShop = function(_shop) {
        delete $scope.shops[_shop];
        $scope.saveShops();
    };

    $scope.config = {};
    $scope.saveConfig = function() {
        //LxNotificationService.notify('saving config...');
        chrome.storage.sync.set({'config': $scope.config,'shops':$scope.shops}, function() {
            LxNotificationService.success("config saved!");
        });
        if($scope.config.fetchtimer === 0) chrome.alarms.clear("getLogs");
        else if( $scope.config.fetchtimer >= 1 ) $scope.initCountdown();
    };
    $scope.loadConfig = function() {
        //LxNotificationService.notify('loading config...');
        chrome.storage.sync.get(['config','shops'], function(data) {
            if(data.hasOwnProperty("shops") && !angular.equals(data.shops, {})) $scope.shops = data.shops;
            if(data.hasOwnProperty("config") && !angular.equals(data.config, {})) $scope.config = data.config;
            if(data.hasOwnProperty("config") && data.config.fetchtimer >= 1) $scope.initCountdown();
            $scope.$apply();
        });
    };

    $scope.logs = null;
    $scope.getLogs = function(_shop, _token) {
        console.log("loading logs from "+_shop);

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
                if(!$scope.logs) $scope.logs = {};
                var _r = JSON.parse(xhr.response);
                // benachrichtigung über neue logs
                if($scope.logs.hasOwnProperty(_shop)) {
                    if($scope.logs[_shop].exceptions.time != _r.exceptions.time ) chrome.notifications.create(_shop+'exceptions',{
                        type:'basic',
                        priority: 2,
                        iconUrl: chrome.runtime.getURL('icons/64.png'),
                        title:_shop,
                        message:'new exception!',
                        isClickable: true
                    });
                    if($scope.logs[_shop].errors.time != _r.errors.time ) chrome.notifications.create(_shop+'errors',{
                        type:'basic',
                        priority: 2,
                        iconUrl: chrome.runtime.getURL('icons/64.png'),
                        title:_shop,
                        message: 'new webserver error',
                        isClickable: true
                    });
                }

                $scope.logs[_shop] = _r;
                //_callback(JSON.parse(xhr.response));
            }
            else {
                console.warn('Error ' + xhr.status + ': ' + xhr.statusText, xhr.responseText);
            }
        });
        xhr.send();
    };
    $scope.reloadLogs = function() {
        $scope.countdown.last = Date.now();
        for(var shop in $scope.shops) if($scope.shops.hasOwnProperty(shop)) $scope.getLogs(shop,$scope.shops[shop]);
    };

    $scope.initCountdown = function() {
        $scope.reloadLogs();
        console.log("init alarm every " + $scope.config.fetchtimer + " min");
        chrome.alarms.create("getLogs", {'periodInMinutes':$scope.config.fetchtimer});
    };
    chrome.alarms.onAlarm.addListener(function (alarm) {
        if (!alarm || alarm.name !== 'getLogs') return;
        console.log("getting logs!");
        $scope.reloadLogs();
    });

    // init stuff
    $scope.countdown = { last: null, now: null, progress: 0 };
    $interval( function() {
        if(!$scope.countdown.last || $scope.config.fetchtimer === 0) return;
        $scope.countdown.now = Date.now();
        $scope.countdown.progress = ($scope.countdown.now - $scope.countdown.last) / 10 / $scope.config.fetchtimer / 60 ;
        }, 1000);
    $scope.loadConfig();



});
