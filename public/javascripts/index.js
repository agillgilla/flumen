var fetchedPlaylists;

$(document).ready(function() {

	listPlaylists();
});

/**
 * Fetch playlists and put them in the table.
 */
function listPlaylists() {
	// Playlist
	const playlistsBody = document.querySelector("#playlistTable tbody");

	$.ajax({
        url: "/fetchPlaylists",  // the local Node server
        method: 'GET',
        async: false,
        success: function(data) {
            console.log(data);
        	fetchedPlaylists = data;
        }
    });


	// Add the songs to the dom
	let html = "";
	fetchedPlaylists.forEach((playlist, index) => {
		html += `
		<tr data-index="${index}" class="songEntry show-on-hover">
		<td align="left">${playlist.name}</td>
		</tr>
		`;
	});
	playlistsBody.innerHTML = html;

	// Update the list items
	var listItems = document.querySelectorAll("#playlistTable tbody tr");

	for (const listItem of listItems) {
		listItem.addEventListener("click", (event) => {
			var songIndex = event.target.closest("tr").getAttribute("data-index");

			window.location.href = "/listen?playlist=" + fetchedPlaylists[songIndex].name;
		});
	}
}