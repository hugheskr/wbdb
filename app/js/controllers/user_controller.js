const { angular } = window;

module.exports = function(app) {
  app.controller('UserController', ['$scope', '$http', 'Resource',
    '$stateParams', 'user', 'auth', '$location', '$timeout',
   ($scope, $http, Resource, $stateParams, user, auth, $location, $timeout) => {

      $scope.tags = [{ tag: 'Arrays' }, { tag: 'Strings' },
        { tag: 'Trees' }, { tag: 'Queues' },
        { tag: 'Hash Tables' }, { tag: 'Recursion' },
        { tag: 'Stacks' }, { tag: 'Binary Trees' },
        { tag: 'Linked Lists' }];
      $scope.mySolutions = [];
      $scope.myChallenges = [];
      $scope.favorites = [];
      $scope.newChallenge = {};
      $scope.newSolution = '';

      $scope.challengeService = new Resource('/challenges');
      $scope.favoriteService = new Resource('/favorites');
      $scope.solutionService = new Resource('/solutions');

      $scope.submitChallenge = function() {
        var currentDate = new Date();
        var options = {
          weekday: 'long', year: 'numeric', month: 'short',
          day: 'numeric', hour: '2-digit', minute: '2-digit'
        };
        $scope.newChallenge.createdOn =
          currentDate.toLocaleTimeString('en-us', options);

        var copiedChallenge = angular.copy($scope.newChallenge);
        if (!copiedChallenge.tags) {
          copiedChallenge.tags = [{ tag: 'None' }];
        }
        copiedChallenge.tags = copiedChallenge.tags.map((tag) => tag.tag);
        copiedChallenge.userId = auth.getUserId();

        user.getUser((err, res) => {
          if (err) return console.log(err);
          copiedChallenge.author = res.username;
          console.log(copiedChallenge);
          $scope.challengeService.create(copiedChallenge, (err, res) => {
            if (err) return console.log(err);

            if ($scope.newSolution !== '') {
              $scope.solutionService.create({
                solution: $scope.newSolution,
                challengeId: res._id,
                userId: auth.getUserId(),
                author: copiedChallenge.author,
                published: false,
                createdOn: copiedChallenge.createdOn
              }, (err, res) => {
                  if (err) return console.log(err);
                  $scope.mySolutions.push(res);
              });
            }
            $scope.newChallenge = null;
            //see if this clears the text box
            $scope.newSolution = null;
            $scope.myChallenges.push(res);
          });
        });
      };

      $scope.favoriteService.getAll((err, res) => {
        if (err) {
          if (err.statusText === 'Unauthorized') {
          //   $scope.$apply(function() {
          //      $location.path('/auth');
          //  });
          $timeout(() => {
              $location.path('/auth');
          });


            return console.log('err /api/favorites');
          }
        }
        $scope.favorites = res;
      });

      $scope.getUserChallenges = function() {
        $http.get(__BASEURL__ + '/api/mychallenges')
          .then((res) => {
            $scope.myChallenges = res.data;
          }, (err) => {
            if (err.statusText === 'Unauthorized') {
            $timeout(() => {
                $location.path('/auth');
            });

              return console.log('err /api/mychallenges');
            }
        });
      };

      $scope.getUserSolutions = function() {
        console.log("inside user Solutions")
        $http.get(__BASEURL__ + '/api/mysolutions')
          .then((res) => {
            $scope.mySolutions = res.data;
          }, (err) => {
            if (err.statusText === 'Unauthorized') {
            $timeout(() => {
                $location.path('/auth');
            });

              return console.log('err /api/mysolutions');
            }
        });
      };
  }]);
};
