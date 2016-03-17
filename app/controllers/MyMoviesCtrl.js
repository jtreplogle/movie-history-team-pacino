"use strict";

MovieApp.controller("MyMoviesCtrl", [
  "$scope",
  "$location",
  "MovieStorage",

  function ($scope, $location, MovieStorage) {
    // Default property values for keys bound to input fields
    // $scope.songSearchText = {name: "", artist: "", album: ""};
    // $scope.query = "";
    $scope.movies = [];

    // Invoke the promise that reads from Firebase
    MovieStorage().then(
      // Handle resolve() from the promise
      movieCollection => Object.keys(movieCollection).forEach(key => {
        movieCollection[key].id = key;
        $scope.movies.push(movieCollection[key]);
        console.log(movieCollection[key]);
      }),
      // Handle reject() from the promise
      err => console.log(err)
    );

  }
]);