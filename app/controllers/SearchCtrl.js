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

    $scope.searchMovie = () => {
      $("#showPostersHere").html("");  // clear poster display area
      $q.all([
        $http.get("http://www.omdbapi.com/?s=" + $scope.search + "&page=1"),
        $http.get(`${firebaseURL}/movies/.json`)
        ])
      .then((results) => {
        // results is [Object, Object]
        // where Objects are results of first get and second get
        $scope.omnibusArr = $scope.processOMDB(results[0]).concat($scope.processFirebase(results[1]));
        $scope.displayPosters();
      });  // end then
    }  // end function searchMovie

    $scope.processOMDB = (omdbObj) => {
      let array = [];
      omdbObj.data.Search.forEach((currObj,idx) => {
        if (currObj.Poster.indexOf("http") < 0) {
          currObj.Poster = "img/image-not-available.jpg";
        }
        // add new keys that OMDB object doesn't have
        currObj.id = currObj.imdbID;
        currObj.watched = false;
        currObj.tracking = false;
        array.push(currObj);
      })
      return array;
    }

    $scope.processFirebase = (firebaseObj) => {
      let array = [];
      // convert object of objects into array of objects
      for (let key in firebaseObj.data) {
        array.push(firebaseObj.data[key]);  // in final version, filter by search term
      }
      return array;
    }

    $scope.displayPosters = () => {
      let posterStr = "";
      for (let i = 0; i < $scope.omnibusArr.length; i++) {
        let id = $scope.omnibusArr[i].id;
        posterStr += `<div class="movieBox" id='movieBox-${id}'><img src=${$scope.omnibusArr[i].Poster}>`;
        if ($scope.omnibusArr[i].watched) {
          posterStr += `<p id='stars-${id}'>${$scope.omnibusArr[i].stars} stars</p>`;
          posterStr += `<button id='delete-${id}' ng-click="deleteMovie(${i})">Delete</button></div>`; // send omnibus index as arg
        } else if ($scope.omnibusArr[i].tracking && !$scope.omnibusArr[i].watched) {
          posterStr += `<button id='button-${id}' ng-click="addToWatched(${i})">Rate It</button>`; // send omnibus index as arg
          posterStr += `<button id='delete-${id}' ng-click="deleteMovie(${i})">Delete</button></div>`; // send omnibus index as arg
        } else if (!$scope.omnibusArr[i].tracking && !$scope.omnibusArr[i].watched) {
          posterStr += `<button id='button-${id}' ng-click="addMovie(${i})">Add to Tracking</button></div>`; // send omnibus index as arg
        } else {
          posterStr += "<p>???</p></div>"
        }
      }  // end for
      $("#showPostersHere").html($compile(posterStr)($scope));  // use $compile to bind dynamically generated content
    } // end function displayPosters()

    $scope.addToWatched = (idx) => {
      let id = $scope.omnibusArr[idx].id;
      $scope.omnibusArr[idx].stars = 5;  // hard-coded stars, for testing - in final version, will be able to pick value
      $(`#button-${id}`).replaceWith(`<p>${$scope.omnibusArr[idx].stars} stars</p>`);
      console.log("patching ",`${firebaseURL}/movies/${id}.json`);
      $http.patch(
        `${firebaseURL}/movies/${id}.json`,
        JSON.stringify({watched: true, stars: $scope.omnibusArr[idx].stars})
      )
      .then(
        () => console.log("patched"),      // Handle resolve
        (response) => console.log(response)  // Handle reject
      );
    };

    $scope.deleteMovie = (idx) => {
      let id = $scope.omnibusArr[idx].id;
      $(`#stars-${id}`).remove();
      $(`#button-${id}`).remove();
      $(`#delete-${id}`).replaceWith(`<p>***deleted***</p>`);
      $(`#movieBox-${id}`).remove();
      console.log("deleting ",`${firebaseURL}/movies/${$scope.omnibusArr[idx].id}.json`);
      $http.delete(
        `${firebaseURL}/movies/${$scope.omnibusArr[idx].id}.json`
      )
      .then(
        () => console.log("deleted"),      // Handle resolve
        (response) => console.log(response)  // Handle reject
      );
    };

    $scope.addMovie = (idx) => {  // add this movie to the Firebase DB (i.e. track this movie)
      $(`#button-${$scope.omnibusArr[idx].id}`)
      .replaceWith($compile(
        `<button id='button-${$scope.omnibusArr[idx].id}' ng-click='addToWatched(${idx})'>Rate It</button>
         <button id='delete-${$scope.omnibusArr[idx].id}' ng-click="deleteMovie(${idx})">Delete</button>`
        )($scope));
      console.log("adding to Firebase:",$scope.omnibusArr[idx].Title);
      // PUT this movie to firebase
      $http.put(
        `${firebaseURL}/movies/${$scope.omnibusArr[idx].id}.json`, // new line

        // Remember to stringify objects/arrays before sending them to an API
        JSON.stringify({
          Title:    $scope.omnibusArr[idx].Title,
          Year:     $scope.omnibusArr[idx].Year,
          Poster:   $scope.omnibusArr[idx].Poster,
          id:       $scope.omnibusArr[idx].id,
          stars:    -1,
          tracking: true,
          watched:  false
        })
      // The $http.put() method returns a promise, so you can use then()
      ).then(
        () => console.log("added"),      // Handle resolve
        (response) => console.log(response)  // Handle reject
      );  // end then
    };  // end function addMovie

  }  // end dependency function
]);
