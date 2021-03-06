'use strict';
angular.module('shareSoundApp')

.controller('ProfileviewCtrl', function ($scope, Auth, projects, Tracks, $location, $window, $sce, $state, $stateParams) {
	
	$scope.getCurrentUser = Auth.getCurrentUser;
	$scope.getToken = Auth.getToken; 
	$scope.isLoggedIn = Auth.isLoggedIn;
	$scope.show = false;
	$scope.tracksinit = false;
	$scope.projectView = true;
	$scope.uploadTrackPage = false;
	$scope.createProjectPage = false;
	$scope.project = {};
	$scope.isOnUserPage = true; //allows the tag add/delete buttons to not be displayed by search 
	// $scope.currentProject;
	$scope.projectservice = projects;
	$scope.profileusername = $stateParams.username;
	

	if($stateParams.projectID!=undefined){
		console.log("not undefined")
		projects.getProject($stateParams.projectID).then(function(){
			console.log("holy mother of god" +projects.currProjects)
			$scope.currentProject = projects.currProjects;
		})
		projects.getProjectTracks($stateParams.projectID)

	}
	
	projects.getUserProjectsByUsername($scope.profileusername)
	.then( function() {
		console.log(projects.userProjects);
		$scope.projects = projects.userProjects;
		console.log("projects..... " + JSON.stringify($scope.projects));
	})
	
    $scope.$on('$destroy', function(event) {
        console.log("leaving page..."); 
        $scope.wavesurfers.map(function(ws) {
                if (!ws.backend.isPaused()){
                    return ws.pause();    
                }
			});
        
      });
    $scope.showProjectView = function(){

    	$location.path("/profile/" + $scope.profileusername);


    }
	$scope.createProjectPopUp = function(){
		
		console.log("createProject")
		$scope.createProjectPage = true;
	}

	$scope.uploadTrack = function(){


		$scope.uploadTrackPage = true;


	}
    
    $scope.showAddTag = function(track){
        $scope.addTagPage = true;   
        $scope.trackToChange = track; 
    }

	$scope.Close = function(){

		$scope.uploadTrackPage = false;
		$scope.createProjectPage = false;

	}
    
    $scope.addTag = function(){
        console.log("submitted......"); 
        console.log($scope.track.tags); 
    
        Tracks.addTags($scope.trackToChange, $scope.track.tags); 
        $scope.showAddTag = false; 
        $state.transitionTo($state.current, $stateParams, {
                    reload: true,
                    inherit: false,
                    notify: true
        });
    } 
    
    $scope.deleteTag = function(id, tag){
        console.log("deleting " + tag + " for " + id); 
        Tracks.deleteTag(id, tag);
        $state.transitionTo($state.current, $stateParams, {
                    reload: true,
                    inherit: false,
                    notify: true
    
        }); 
        
    }
    

	$scope.submit = function() {
      $scope.submitted = true;

      console.log($scope.track.project)
 
      console.log($scope.track.tags)
      var tagArray = $scope.track.tags.split(" ")
      console.log("The tag array is : " + tagArray)
      $scope.tagArray = tagArray;
        
    };
    
    $scope.searchTag = function(query){
      console.log("SEARCHINGGGG"); 
      console.log(query); 
      Tracks.searchTracks(query)
      .then( function() {
			$scope.searchResults = Tracks.resultTracks; 
			console.log("found tracks..... " + JSON.stringify($scope.searchResults));
            //$location.path('search'); 
            //this is better than location.path because refresh page if current page 
            $state.transitionTo('search' , $stateParams, {
                reload: true,
                inherit: false,
                notify: true
            });
		})
    
    };


	$scope.s3_upload = function (){
		console.log("s3_upload");
		var status_elem = document.getElementById("status");
		//var url_elem = document.getElementById("avatar_url");
		// var preview_elem = document.getElementById("preview");

		var projectEncode = encodeURIComponent($scope.currentProject._id);
		//add tags and project 

		var tagEncode;
		var descriptionEncode;

		console.log("CURRENT USER: " + JSON.stringify(Auth.getCurrentUser().username));


		if ($scope.track !== undefined) {
			tagEncode = encodeURIComponent($scope.track.tags);
			if ($scope.track.description === undefined) {
				descriptionEncode = encodeURIComponent("No description"); 
			}
			else {
				descriptionEncode = encodeURIComponent($scope.track.description);
			}
		}
		else{
			tagEncode = encodeURIComponent(undefined);
			descriptionEncode = encodeURIComponent('No description');
		}
		console.log("The encoded tags is : " + tagEncode);
		console.log("The encoded project is : " + projectEncode); 

		var s3upload = new S3Upload({
			user: Auth.getCurrentUser(),
			file_dom_selector: 'files',
			s3_sign_put_url: '/api/tracks/uploadTrack/'+projectEncode+'/'+tagEncode+'/'+descriptionEncode,
			onProgress: function(percent, message) {
				status_elem.innerHTML = 'Upload progress: ' + percent + '% ' + message;
			},
			onFinishS3Put: function(public_url) {
				//status_elem.innerHTML = 'Upload completed. Uploaded to: '+ public_url;
				//url_elem.value = public_url;
				//preview_elem.innerHTML = '<img src="'+public_url+'" style="width:300px;" />';

				console.log("reloading"); 

				$state.transitionTo($state.current, $stateParams, {
					reload: true,
					inherit: false,
					notify: true
				});
			},
			onError: function(status) {
				status_elem.innerHTML = 'Upload error: ' + status;
			}
		});
		$scope.uploadPage = false;
	}

	// $scope.createProject = function(){
	// 	$scope.user = {};
 //    	$scope.errors = {};
	//   	console.log(Auth.getCurrentUser());

 //        projects.createProject({
 //        	owner: Auth.getCurrentUser()._id,
 //        	name: $scope.project.name,
 //        	description: $scope.project.description,
 //        	tags: $scope.project.tags


 //        }).then(function(){
	// 		$scope.createProjectPage = false;
 //        })
 //        .catch( function(err) {
 //          err = err.data;
 //          $scope.errors = {};
 //          console.log(err);
 //          $scope.errors.username = err;
 //          });



	// };

	$scope.viewProject = function(projectID){

		$location.path("/profile/" + $scope.profileusername + "/" + projectID)
		projects.getProject(projectID);
		projects.getProjectTracks(projectID)

		
	}
	$scope.getProject = function(){

		projects.getProject($stateParams.projectID);
		projects.getProjectTracks($stateParams.projectID)
		.then(function () {
			console.log('Project tracks:..' + projects.currProjectTracks);
			$scope.tracks = projects.currProjectTracks;
		});
	}




	$scope.doAll = function(action) {
		if (action == 'play') {
			$scope.wavesurfers.map(function(ws) {
				return ws.play();
			});
		};
		if (action == 'pause') {
			$scope.wavesurfers.map(function(ws) {
				return ws.pause();
			});
		};
		if (action == 'stop') {
			$scope.wavesurfers.map(function(ws) {
				return ws.stop();
			});
		};
	};
	// angular.element(document).ready(function() {
	$scope.showtracks = function() {
		if (!$scope.show){
			$scope.show = true;
			$scope.showplayall = true;
			if (!$scope.tracksinit){
				var waveColors = ['#66CCFF', '#66FF66', '#FF9933', 'violet'];
				var progressColors = ['#0033CC', '#009900', '#FF6600', 'purple'];
				var color = 0; // for selecting the color
				$scope.tracksinit = true;
				$scope.wavesurfers = [].map.call(document.querySelectorAll(".track_list li .wavesurfers"), function(element) {
					//console.log(element);
					var trackurl = element.getElementsByClassName("url")[0].textContent;
					//console.log(element.getElementsByClassName("url")[0]);
					var trackid = element.getElementsByClassName("waveform")[0].getAttribute("id");
					//console.log("url: " + trackurl);
					//console.log("trackid: " + trackid);
					// Create an instance
					var wavesurfer = Object.create(WaveSurfer);
					console.log("made wavesurfer");

					// Init & load audio file
					var qstring = '#waveform'
					console.log("q: "+qstring);
					var options = {
						container     : element,
						waveColor     : waveColors[color % 4],
						progressColor : progressColors[color % 4],
						loaderColor   : 'red',
						cursorColor   : 'red',
						normalize: true,
						height: 64
					};

					if (location.search.match('scroll')) {
						options.minPxPerSec = 100;
						options.scrollParent = true;
					};

					if (location.search.match('normalize')) {
						options.normalize = true;
					};

					// Init
					wavesurfer.init(options);
					// Load audio from URL
					// wavesurfer.load('/assets/media/samp.mp3');
					wavesurfer.load(trackurl);
					// Regions
					if (wavesurfer.enableDragSelection) {
						wavesurfer.enableDragSelection({
							color: 'rgba(0, 255, 0, 0.1)'
						});
					}

					// Play at once when ready
					// Won't work on iOS until you touch the page
					wavesurfer.on('ready', function () {
						//wavesurfer.play();
					});

					// Report errors
					wavesurfer.on('error', function (err) {
						console.error(err);
					});

					// Do something when the clip is over
					wavesurfer.on('finish', function () {
						console.log('Finished playing');
					});

					var GLOBAL_ACTIONS = {
						'play': function () {
							wavesurfer.playPause();
						},

						'back': function () {
							wavesurfer.skipBackward();
						},

						'forth': function () {
							wavesurfer.skipForward();
						},

						'toggle-mute': function () {
							wavesurfer.toggleMute();
						}
					};
					var controlselstr = trackid;
					var controlele = document.getElementById('controlling:' + trackid);
					[].forEach.call(controlele.querySelectorAll('[data-action]'), function (el) {
						el.addEventListener('click', function (e) {
							//console.log("CLICKING", e);
							//console.log(e);
							var action = e.currentTarget.dataset.action;
							if (action in GLOBAL_ACTIONS) {
								e.preventDefault();
								GLOBAL_ACTIONS[action](e);
							}
						});
					});
					color++;
					return wavesurfer;	
				});
				
			};
		} else {
			$scope.show = false;
			$scope.showplayall = false;
		}
	}
});



/*

   client/app/pokedex/pokedex.controller.js
   angular.module('pokemonAppApp')
   .controller('PokedexCtrl', function ($scope, pokemonService, $location) {
   $scope.pokemonService = pokemonService;
   pokemonService.getAllPokemons();

   $scope.viewPokemon = function (pokemon) {
   pokemonService.getPokemon(pokemon._id);
   $location.path('/' + pokemon._id);
   };

   $scope.deletePokemon = function () {
   pokemonService.deletePokemon(pokemonService.currPokemon._id);
   $location.path('/');
   };


   $scope.newPokemon = { name: '', picture: '', description: '' };

   $scope.addPokemon = function () {
   pokemonService.createPokemon($scope.newPokemon);
   $scope.newPokemon = { name: '', picture: '', description: '' };
   }
   });


 */
