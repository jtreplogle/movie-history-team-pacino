"use strict";

MovieApp.controller("SearchCtrl",
[
  "$scope",
  "$location",
  "$http",
  "$compile",
  "$q",
  "firebaseURL",


  function ($scope, $location, $http, $compile, $q, firebaseURL) {

    $scope.search = "";
    $scope.omdbResultArr = [];

    $scope.searchMovie = function() {
      $("#showPostersHere").html("");  // clear poster display area

      $q.all([
        $http.get("http://www.omdbapi.com/?s=" + $scope.search + "&page=1"),
        $http.get(`${firebaseURL}/movies/.json`)
        ])
      .then(function(results) {
        // results is [Object, Object]
        // where Objects are results of first get and second get
        console.log("both resolved");
        $scope.omnibusArr = $scope.processOMDB(results[0]).concat($scope.processFirebase(results[1]));
        console.log("omnibus array is ",$scope.omnibusArr);
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
        $scope.displayPosters();
      });  // end then
      return;
    }  // end function searchMovie

    $scope.processOMDB = function(omdbObj) {
      let array = [];
      omdbObj.data.Search.forEach(function(currObj,idx) {
        currObj.id = currObj.imdbID;
        array.push(currObj);
      })
      return array;
    }

    $scope.processFirebase = function(fbObj) {
      let array = [];
      // convert object of objects into array of objects
      for (let key in fbObj.data) {
        fbObj.data[key].id = key;
        array.push(fbObj.data[key]);  // in final version, filter by search term
      }
      return array;
    }

    $scope.displayPosters = function() {
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
          posterStr += `<button id='button-${$scope.omnibusArr[i].id}' ng-click="addMovie(${i})">Add to Tracking</button></div>`; // send omnibus index as arg
        } else {
          posterStr += "<p>???</p></div>"
        }
      }  // end for
      $("#showPostersHere").html($compile(posterStr)($scope));  // use $compile to bind dynamically generated content
    } // end function displayPosters()


    $scope.addToWatched = function(idx) {
      var rating = 5; // hard-coded rating, for testing
      $scope.omnibusArr[idx].rating = rating;
      $(`#button-${$scope.omnibusArr[idx].id}`).replaceWith(`<p>${$scope.omnibusArr[idx].rating} stars</p>`);
      console.log("patching ",`${firebaseURL}/movies/${$scope.omnibusArr[idx].id}.json`);
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
      $(`#button-${$scope.omnibusArr[idx].id}`).replaceWith($compile(`<button id='button-${$scope.omnibusArr[idx].id}' ng-click='addToWatched(${idx})'>Rate It</button>`)($scope));
      console.log("adding to Firebase:",$scope.omnibusArr[idx].Title);
      // PUT this movie to firebase and add the user's ID as a property
      $http.put(
        // "https://nss-demo-instructor.firebaseio.com/songs.json", //***original line***//
        // POST obj to firebase
        `${firebaseURL}/movies/${$scope.omnibusArr[idx].id}.json`, // new line

        // Remember to stringify objects/arrays before
        // sending them to an API
        JSON.stringify({
          imdbID: $scope.omnibusArr[idx].id,
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
