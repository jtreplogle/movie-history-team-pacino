"use strict";

MovieApp.controller("untrackedCtrl", [
  "$scope",
  "$http",
  "$compile",
  "firebaseURL",
  function ($scope,$http,$compile,firebaseURL) {
    console.log("RUNNING UNTRACKEDCTRL");
    console.log("scope.search",$scope.search);
    // $http.get("http://www.omdbapi.com/?s=" + $scope.search + "&page=1")
    // .then((response) => {
    //   $scope.omnibusArr = processOMDB(response);
    //   $scope.omnibusArr = $scope.omnibusArr.filter(filterUntracked);
    //   $scope.displayPosters();
    // });

    function processOMDB(omdbObj) {
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

    function filterUnracked(obj) {
      return obj.tracking === false;
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
  }
]);