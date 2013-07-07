"use strict";angular.module("vnbidding.github.ioApp",["firebase","ui.bootstrap"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl"}).when("/user",{templateUrl:"views/user.html",controller:"UserCtrl"}).otherwise({redirectTo:"/"})}]),angular.module("vnbidding.github.ioApp").controller("MainCtrl",["$scope","auth","models",function(a,b,c){a.auctions=c.Auction.get(),a.done=function(){return a.auctions.filter(a.checkDone)},a.ongoing=function(){return a.auctions.filter(a.checkDone,!0)},a.createAuction=function(){var b=new c.Auction(a.newAuction);b.create(),a.newAuction=null,a.page=0},a.nextPage=function(){a.page++},a.goBack=function(){a.page--,a.page<0&&(a.page=0)},a.checkDone=function(a){return a.isDone()}}]),angular.module("vnbidding.github.ioApp").controller("UserCtrl",["$scope","auth","$rootScope","safeApply","angularFireCollection",function(a,b,c,d){a.login=function(a,c){b.login(a,c)},a.logout=function(){b.logout(),d(a)},a.bid=function(){var b=a.item.price,c=a.item.name;a.bids.add({user:a.user.username,price:b,name:c})}}]),angular.module("vnbidding.github.ioApp").factory("auth",["$rootScope","safeApply",function(a,b){var c=new Firebase("https://bidding.firebaseio.com"),d=new FirebaseAuthClient(c,function(b,c){c?a.$emit("login",c):b?a.$emit("loginError",b):a.$emit("logout")});return a.$on("login",function(c,d){a.user=d,"password"==d.provider&&(d.username=d.name=d.email),b(a)}),a.$on("logout",function(){delete a.user,b(a)}),a.auth={login:function(a,b){d.login(a,b)},logout:function(){d.logout()},loginError:function(a){alert(a)}}}]),angular.module("vnbidding.github.ioApp").factory("safeApply",["$rootScope",function(a){return function(b,c){angular.isFunction(b)&&(c=b,b=a),b=b||a,b.$debouncedApply=_.debounce(function(a){a?b.$apply(a):b.$apply()},0);var d=b.$root.$$phase;"$apply"==d||"$digest"==d?c&&b.$eval(c):b.$debouncedApply(c)}}]),angular.module("vnbidding.github.ioApp").factory("models",["safeApply","biddingConfig","Collection","$rootScope",function(a,b,c,d){function e(c){function d(){a(function(){var a=Date.now()+b.serverValues.timeOffset,c=e.endTime,f=c-a,g=new Date(f),h=~~(f/36e5),i=g.getMinutes(),j=g.getSeconds();return 15e3>f?e.timeLeft="?ã xong":0>f?e.timeLeft="V?a xong":h>36?(setTimeout(d,36e5),e.timeLeft=~~(h/24)+" ngày"):h>1?(setTimeout(d,6e4),e.timeLeft=h+" tiếng"):i>=10?(setTimeout(d,1e3),e.timeLeft="0:"+i+":"+j):(j=10>j?"0"+j:j,setTimeout(d,1e3),e.timeLeft="0:0"+i+":"+j)})}_.extend(this,c),this.timeLeft="";var e=this;d()}var f=c(b.refUrls.auctions,e),g=c(b.refUrls.products);return e.prototype={toObject:function(){var a={};return angular.forEach(this,function(b,c){0===c.indexOf("$")||".priority"===c||b._collection||(a[c]=b)}),angular.fromJson(angular.toJson(a))},_getBidCollection:function(){return c(b.refUrls.auctions+"/"+this.$id+"/bids")},addBid:function(a){var b=this._getBidCollection();return b.add(a)},getBids:function(){var a=this._getBidCollection();return a._collection},create:function(){var a=this,b=a.product;if(!b)throw"Product should not be NULL";a.endTime=new Date(a.endTime).getTime(),a.creator={id:d.user.id,email:d.user.email,username:d.user.username},a.startTime&&(a.startTime=new Date(a.startTime).getTime()),f.add(a,{createdTime:"TIMESTAMP"}).then(function(b){a.startTime||(a.startTime=a.createdTime),b.ref.setWithPriority(a.toObject(),-1*a.createdTime)}),g.add(b)},bid:function(a){var c,e=this;a||(a=e.minStep),c={inc:a,createdTime:Date.now()+b.serverValues.timeOffset,user:{id:d.user.id,username:d.user.username,name:d.user.name}},e.addBid(c)},getCurrentPrice:function(){var a=this.getBids();return _.reduce(a,function(a,b){return a+=b.inc},0)+this.initPrice},getTopBidder:function(){var a=this.getBids(),b=_.sortBy(a,function(a){return-1*a.createdTime});return b[0]?b[0].user:{}},getTimeLeft:function(){return this.timeLeft},isDone:function(){var a=Date.now()+b.serverValues.timeOffset,c=this.endTime;return a>c}},e.get=function(){return f},{Auction:e}}]),angular.module("vnbidding.github.ioApp").factory("Collection",["safeApply","$q",function(a,b){function c(b,c){function d(){var a=_.sortBy(f._collection,function(a){return a[".priority"]});f._collection=a}function e(a){return _.find(f._collection,function(b){return b.$id==a})}var f=this;this._collection=[],this._ctor=c||function(a){angular.extend(this,a)},"string"==typeof b&&(b=new Firebase(b)),this._ref=b,this.findById=e,b.on("child_added",function(b){a(function(){var a=b.val(),c=b.getPriority(),g=b.name(),h=b.ref(),i=e(g);i||(i=new f._ctor(a),f._collection.push(i)),i[".priority"]=c,i.$id=g,i.$ref=h,d()})}),b.on("child_changed",function(b){a(function(){var a=b.name(),c=b.getPriority(),d=e(a);_.extend(d,b.val()),d[".priority"]=c})}),b.on("child_moved",function(b){a(function(){var a=b.name(),c=b.getPriority(),f=e(a);b.val(),f[".priority"]=c,d()})}),b.on("child_removed",function(b){a(function(){var a=b.name(),c=_.without(f._collection,e(a));f._collection=c})})}var d={};return c.prototype={add:function(a,c,d){var e=this._ref,f=b.defer(),g=f.promise;isNaN(c)||(d=c,c={});var h=angular.fromJson(angular.toJson(a));angular.forEach(c,function(a,b){h[b]=Firebase.ServerValue[a]});var i=e.push(h);return a.$id=i.name(),isNaN(d)||i.setPriority(d),i.once("value",function(b){angular.extend(a,b.val()),f.resolve({snapshot:b,ref:i})}),g},update:function(a){var c="string"==typeof a?a:a.$id,d=this.findById(c),e=d.toObject(),f=b.defer(),g=f.promise;return d.$ref.update(e),d.$ref.once("value",function(a){f.resolve({snapshot:a,ref:d.$ref})}),g},all:function(){return this._collection},filter:function(a,b){return b===!0?_.reject(this._collection,a):_.filter(this._collection,a)}},function(a,b){return d[a]?d[a]:d[a]=new c(a,b)}}]),angular.module("vnbidding.github.ioApp").factory("biddingConfig",["safeApply",function(a){var b={refUrls:{clockSkew:"https://bidding.firebaseio.com/.info/serverTimeOffset",auctions:"https://bidding.firebaseio.com/auctions",users:"https://bidding.firebaseio.com/users",products:"https://bidding.firebaseio.com/products"},serverValues:{}},c=new Firebase(b.refUrls.clockSkew);return c.on("value",function(c){var d=c.val();b.serverValues.timeOffset=d,a()}),b}]);
