'use strict';

angular.module('vnbidding.github.ioApp')
  .controller('MainCtrl', function ($scope, auth, $rootScope, safeApply, angularFireCollection) {

    var bidsUrl = 'https://bidding.firebaseio.com/bids';

    //Get top 10 bids
    $scope.bids = angularFireCollection(new Firebase(bidsUrl).limit(5));

    //Get current auction
    $scope.auction = {
      id: 1,
      name: 'HTC One X+',
      image: 'http://images.anandtech.com/doci/6348/HTC%20One%20X%20Global%20Front%20and%20Back2_575px.jpg',
      description: 'Đấu giá điện thoại của NguyenNB',
      topPrice: 1000,
      startTime: new Date(2013, 6, 26).getTime(),
      endTime: new Date(2013, 7, 1).getTime()
    };

    $scope.price = Math.floor(Math.random() * 1500);

    //Action bid
    $scope.bid = function () {

      var user = {userId: $scope.user.id, name: $scope.user.name, username: $scope.user.username},
        price = $scope.price,
        auctionId = $scope.auction.id;

      //Add bid to Firebase
      $scope.bids.add({
        user: user,
        auction: {auctionId: auctionId},
        bidPrice: price,
        bidTime: Firebase.ServerValue.TIMESTAMP
      });
    };

    //Bid login auth
    $rootScope.$on("login", function (event, user) {
      $scope.user = user;
      safeApply($scope);
    });
  });