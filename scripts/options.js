'use strict';

angular.module('app', ['lumx']).controller('ctrl', function ($scope, $http, LxNotificationService) {


    $scope.shops = {};
    $scope.loadShops = function() {
        //LxNotificationService.notify('loading config...');
        chrome.storage.sync.get('shops', function(data) {
            if(!data.hasOwnProperty("shops") || angular.equals(data.shops, {})) return;
            $scope.shops = data.shops;
            $scope.$apply();
        });
    };
    $scope.saveShops = function() {
        //LxNotificationService.notify('saving config...');
        chrome.storage.sync.set({'shops': $scope.shops}, function() {
            LxNotificationService.success("config saved!");
        });
    };
    $scope.loadShops();

    $scope.new = { shop:'', token:''};
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


    $scope.exceptions = {};
    $scope.fetchExceptions = function(_shop, _token) {
        chrome.extension.sendMessage(
            { 'fetchLog': {'shop': _shop, 'token': _token} },
            function (response) {
                console.log("log received");
                console.log(response);
                if(response.status == "ok") $scope.exceptions[_shop] = response.log;
            });
    };

    $scope.reloadLogs = function() {
        for(var shop in $scope.shops)
        {
            if($scope.shops.hasOwnProperty(shop)) $scope.fetchExceptions(shop,$scope.shops[shop]);
        }
    }

});
