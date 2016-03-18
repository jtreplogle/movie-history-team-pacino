"use strict";

MovieApp.controller("MyMoviesCtrl", [
  "$scope",
  "$location",
  "MovieStorage",

  function ($scope, $location, MovieStorage) {
    console.log("RUNNING MYMOVIESCTRL");
    // $scope.movies = [];

    $('#modal1').openModal();
    $('ul.tabs').tabs();

    // // Invoke the promise that reads from Firebase
    // MovieStorage().then(
    //   // Handle resolve() from the promise
    //   movieCollection => Object.keys(movieCollection).forEach(key => {
    //     movieCollection[key].id = key;
    //     $scope.movies.push(movieCollection[key]);
    //     // console.log(movieCollection[key]);
    //   }),
    //   // Handle reject() from the promise
    //   err => console.log(err)
    // );

  }
]);