'use strict';

// declare/title the angular module, brackets declare the route (configured below in the MovieApp.config statement)
// the initial dependency ngRoute is provided by the angular-route library (linked in html separately).
// same thing applies to the $routeProvider word. these enable routing for views, not in vanilla angular
let MovieApp = angular.module("MovieApp", ['ngRoute', 'firebase'])
  // define my personal firebase URL as a constant to be referenced later as firebaseURL
  .constant('firebaseURL', "https://pizzapaperairplane.firebaseio.com/");

/*
  Define a promise for any view that needs an authenticated user
  before it will resolve (see below)
 */
let isAuth = (authFactory) => new Promise((resolve, reject) => {
  if (authFactory.isAuthenticated()) {
    console.log("User is authenticated, resolve route promise");
    resolve();
  } else {
    console.log("User is not authenticated, reject route promise");
    reject();
  }
});


// determine which partial (html snippet) is displayed in the view (ng-view hardcoded into original html file)
// "resolve" property allows routing only if the boolean is true (isAuth is boolean)
MovieApp.config(["$routeProvider",
  function ($routeProvider) {
    $routeProvider.
      when("/list", {
        templateUrl: "partials/my-movies-list.html",
        controller: "MyMoviesCtrl"
      }).
      when("/login", {
        templateUrl: "partials/login.html",
        controller: "LoginCtrl"
      }).
      when("/logout", {
        templateUrl: "partials/login.html",
        controller: "LoginCtrl"
      }).
      when("/search", {
        templateUrl: "partials/search.html",
        controller: "SearchCtrl"
      }).
      otherwise({
        redirectTo: "/login"
      });
  }]);

// "run" method on the angular app module, allows determining initial page functionality
MovieApp.run([
  "$location",
  "firebaseURL",

  function ($location, firebaseURL) {
    let myFirebase = new Firebase(firebaseURL);

    myFirebase.onAuth(authData => {
      if (!authData) {
        $location.path("/login");
      }
    });
  }
]);
