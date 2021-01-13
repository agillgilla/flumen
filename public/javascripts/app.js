var songAudio = new Audio();

var shuffle = true;
var replay = false;

var dragging = false;

var fetchedSongs = null;

/*
	A list of randomized indices to play in shuffle mode (corresponding to indices
	in fetched song list.)
*/
var shuffledList;

/*
	The index of the song being played (corresponding to index in fetched song list.)
*/
var currSongIndex = -1;

/*
	The index of the song in the shuffled list that is currently being played.
*/
var shuffledIndex = -1;

/*
	An array of indices of songs to play corresponding to songs in the fetched song list.
*/
var songQueue = [];

/*
	The base name of the playlist we're playing
*/
var playlistName;

function updateShuffleColor() {
	if (shuffle) {
		$( ".shuffle").css("color", "#cc0000");
	} else {
		$( ".shuffle").css("color", "#FFF");
	}
}

function updateReplayColor() {
	if (replay) {
		$( ".replay").css("color", "#cc0000");
	} else {
		$( ".replay").css("color", "#FFF");
	}
}

function shuffleList(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function generateShuffledList() {
    shuffledList = [];
    for (var i = 0; i < fetchedSongs.length; i++) {
        shuffledList.push(i);
    }

    shuffleList(shuffledList);

    console.log(shuffledList);
}

function nextSong(shuffleDiff) {
	if (shuffle) {

		var nextSongIndexToPlay;

		if (songQueue.length > 0) {
			// Play from queue

			var nextQueueIndex = songQueue.shift(); // .shift() removes and returns the first element of an array

			nextSongIndexToPlay = nextQueueIndex;

			var row = $("#queueTable").find('tbody').children('tr:first');
			row.remove();
		} else {
			// Play from shuffled list

			shuffledIndex += shuffleDiff;
			if (shuffledIndex < 0) {
				shuffledIndex = 0;
			}

			nextSongIndexToPlay = shuffledList[shuffledIndex]
		}

		if (currSongIndex !== -1) {
			var currPlayPauseIcon = $("[data-index=" + currSongIndex + "]").find("i.playPause");
			currPlayPauseIcon.removeClass("fa-pause-circle").addClass("fa-play-circle");
			currPlayPauseIcon.css("display", "");
			currPlayPauseIcon.addClass("show-on-hover");
		}
		currSongIndex = nextSongIndexToPlay;
		playSong($("[data-index=" + nextSongIndexToPlay + "]").find("i.playPause").parent().attr("name"), nextSongIndexToPlay);
	} else if (replay) {
		songAudio.currentTime = 0;
		songAudio.play();
	}
}

$(document).ready(function() {
	$( ".shuffle").click(function() {
		if (!shuffle) {
			shuffle = !shuffle;
			replay = !replay;
			updateShuffleColor();
			updateReplayColor();
		}
		return false;
	});

	$( ".replay").click(function() {
		if (!replay) {
			replay = !replay;
			shuffle = !shuffle;
			updateReplayColor();
			updateShuffleColor();
		}
		return false;
	});

	updateShuffleColor();
	updateReplayColor();

	var faderElem = document.getElementById("fader");
	faderElem.style.background = 'linear-gradient(to right, #cc0000 0%, #cc0000 ' + faderElem.value + '%, #fff ' + faderElem.value + '%, white 100%)';
	faderElem.oninput = function() {
	  	this.style.background = 'linear-gradient(to right, #cc0000 0%, #cc0000 ' + this.value + '%, #fff ' + this.value + '%, white 100%)';
		songAudio.volume = this.value / this.max;
	};

	document.getElementById("timeSlider").oninput = function() {
		if (dragging) {
			var dragTime = (this.value / this.max) * songAudio.duration;
			$("#current-time").html(secondsToHms(dragTime));
		}
		this.style.background = 'linear-gradient(to right, #cc0000 0%, #cc0000 ' + this.value / (this.max / 100) + '%, #fff ' + this.value / (this.max / 100) + '%, white 100%)';
	};

	document.getElementById("timeSlider").onmousedown = function() {
	  	dragging = true;
	};

	document.getElementById("timeSlider").onmouseup = function() {
		if (dragging) {
			var dragTime = (this.value / this.max) * songAudio.duration;
			songAudio.currentTime = dragTime;
		}
	  	dragging = false;
	};

	$(".play").click(function(e) {
		$(".play").toggleClass("active");

		if (songAudio.paused) {
			
			var playPauseIcon = $("[data-index=" + currSongIndex + "]").find("i.playPause");
			playPauseIcon.removeClass("fa-play-circle").addClass("fa-pause-circle");
			
			if (songAudio.src != "") {
				if (songAudio.paused) {
					songAudio.play();
				}
			} else {
				nextSong(1);
			}
		} else {
			
			var playPauseIcon = $("[data-index=" + currSongIndex + "]").find("i.playPause");
			playPauseIcon.removeClass("fa-pause-circle").addClass("fa-play-circle");
			if (!songAudio.paused) {
				songAudio.pause();
			}
		}
		// Returning false prevents the page from scrolling up when
		// hitting the button.
		return false;
	});

	$(".previous").click(function(e) {
		if (songAudio.currentTime > 5) {
			songAudio.currentTime = 0;
			return false;
		} else {
			nextSong(-1);
			
			// Returning false prevents the page from scrolling up when
			// hitting the button.
			return false;
		}
	});

	$(".next").click(function(e) {
		nextSong(1);

		// Returning false prevents the page from scrolling up when
		// hitting the button.
		return false;
	});

	// This makes the keyboard media shortcut key work (in this case it is the previous track key)
	navigator.mediaSession.setActionHandler("previoustrack", function() {
	    if (songAudio.currentTime > 5) {
			songAudio.currentTime = 0;
		} else {
			nextSong(-1);
		}
	});
	// This makes the keyboard media shortcut key work (in this case it is the next track key)
	navigator.mediaSession.setActionHandler("nexttrack", function() {
	    nextSong(1);
	});

	// Media keyboard shortcuts:
	// Ctrl+Left (for previous song)
	// Ctrl+Right (for next song)
	// Ctrl+Space (for play/pause)
	function keyboardShortcutHandler(e) {
		var evtobj = window.event? event : e;

		if ((evtobj.keyCode == 39 && evtobj.ctrlKey)) {
		  nextSong(1);
		} else if (evtobj.keyCode == 37 && evtobj.ctrlKey) {
		  if (songAudio.currentTime > 5) {
				songAudio.currentTime = 0;
			} else {
				nextSong(-1);
			}
		} else if (evtobj.keyCode == 32 && evtobj.ctrlKey) {
			$(".play").toggleClass("active");

			if (songAudio.paused) {
				
				var playPauseIcon = $("[data-index=" + currSongIndex + "]").find("i.playPause");
				playPauseIcon.removeClass("fa-play-circle").addClass("fa-pause-circle");
				
				if (songAudio.src != "") {
					if (songAudio.paused) {
						songAudio.play();
					}
				} else {
					nextSong(1);
				}
			} else {
				
				var playPauseIcon = $("[data-index=" + currSongIndex + "]").find("i.playPause");
				playPauseIcon.removeClass("fa-pause-circle").addClass("fa-play-circle");
				if (!songAudio.paused) {
					songAudio.pause();
				}
			}
		}
	}

	document.onkeydown = keyboardShortcutHandler;

	buildPlaylist();

	if (shuffle) {
		generateShuffledList();
	}

	songAudio.onplay = function() {
		$(".play i").removeClass("fa-play").addClass("fa-pause");
	};

	songAudio.onpause = function() {
		$(".play i").removeClass("fa-pause").addClass("fa-play");
	};

	songAudio.ontimeupdate = function() {
		if (!dragging) {
			var timeSliderElem = document.getElementById("timeSlider")
			timeSliderElem.value = (songAudio.currentTime / songAudio.duration) * timeSliderElem.max;
			timeSliderElem.style.background = 'linear-gradient(to right, #cc0000 0%, #cc0000 ' + timeSliderElem.value / 10 + '%, #fff ' + timeSliderElem.value / 10 + '%, white 100%)';
			$("#current-time").html(secondsToHms(songAudio.currentTime));
			$("#total-time").html(secondsToHms(songAudio.duration));
		}
	};

	songAudio.oncanplay = function() {
		console.log("Can play!");
	};

	songAudio.onended = function() {
		nextSong(1);
	}

	var songsHeaderTag = document.getElementsByClassName("sortHeader")[0];
	sorttable.innerSortFunction.apply(songsHeaderTag, []);
});

function playSong(songName, songIndex) {
	songAudio.src = '/streamMusic?filename=' + encodeURIComponent(songName) + '&playlist=' + encodeURIComponent(playlistName);

	songAudio.load();

	var playPromise = songAudio.play();

	$("#current-time").html(secondsToHms(songAudio.currentTime));
	$("#total-time").html(secondsToHms(songAudio.duration));

	if (playPromise !== undefined) {
		playPromise.then(_ => {
			// Automatic playback started!
			// Show playing UI.
			console.log("Playback worked!");

			currSongIndex = songIndex;

			$("#currSong").html(fetchedSongs[songIndex].title);
			$("#currArtist").html(fetchedSongs[songIndex].artist);

			var playPauseIcon = $("[data-index=" + currSongIndex + "]").find("i.playPause");
			playPauseIcon.removeClass("fa-play-circle").addClass("fa-pause-circle");
			playPauseIcon.removeClass("show-on-hover");
			playPauseIcon.css("display", "inline-block");
		})
		.catch(error => {
			// Auto-play was prevented
			// Show paused UI.
			console.log("Playback failed!");
		});
	}
}

function addSongToQueue(songName, songIndex) {
	var table = document.getElementById("queueTable").getElementsByTagName("tbody")[0];
	var row = table.insertRow(-1);

	var song = fetchedSongs[songIndex];

	songQueue.push(songIndex);

	//<tr data-index="${songQueue.length}" data-song-index="${songIndex}" class="songEntry show-on-hover">
	row.innerHTML = `
		<td class="table-button"><i class="removeFromQueue fa fa-times-circle fa-2x"></i></td>
		<td class="table-button"><i class="moveUp fa fa-arrow-circle-up fa-2x"></i></td>
		<td class="table-button"><i class="moveDown fa fa-arrow-circle-down fa-2x"></i></td>
		<td align="left">${song.title}</td>
		<td align="left">${song.artist}</td>
		<td align="left">${song.album}</td>
		<td align="left" class="song-duration">${secondsToHms(song.duration)}</td>
		`
	//</tr>
	row.classList.add("songEntry");
	row.classList.add("show-on-hover");
	//row.setAttribute("data-index", (songQueue.length - 1).toString())
	row.setAttribute("data-song-index", songIndex.toString())

	var removeButtons = document.querySelectorAll("#queueTable .removeFromQueue");
	var newRemoveButton = removeButtons[removeButtons.length - 1];
	newRemoveButton.addEventListener("click", (event) => {
		var row = event.target.closest("tr");
		// rowIndex is 1-indexed.  wtf?
		var tableIndex = row.rowIndex - 1;

		songQueue.splice(tableIndex, 1);
		row.remove();
	});

	var moveUpButtons = document.querySelectorAll("#queueTable .moveUp");
	var newMoveUpButton = moveUpButtons[moveUpButtons.length - 1];
	newMoveUpButton.addEventListener("click", (event) => {
		// rowIndex is 1-indexed.  wtf?
		var tableIndex = event.target.closest("tr").rowIndex - 1;

		if (tableIndex > 0) {
			var tableIndexVal = songQueue[tableIndex];
			songQueue[tableIndex] = songQueue[tableIndex - 1];
			songQueue[tableIndex - 1] = tableIndexVal;

			var row = $(event.target).closest('tr');
		    row.prev().before(row);
		}
	});


	var moveDownButtons = document.querySelectorAll("#queueTable .moveDown");
	var newMoveDownButton = moveDownButtons[moveDownButtons.length - 1];
	newMoveDownButton.addEventListener("click", (event) => {
		//var tableIndex = event.target.closest("tr").getAttribute("data-index");
		//var tableIndex = parseInt(tableIndex);

		// rowIndex is 1-indexed.  wtf?
		var tableIndex = event.target.closest("tr").rowIndex - 1;

		if (tableIndex < songQueue.length - 1) {
			var tableIndexVal = songQueue[tableIndex];
			songQueue[tableIndex] = songQueue[tableIndex + 1];
			songQueue[tableIndex + 1] = tableIndexVal;

			var row = $(event.target).closest('tr');
			row.next().after(row);
		}
	});
}

/**
 * Build the playlist from the given array of songs.
 */
function buildPlaylist() {
	// Playlist
	const playlistBody = document.querySelector("#playlistTable tbody");

	var urlString = window.location.href;
	var url = new URL(urlString);
	playlistName = url.searchParams.get("playlist");

	$.ajax({
        url: "/songsList",  // the local Node server
        method: 'GET',
        data: {
        	playlist: playlistName
    	},
        async: false,
        success: function(data) {
            console.log(data); //display data in cosole to see if I receive it
        	fetchedSongs = data;
        }
    });


	// Add the song entries to the table
	let html = "";
	fetchedSongs.forEach((song, index) => {
		html += `
		<tr data-index="${index}" class="songEntry show-on-hover">
		<td name="${song.file}" class="table-button"><i class="playPause fa fa-play-circle fa-2x"></i></td>
		<td name="${song.file}" class="table-button"><i class="addToQueue fa fa-plus-circle fa-2x"></i></td>
		<td align="left">${song.title}</td>
		<td align="left">${song.artist}</td>
		<td align="left">${song.album}</td>
		<td align="left" class="song-duration">${secondsToHms(song.duration)}</td>
		</tr>
		`;
	});
	playlistBody.innerHTML = html;

	// Update the list items
	var listItems = document.querySelectorAll("#playlistTable tbody tr");
	var playButtons = document.querySelectorAll("#playlistTable .playPause");
	var addToQueueButtons = document.querySelectorAll("#playlistTable .addToQueue");

	for (const playButton of playButtons) {
		playButton.addEventListener("click", (event) => {
			var songIndex = event.target.closest("tr").getAttribute("data-index");
			if (currSongIndex != songIndex) {
				// Clicked on a new song row
				if (currSongIndex !== -1) {
					var currPlayPauseIcon = $("[data-index=" + currSongIndex + "]").find("i.playPause");
					currPlayPauseIcon.removeClass("fa-pause-circle").addClass("fa-play-circle");
					currPlayPauseIcon.css("display", "");
					currPlayPauseIcon.addClass("show-on-hover");
				}
				playSong(playButton.parentElement.getAttribute("name"), songIndex);
			} else {
				// Clicked on same song row
				var playPauseIcon = $("[data-index=" + currSongIndex + "]").find("i.playPause");
				if (songAudio.paused) {
					songAudio.play();
					playPauseIcon.removeClass("fa-play-circle").addClass("fa-pause-circle");
				} else {
					songAudio.pause();
					playPauseIcon.removeClass("fa-pause-circle").addClass("fa-play-circle");
				}
			}
		});
	}

	for (const addToQueueButton of addToQueueButtons) {
		addToQueueButton.addEventListener("click", (event) => {
			var songIndex = event.target.closest("tr").getAttribute("data-index");
			addSongToQueue(addToQueueButton.parentElement.getAttribute("name"), songIndex);
		});
	}
}

/**
 * Convert seconds into a usable format for time.
 *
 * @param {number|string} seconds The amount of seconds to convert.
 * @return {string} Returns a time formatted string (--:--:--).
 */
function secondsToHms(seconds) {
  const time = {
    hours: String(Math.floor(Number(seconds) / 3600)),
    minutes: String(Math.floor((Number(seconds) % 3600) / 60)),
    seconds: String(Math.floor((Number(seconds) % 3600) % 60))
  };

  if (time.hours && time.hours < 10) {
    time.hours = `0${time.hours}`;
  }
  if (time.minutes && time.minutes < 10) {
    time.minutes = `0${time.minutes}`;
  }
  if (time.seconds && time.seconds < 10) {
    time.seconds = `0${time.seconds}`;
  }

  if (time.hours !== "00") {
    return `${time.hours}:${time.minutes}:${time.seconds}`;
  } else {
    return `${time.minutes}:${time.seconds}`;
  }
}
