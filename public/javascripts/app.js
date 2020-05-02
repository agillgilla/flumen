const songList = [
  {
    title: "Lost On You",
    artist: "LP",
    duration: 268,
    album: "Lost On You",
  },
  {
    title: "Bad Liar",
    artist: "Selena Gomez",
    duration: 215,
    album: "Bad Liar",
  },
  {
    title: "Shape of You",
    artist: "Ed Sheeran",
    duration: 233,
    album: "÷ (Divide)",
  },
  {
    title: "Ride",
    artist: "Twentry One Pilots",
    duration: 215,
    album: "Blurryface",
  },
  {
    title: "Set Fire to the Rain",
    artist: "Adele",
    duration: 242,
    album: "21",
  },
  {
    title: "Girl on Fire",
    artist: "Alicia Keys",
    duration: 225,
    album: "Girl on Fire",
  },
  {
    title: "Swing, Swing",
    artist: "The All American Rejects",
    duration: 233,
    album: "The All-American Rejects",
  },
  {
    title: "Jamie All Over",
    artist: "Mayday Parade",
    duration: 216,
    album: "A Lesson in Romantics",
  },
  {
    title: "Titanium",
    artist: "David Guetta ft. Sia",
    duration: 245,
    album: "Nothing but the Beat",
  }
];

var songAudio = new Audio();

var dragging = false;

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

	document.getElementById("fader").oninput = function() {
	  	this.style.background = 'linear-gradient(to right, #cc0000 0%, #cc0000 ' + this.value + '%, #fff ' + this.value + '%, white 100%)';
		songAudio.volume = this.value / this.max;
	};

	document.getElementById("timeSlider").oninput = function() {
	  	this.style.background = 'linear-gradient(to right, #cc0000 0%, #cc0000 ' + this.value / (this.max / 100) + '%, #fff ' + this.value / (this.max / 100) + '%, white 100%)';
	};

	document.getElementById("timeSlider").onmousedown = function() {
	  	dragging = true;
	};

	document.getElementById("timeSlider").onmouseup = function() {
	  	dragging = false;
	};

	$(".play").click(function(e) {
		$(".play").toggleClass("active");
		if($(".play i").hasClass("fa-play")) {
			$(".play i").removeClass("fa-play").addClass("fa-pause");
			if (songAudio.paused) {
				songAudio.play();
			}
		}
		else {
			$(".play i").removeClass("fa-pause").addClass("fa-play");
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

function playSong(songName) {
	songAudio.src = '/streamMusic?filename=' + songName;

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
		}
	};

	if (playPromise !== undefined) {
		playPromise.then(_ => {
			$(".play i").removeClass("fa-play").addClass("fa-pause");
			// Automatic playback started!
			// Show playing UI.
			console.log("Playback worked!");
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

	var fetchedSongs = null;

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
		<tr data-index="${index}" class="songEntry">
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
			playSong(playlistPlayButton.parentElement.getAttribute("name"));
			console.log(playlistPlayButton.closest("tr").getAttribute("data-index"));
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
