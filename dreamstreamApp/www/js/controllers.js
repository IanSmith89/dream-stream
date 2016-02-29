'use strict';
angular.module('dreamstreamApp.controllers', [])

.controller('HomeCtrl', function() {})

.controller('StreamCtrl', function($scope, Dreams) {
  var vm = this;
  vm.loadDreams = Dreams.all()
    .then(function(dreamsArr) {
      vm.dreams = dreamsArr.data;
    })
    .catch(function(err) {
      console.err(new Error(err));
    });
})

.controller('NewCtrl', function($scope, $state, newDreamService) {
  var vm = this;
  vm.addNewDream = addNewDream;

  // var src = "voiceRecord.wav";
  // var media = $cordovaMedia.newMedia(src);
  // //console.log(media);
  // vm.record = function(){
  //   media.startRecord();
  //   console.log('clicky');
  //   //console.log(media);
  // };
  // vm.stop = function(){
  //   media.stopRecord();
  // };
  // vm.play = function(){
  //   media.play({
  //     numberOfLoops: 2,
  //     playAudioWhenScreenIsLocked: false
  // });
  // };

  function addNewDream(dream) {
    newDreamService.addNewDream(dream)
      .then(function(response) {
        $state.go('tab.stream', {}, {
          reload: true
        });
        // $location.path('/tab/stream');
      });
  }
})

.controller('AccountCtrl', function($scope, $location, signinService, signupService) {
  var vm = this;
  vm.signin = signin;
  vm.signup = signup;
  vm.signout = signout;

  function signin(user) {
    signinService.signin(user).then(function(response) {
      // console.log(response);
      localStorage.setItem('Authorization', 'Bearer ' + response.data.token);
      $location.path('/tab/stream');
    });
  }

  function signup(user) {
    var vm = this;
    this.regex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

    signupService.signup(user).then(function(response) {
      console.log(response);
      $location.path('/tab/account');
    });
  }

  function signout() {
    localStorage.setItem('Authorization', null);
    $location.path('/tab/new');
  }
})

.controller('DataCtrl', function($scope, $state, dreamAnalysisChart, highchartsNG, DreamAnalysis,DreamWordsService, scatterService, DreamParser, Dreams, Filters, CustomFilters) {

  var vm = this;

  vm.pageReload = function()
  {
    $state.go($state.current, {}, {reload:true});
  };

  vm.getAnalysis = function()
  {
    return dreamAnalysisChart;
  };

  Dreams.all()
    .then(function(dreamsArr, data) {
      // pieChartService.showPie(dreamsArr.data);
      scatterService.show(dreamsArr.data);

      //GETTING DREAM COUNT
      vm.dreamCount = dreamsArr.data.length;

      //GETTING AVERAGE MOOD
      var moodCount = 0;
      var moodData = [
        {
          label: 1,
          color: 'red',
          value: 0
        },
        {
          label: 2,
          color: 'blue',
          value: 0
        },
        {
          label: 3,
          color: 'yellow',
          value: 0
        },
        {
          label: 4,
          color: 'green',
          value: 0
        },
        {
          label: 5,
          color: 'purple',
          value: 0
        },
      ];
      for (var i = 0; i < dreamsArr.data.length; i++) {
        moodCount += dreamsArr.data[i].mood;
        for (var j = 0; j < moodData.length; j++) {
          if (dreamsArr.data[i].mood === moodData[j].label) {
            moodData[j].value++;
            // console.log(moodData[j].value)
          }
        }
      }
      // console.log(moodData);
      vm.averageMood = (moodCount / dreamsArr.data.length).toFixed(2);

      //GETTING AVERAGE RATING
      var ratingCount = 0;
      for (var i = 0; i < dreamsArr.data.length; i++) {
        ratingCount += dreamsArr.data[i].rating;
      }
      vm.averageRating = (ratingCount / dreamsArr.data.length).toFixed(2);

      // //MOOD PIE CHART
      //
      // var svg = d3.select("body").append("svg").attr("width", 375).attr("height", 375);
      //
      // svg.append("g").attr("id","moodpie");
      //
      // pieChartService.draw("moodpie", moodData, 162.5, 162.5, 100);

      // function changeData(){
      // 	gradPie.transition("moodpie", randomData(), 160);
      // }

      //CUSTOM FILTER
      vm.submitFilter = CustomFilters.add;
      vm.filterList = CustomFilters.get;
      // console.log(vm.filterList);
      //WORD CLOUD
      Filters.all().then(function(filters) {
        // console.log(filters);
        var data = dreamsArr.data;
        var str = '';
        for (var i = 0; i < data.length; i++) {
          str += ' ' + data[i].content;
        }
        var input = DreamParser.parse(str);
        // console.log(input);
        for (var i = 0; i < input.length; i++) {
          for (var j = 0; j < filters.data.length; j++) {
            // console.log(filters.data[j].phrase + " -----> " + input[i]);
            if ((filters.data[j].phrase !== null) && (input[i] === filters.data[j].phrase.toLowerCase())) {
              input.splice(i, 1);
              i--;
            }
          }
        }
        DreamWordsService.draw(input);
      });

    })
    .catch(function(err) {
      console.err(new Error(err));
    });
})

.controller('TabCtrl', ['$scope', '$state', '$ionicTabsDelegate', TabCtrl]);

function TabCtrl($scope, $state, $ionicTabsDelegate) {
  var vm = this;
  vm.state = '';
  $scope.$on('$ionicView.loaded', function(viewInfo, state) {
    vm.state = state;
  });
}
