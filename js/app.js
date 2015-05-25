angular.module('myApp', ['toggle-switch'])
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
                        d.resolve(data[opt]);
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

        var stock = $scope.stock = {};
        var queryCache = [];
        $scope.runLoad = true;
        $scope.startQuery = true;

        var reloadData = function(){
           if($scope.runLoad){
               Stock.getStockInfo("getWPJQBStockList", {today: 1})
                   .then(function (data) {
                       $scope.stock.info = data.data;
                       console.log("here");
                       //$scope.timer = $timeout(reloadData, 7500);
                   });

           }
           else{
               if($scope.timer)
               {
                   $timeout.cancel($scope.timer);
                   $scope.stock = {};
               }
           }

        };

        var queryData = function(){
            if(stock.info){
                angular.forEach(stock.info,function(data){
                    queryCache.push(data.attr.stockcode);
                })
                Stock.getStockInfo("getQuote", queryCache)
                    .then(function (result) {
                        console.log(result);
                        //angular.forEach(result,function(data){
                        //    console.log(data);
                        //});
                        //$scope.timer = $timeout(reloadData, 7500);
                    });
            }
        }


        $scope.$watch('runLoad',reloadData);
        $scope.$watch('stock.info',queryData,true);


        function handleError(response) {
            console.log('Error:' + response.data);
        }

        $scope.OrderByTime = function (item) {
            var parts = item.data['.ctime'].split(':');
            return parts[0] * 60 + parts[1];
        };

        // Kick off the update function
        updateTime();
    });