"use strict";

MovieApp.controller("SearchCtrl",
[
  "$scope",
  "$location",
  "$http",
  "firebaseURL",


  function ($scope, $location, $http, firebaseURL) {

    $scope.search = "";
    $scope.omdbResultArr = [];
    $scope.firebaseResultArr = [];

    $scope.searchMovie = function() {

      $http.get("http://www.omdbapi.com/?t=" + $scope.search + "&y=&plot=short&r=json&page=1")
      .then(function(response){ 
        $scope.omdbResultArr = response.data;
        $http({
          url: firebaseURL + "/movies/.json",
          method: "GET"
        })
        .then(function(response) {
          for (let key in response.data) {
            response.data[key].id = key;
            $scope.firebaseResultArr.push(response.data[key]);
          }
          console.log("got from OMDB:", $scope.omdbResultArr);
          console.log("got from Firebase:",$scope.firebaseResultArr);
          $scope.omnibusArr = [$scope.omdbResultArr].concat($scope.firebaseResultArr);
          var posterStr = "";
          for (let i = 0; i < $scope.omnibusArr.length; i++) {
            if ($scope.omnibusArr[i].Poster) {
              posterStr += `<div class="movieBox"><img src=${$scope.omnibusArr[i].Poster}></div>`
            } else {
              posterStr += `<div class="movieBox"><img src=${$scope.omnibusArr[i].posterURL}></div>`
            }
          }
          $("#showPostersHere").html(posterStr);
        });
      });
    };

    $scope.addMovie = function () {
      console.log("searchResultObj.Title", $scope.searchResultObj.Title);

      // POST this movie to firebase and add the user's ID as a property
      $http.post(
        // "https://nss-demo-instructor.firebaseio.com/songs.json", //***original line***//
        // POST obj to firebase
        `${firebaseURL}/movies.json`, // new line

        // Remember to stringify objects/arrays before
        // sending them to an API
        JSON.stringify({
          title: searchResultObj.Title,
          year: searchResultObj.Year,
          actors: searchResultObj.Actors,
          rating: 0,
          watched: false
        })

      // The $http.post() method returns a promise, so you can use then()
      ).then(
        () => console.log("added"),      // Handle resolve
        (response) => console.log(response)  // Handle reject
      );
    };

  }
  
]);
