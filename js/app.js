angular.module('myApp', ['toggle-switch'])
    .provider('Stock', function () {
        var baseUrl = {};

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
                        url: self.baseUrl.query + '/mobileshortmessage/combo.php',
                        params: tempobject,
                        cache: false
                    }).success(function (data) {
                        d.resolve(data[opt]);
                    }).error(function (err) {
                        d.reject(err);
                    });
                    return d.promise;
                },
                login: function(){
                    var d = $q.defer();
                    $http({
                        method: 'GET',
                        url: self.baseUrl.login + '/api/index.php',
                        params: {},
                        cache: false
                    }).success(function(data){
                        d.resolve(data)
                    }).error(function(err){
                        d.reject(err)
                    });
                    return d.promise;
                },
                doCookie:function(){
                    var d = $q.defer();
                    $http({
                        method: 'GET',
                        url: self.baseUrl.cookie + '/docookie.php',
                        params: {},
                        cache: false
                    }).success(function(data){
                        d.resolve(data)
                    }).error(function(err){
                        d.reject(err)
                    });
                    return d.promise;
                }
            }
        }
    })

    .config(function (StockProvider) {
        StockProvider.setBaseUrl({
            login:'http://adm.10jqka.com.cn',
            cookie:'http://www.10jqka.com.cn',
            query:'http://vaserviece.10jqka.com.cn'
        });
    })

    .controller('MainCtrl', function ($scope, $timeout, Stock) {
        // Build the date object
        $scope.date = {};

        // Update function
        var updateTime = function () {
            $scope.date.raw = new Date();
            $timeout(updateTime, 1000);
        };

        var _stock = $scope.stock = {};
        var _queryData = $scope.queryData = {};
        var queryCache = [];
        $scope.runLoad = false;
        $scope.startQuery = true;

        var reloadData = function(){
           if($scope.runLoad){
               Stock.getStockInfo("getWPJQBStockList", {today: 1})
                   .then(function (data) {
                       $scope.queryData = data.data;
                       $scope.stock.info = data.data;
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

        var queryData = function(cache){
            if($scope.queryData){
                // 若数据源有更新，则需要刷新缓存
                if(cache !== {}) {
                    angular.forEach($scope.queryData, function (data) {
                        queryCache.push(data.attr.stockcode);
                    });
                }

                Stock.getStockInfo("getQuote", queryCache)
                    .then(function (result) {
                        for(var key in result){
                            if(result.hasOwnProperty(key)){
                                if(_stock.info[key]){
                                    _stock.info[key] = result[key];
                                }else {
                                    angular.forEach(_stock.info, function (data) {
                                        if (data.attr.stockcode === key) {
                                            data[key] = result[key];
                                        }
                                    });
                                }
                            }
                        }
                        console.log(result);
                        //angular.forEach(result,function(data){
                        //    console.log(data);
                        //});
                        //$scope.timer = $timeout(reloadData, 7500);
                    });
            }
        }


        $scope.$watch('runLoad',reloadData);
        $scope.$watch('queryData',queryData,true);


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