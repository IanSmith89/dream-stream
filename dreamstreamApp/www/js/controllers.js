'use strict';
angular.module('dreamstreamApp.controllers', [])

.controller('HomeCtrl', function() {})

.controller('StreamCtrl', function($scope, Dreams) {
  var vm = this;
  vm.loadDreams = Dreams.all()
    .then(function(dreamsArr) {
      console.log(dreamsArr);
      vm.dreams = dreamsArr.data;
    })
    .catch(function(err) {
      console.err(new Error(err));
    });
})

.controller('NewCtrl', function($scope, $state, newDreamService, $cordovaMedia) {
  var vm = this;
  vm.addNewDream = addNewDream;

  var src = "voiceRecord.wav";
  var media = $cordovaMedia.newMedia(src);
  //console.log(media);
  vm.record = function(){
    media.startRecord();
    console.log('clicky');
    //console.log(media);
  };
  vm.stop = function(){
    media.stopRecord();
  };
  vm.play = function(){
    media.play({
      numberOfLoops: 2,
      playAudioWhenScreenIsLocked: false
    });
  };

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

  function signin(user) {
    signinService.signin(user).then(function(response) {
      // console.log(response);
      localStorage.setItem('Authorization', 'Bearer ' + response.data.token);
      $location.path('/tab/new');
    });
  }

  function signup(user) {
    signupService.signup(user).then(function(response) {
      console.log(response);
    });
  }
})

.controller('DataCtrl', function($scope, DreamWordsService, DreamParser, Dreams, Filters) {
  var vm = this;
  Dreams.all()
    .then(function(dreamsArr) {
      Filters.all().then(function(filters) {
        // console.log(filters);
        var data = dreamsArr.data;
        var str = '';
        for (var i = 0; i < data.length; i++) {
          str += ' ' + data[i].content;
        }
        var input = DreamParser.parse(str);

        for (var i = 0; i < input.length; i++) {
          for (var j = 0; j < filters.data.length; j++) {
            // console.log(input[i] + " ---> " + filters.data[j].phrase);
            if (input[i] === filters.data[j].phrase.toLowerCase()) {
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

});
