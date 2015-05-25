angular.module('myApp', [])
    .provider('Stock', function () {
        var baseUrl = "";

        this.setBaseUrl = function (baseUrl) {
            if (baseUrl) this.baseUrl = baseUrl;
        };
        this.$get = function ($q, $http) {
            var self = this;
            return {
                getStockInfo: function (opt, type) {
                    var d = $q.defer();
                    var temp = new Object(),
                        tempobject = new Object();
                    temp[opt] = type;
                    tempobject["data"] = JSON.stringify(temp);
                    tempobject["_"] = Math.round(new Date() / 1000);

                    $http({
                        method: 'GET',
                        url: self.baseUrl + '/mobileshortmessage/combo.php',
                        params: tempobject,
                        cache: false
                    }).success(function (data) {
                        d.resolve(data[opt].data);
                    }).error(function (err) {
                        d.reject(data.msg);
                    });
                    return d.promise;
                }
            }
        }
    })

    .config(function (StockProvider) {
        StockProvider.setBaseUrl('http://vaserviece.10jqka.com.cn');
    })

    .controller('MainCtrl', function ($scope, $timeout, Stock) {
        // Build the date object
        $scope.date = {};

        // Update function
        var updateTime = function () {
            $scope.date.raw = new Date();
            $timeout(updateTime, 1000);
        };

        $scope.stock = {};
        var reloadData = function(){
            Stock.getStockInfo("getWPJQBStockList", {today: 1})
                .then(function (data) {
                    $scope.stock.info = data;
                    console.log("here");
                    $timeout(reloadData, 5000);
                });

        };


        // stockInfoFactory.getInfo(flag).then(function success(response) {
        //     $scope.info = response.data;
        // }, handleError);

        function handleError(response) {
            console.log('Error:' + response.data);
        }

        $scope.OrderByTime = function (item) {
            var parts = item.data['.ctime'].split(':');
            var num = parts[0] * 60 + parts[1];
            return num;
        }

        // Kick off the update function
        updateTime();
        reloadData();
    });