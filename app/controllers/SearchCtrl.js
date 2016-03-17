"use strict";

MovieApp.controller("SearchCtrl",
[
  "$scope",
  "$location",
  "$http",
  "$compile",
  "firebaseURL",


  function ($scope, $location, $http, $compile, firebaseURL) {

    $scope.search = "";
    $scope.omdbResultArr = [];

    $scope.searchMovie = function() {
      $("#showPostersHere").html("");  // clear poster display area

      $http.get("http://www.omdbapi.com/?s=" + $scope.search + "&page=1")
      .then(function(response){ 
        $scope.omdbResultArr = response.data.Search;  // returns array of up to 10 items
        console.log("omdbResultArr",$scope.omdbResultArr);
        $scope.omdbResultArr.forEach(function(currItem,idx) {
          $http.get("http://www.omdbapi.com/?i=" + currItem.imdbID)
          .then(function(response) {
            $scope.omdbResultArr[idx].Actors = response.data.Actors;
            if (response.data.Poster.indexOf("http") >= 0) {  // valid URL for poster?
              $scope.omdbResultArr[idx].Poster = response.data.Poster;
            } else {
              $scope.omdbResultArr[idx].Poster = "http://warnerwirelessusa.com/wp-content/uploads/2015/03/image-not-available-master.jpg";
            }
          }); // end then
        });  //end forEach
        $http.get(`${firebaseURL}/movies/.json`)
        .then(function(response) {
          console.log("response from Firebase",response.data);  // FB returns object of objects
          $scope.firebaseResultArr = [];  // clear each time Search is initiated
          // convert object of objects into array of objects
          for (let key in response.data) {
            response.data[key].id = key;
            $scope.firebaseResultArr.push(response.data[key]);  // in final version, filter by search term
          }
          console.log("got from OMDB:", $scope.omdbResultArr);
          console.log("got from Firebase:",$scope.firebaseResultArr);

          $scope.omnibusArr = $scope.omdbResultArr.concat($scope.firebaseResultArr);

          var posterStr = "";
          for (let i = 0; i < $scope.omnibusArr.length; i++) {
            if ($scope.omnibusArr[i].Poster) {
              // this item was loaded from OMDB
              posterStr += `<div class="movieBox"><img src=${$scope.omnibusArr[i].Poster}>`
              $scope.omnibusArr[i].tracking = false;
              $scope.omnibusArr[i].watched = false;
            } else {
              // this item was loaded from Firebase
              posterStr += `<div class="movieBox"><img src=${$scope.omnibusArr[i].posterURL}>`
              $scope.omnibusArr[i].tracking = true;
            }
            if ($scope.omnibusArr[i].watched) {
              posterStr += `<p>${$scope.omnibusArr[i].rating} stars</p></div>`;
            } else if ($scope.omnibusArr[i].tracking && !$scope.omnibusArr[i].watched) {
              posterStr += `<button ng-click="addToWatched(${i})">Rate It</button></div>`; // send omnibus index as arg
            } else if (!$scope.omnibusArr[i].tracking && !$scope.omnibusArr[i].watched) {
              posterStr += `<button ng-click="addMovie(${i})">Add to Tracking</button></div>`; // send omnibus index as arg
            } else {
              posterStr += "<p>???</p></div>"
            }
          }  // end for
          $("#showPostersHere").html($compile(posterStr)($scope));  // use $compile to bind dynamically generated content
        });  // end then
      });  // end then
    };  // end function searchMovie()



    $scope.addToWatched = function(idx) {
      console.log("patching ",`${firebaseURL}/movies/${$scope.omnibusArr[idx].id}.json`);
      var rating = 5; // hard-coded rating, for testing
      $http.patch(
        `${firebaseURL}/movies/${$scope.omnibusArr[idx].id}.json`,
        JSON.stringify({watched: true, rating: rating})
      )
      .then(
        () => console.log("patched"),      // Handle resolve
        (response) => console.log(response)  // Handle reject
      );
    };

    $scope.addMovie = function(idx) {  // add this movie to the Firebase DB (i.e. track this movie)
      console.log("adding to Firebase:",$scope.omnibusArr[idx].Title);

      // POST this movie to firebase and add the user's ID as a property
      $http.post(
        // "https://nss-demo-instructor.firebaseio.com/songs.json", //***original line***//
        // POST obj to firebase
        `${firebaseURL}/movies.json`, // new line

        // Remember to stringify objects/arrays before
        // sending them to an API
        JSON.stringify({
          name: $scope.omnibusArr[idx].Title,
          year: $scope.omnibusArr[idx].Year,
          actors: $scope.omnibusArr[idx].Actors,
          user: {},
          posterURL: $scope.omnibusArr[idx].Poster,
          rating: 0,
          watched: false,
        })

      // The $http.post() method returns a promise, so you can use then()
      ).then(
        () => console.log("added"),      // Handle resolve
        (response) => console.log(response)  // Handle reject
      );
    };

  }
  
]);
