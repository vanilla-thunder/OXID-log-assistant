'use strict';

angular.module('app', ['lumx']).controller('ctrl', function ($scope, $http, LxNotificationService) {

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
    };
    $scope.loadConfig = function() {
        //LxNotificationService.notify('loading config...');
        chrome.storage.sync.get(['config','shops'], function(data) {
            console.log("config loaded");
            console.log(data);
            if(data.hasOwnProperty("shops") && !angular.equals(data.shops, {}))
            {
                console.log("jaaaaa shops!!");
                $scope.shops = data.shops;
            }
            if(data.hasOwnProperty("config") && !angular.equals(data.config, {}))
            {
                console.log("jaaaaa config!!");
                $scope.config = data.config;
            }
            $scope.$apply();


        });
    };
    $scope.loadConfig();

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
                $scope.logs[_shop] = JSON.parse(xhr.response);
                //_callback(JSON.parse(xhr.response));
            }
            else {
                console.warn('Error ' + xhr.status + ': ' + xhr.statusText, xhr.responseText);
            }
        });
        xhr.send();
    };

    $scope.reloadLogs = function() {
        for(var shop in $scope.shops)
        {
            if($scope.shops.hasOwnProperty(shop)) $scope.fetchExceptions(shop,$scope.shops[shop]);
        }
    }

});
