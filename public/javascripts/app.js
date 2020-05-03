var songAudio = new Audio();

var dragging = false;

var fetchedSongs = null;
/*
  The index of the song being played (corresponding to index in fetched song list.)
*/
var currSongIndex = -1;
/*
  An array of indices corresponding to songs in the fetched song list.
*/
var songQueue;

$(document).ready(function() {
	var audio = new Audio();

  	$( "#playButton" ).click(function() {
		var initialPlay = false;
	
		audio.src = '/streamMusic';

		audio.load();

		audio.oncanplay = function() {
			if (initialPlay) return;
  			
  			initialPlay = true;

			console.log("Can play!");
    		audio.currentTime = 15;
    		console.log(audio.duration);
		};

		var playPromise = audio.play();

		if (playPromise !== undefined) {
			playPromise.then(_ => {

			  // Automatic playback started!
			  // Show playing UI.
			  console.log("Playback worked!");
			})
			.catch(error => {
			  // Auto-play was prevented
			  // Show paused UI.
			  console.log("Playback failed!");
			});
		}
	});

	$( "#pauseButton" ).click(function() {
		audio.pause();
	});

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
		if($(".play i").hasClass("fa-play")) {
			$(".play i").removeClass("fa-play").addClass("fa-pause");
			var playPauseIcon = $("[data-index=" + currSongIndex + "]").find("i");
			playPauseIcon.removeClass("fa-play-circle").addClass("fa-pause-circle")
			if (songAudio.paused) {
				songAudio.play();
			}
		}
		else {
			$(".play i").removeClass("fa-pause").addClass("fa-play");
			var playPauseIcon = $("[data-index=" + currSongIndex + "]").find("i");
			playPauseIcon.removeClass("fa-pause-circle").addClass("fa-play-circle")
			if (!songAudio.paused) {
				songAudio.pause();
			}
		}
		// Returing false prevents the page from scrolling up when
		// hitting the button.
		return false;
	});

	buildPlaylist();
});

function playSong(songName, songIndex) {
	songAudio.src = '/streamMusic?filename=' + encodeURIComponent(songName);

	songAudio.load();

	songAudio.oncanplay = function() {
		console.log("Can play!");
	};

	var playPromise = songAudio.play();

	songAudio.ontimeupdate = function() {
		if (!dragging) {
			var timeSliderElem = document.getElementById("timeSlider")
			timeSliderElem.value = (songAudio.currentTime / songAudio.duration) * timeSliderElem.max;
			timeSliderElem.style.background = 'linear-gradient(to right, #cc0000 0%, #cc0000 ' + timeSliderElem.value / 10 + '%, #fff ' + timeSliderElem.value / 10 + '%, white 100%)';
			$("#current-time").html(secondsToHms(songAudio.currentTime));
			$("#total-time").html(secondsToHms(songAudio.duration));
		}
	};

	$("#current-time").html(secondsToHms(songAudio.currentTime));
	$("#total-time").html(secondsToHms(songAudio.duration));

	if (playPromise !== undefined) {
		playPromise.then(_ => {
			$(".play i").removeClass("fa-play").addClass("fa-pause");
			// Automatic playback started!
			// Show playing UI.
			console.log("Playback worked!");

			currSongIndex = songIndex;

			$("#currSong").html(fetchedSongs[songIndex].title);
			$("#currArtist").html(fetchedSongs[songIndex].artist);

			var playPauseIcon = $("[data-index=" + songIndex + "]").find("i");
			playPauseIcon.removeClass("fa-play-circle").addClass("fa-pause-circle");
			playPauseIcon.removeClass("show-on-hover");
			playPauseIcon.css("display", "inline-block");
		})
		.catch(error => {
			$(".play i").removeClass("fa-pause").addClass("fa-play");
			// Auto-play was prevented
			// Show paused UI.
			console.log("Playback failed!");
		});
	}
}

/**
 * Build the playlist from the give array of songs.
 */
function buildPlaylist() {
	// Playlist
	const playlistBody = document.querySelector("#playlistTable tbody");

	$.ajax({
        url: "/songsList",  // the local Node server
        method: 'GET',
        async: false,
        success: function(data) {
            console.log(data); //display data in cosole to see if I receive it
        	fetchedSongs = data;
        }
    });


	// Add the songs to the dom
	let html = "";
	fetchedSongs.forEach((song, index) => {
		html += `
		<tr data-index="${index}" class="songEntry show-on-hover">
		<td name="${song.file}"><i class="playPause fa fa-play-circle fa-2x"></i></td>
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
	var playlistPlay = document.querySelectorAll("#playlistTable .playPause");

	for (const playlistPlayButton of playlistPlay) {
		playlistPlayButton.addEventListener("click", (event) => {
			var songIndex = event.target.closest("tr").getAttribute("data-index");
			if (currSongIndex !== songIndex) {
				// Clicked on a new song row
				if (currSongIndex !== -1) {
					var currPlayPauseIcon = $("[data-index=" + currSongIndex + "]").find("i");
					currPlayPauseIcon.removeClass("fa-pause-circle").addClass("fa-play-circle");
					currPlayPauseIcon.css("display", "");
					currPlayPauseIcon.addClass("show-on-hover");
				}
				playSong(playlistPlayButton.parentElement.getAttribute("name"), songIndex);
			} else {
				// Clicked on same song row
				var playPauseIcon = $("[data-index=" + songIndex + "]").find("i");
				if (songAudio.paused) {
					songAudio.play();
					playPauseIcon.removeClass("fa-play-circle").addClass("fa-pause-circle");
					$(".play i").removeClass("fa-play").addClass("fa-pause");
				} else {
					songAudio.pause();
					playPauseIcon.removeClass("fa-pause-circle").addClass("fa-play-circle");
					$(".play i").removeClass("fa-pause").addClass("fa-play");
				}
			}
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
