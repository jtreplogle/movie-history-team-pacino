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
console.log("omdbResultArr>>>",$scope.omdbResultArr);
        for (var j = 0; j < $scope.omdbResultArr.length; j++) {
          (function(j) {  // have to put asynchronous stuff in closure
            var getStr = "http://www.omdbapi.com/?i=" + $scope.omdbResultArr[j].imdbID;
            $http.get(getStr)
            .then(function(response) {
              // PROBLEM:
              // how to use loop variable j
              // within a THEN?
              // by the time the promise resolves, j = 10.
                console.log("j>>>  ",j);
              $scope.omdbResultArr[j].Actors = response.data.Actors;
              // use imdbID as id
              $scope.omdbResultArr[j].id = response.data.imdbID;
              if (response.data.Poster.indexOf("http") >= 0) {  // valid URL for poster?
                $scope.omdbResultArr[j].Poster = response.data.Poster;
              } else {
                $scope.omdbResultArr[j].Poster = "image-not-available.jpg";
              }
            }); // end then
          })(j); // end closure
        };  //end for
        $http.get(`${firebaseURL}/movies/.json`)
        .then(function(response) {
          //console.log("response from Firebase",response.data);  // FB returns object of objects
          $scope.firebaseResultArr = [];  // clear each time Search is initiated
          // convert object of objects into array of objects
          for (let key in response.data) {
            response.data[key].id = key;
            $scope.firebaseResultArr.push(response.data[key]);  // in final version, filter by search term
          }
          //console.log("got from OMDB:", $scope.omdbResultArr);
          //console.log("got from Firebase:",$scope.firebaseResultArr);

          $scope.omnibusArr = $scope.omdbResultArr.concat($scope.firebaseResultArr);
console.log("0>>>>",$scope.omnibusArr[0].id);
console.log("1>>>>",$scope.omnibusArr[1].id);
console.log("2>>>>",$scope.omnibusArr[2].id);
console.log("3>>>>",$scope.omnibusArr[3].id);
console.log("4>>>>",$scope.omnibusArr[4].id);
console.log("5>>>>",$scope.omnibusArr[5].id);
console.log("6>>>>",$scope.omnibusArr[6].id);
console.log("7>>>>",$scope.omnibusArr[7].id);
console.log("8>>>>",$scope.omnibusArr[8].id);
console.log("9>>>>",$scope.omnibusArr[9].id);
          //console.log(">>>>>>OMNIBUSARR[2].id>>>>",$scope.omnibusArr[2].id);
          var posterStr = "";
          for (let i = 0; i < $scope.omnibusArr.length; i++) {
            if ($scope.omnibusArr[i].Poster) {
              // this item was loaded from OMDB
              posterStr += `<div class="movieBox" id='movieBox-${$scope.omnibusArr[i].id}'><img src=${$scope.omnibusArr[i].Poster}>`;
              $scope.omnibusArr[i].tracking = false;
              $scope.omnibusArr[i].watched = false;
            } else {
              // this item was loaded from Firebase
              posterStr += `<div class="movieBox" id='movieBox-${$scope.omnibusArr[i].id}'><img src=${$scope.omnibusArr[i].posterURL}>`;
              $scope.omnibusArr[i].tracking = true;
            }
            if ($scope.omnibusArr[i].watched) {
              posterStr += `<p>${$scope.omnibusArr[i].rating} stars</p></div>`;
            } else if ($scope.omnibusArr[i].tracking && !$scope.omnibusArr[i].watched) {
              posterStr += `<button id='button-${$scope.omnibusArr[i].id}' ng-click="addToWatched(${i})">Rate It</button></div>`; // send omnibus index as arg
            } else if (!$scope.omnibusArr[i].tracking && !$scope.omnibusArr[i].watched) {
console.log(">>>>",$scope.omnibusArr[i].id);
              posterStr += `<button id='button-${$scope.omnibusArr[i].id}' ng-click="addMovie(${i})">Add to Tracking</button></div>`; // send omnibus index as arg
            } else {
              posterStr += "<p>???</p></div>"
            }
          }  // end for
          $("#showPostersHere").html($compile(posterStr)($scope));  // use $compile to bind dynamically generated content
        });  // end then
      });  // end then
    };  // end function searchMovie()



    $scope.addToWatched = function(idx) {
      $(`#button-${$scope.omnibusArr[idx].id}`).replaceWith(`<p>${$scope.omnibusArr[idx].rating} stars</p>`);
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
      $(`#button-${$scope.omnibusArr[idx].id}`).replaceWith(`<button id='button-${$scope.omnibusArr[idx].id}' ng-click="addToWatched(${idx})">Rate It</button></div>`);
      console.log("adding to Firebase:",$scope.omnibusArr[idx].Title);
return;
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
