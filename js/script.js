/* globals $ */

/**
 * Jukebox Singleton
 * @namespace
 * @property {array} songs - List of songs available in the app
 * @property {Song} activeSong - The song currently selected
 * @property {number} volume - Number between 1 and 100, the current volume
 * @property {boolean} isPlaying - Whether or not the activeSong is playing
 * @property {object} dom - Cached dom elements relevant to Jukebox
 */
var Jukebox = {
	songs: [],
	activeSong: null,
	volume: 100,
	isPlaying: false,
	dom: {},

	/**
	 * This function caches all selectors, binds all events, and does the initial
	 * render. Should be run once to kick off the jukebox.
	 */
	start: function() {
		// Grab the dom elements
		this.dom = {
			play: $(".jukebox-controls-play"),
			stop: $(".jukebox-controls-stop"),
			next: $(".jukebox-controls-next"),
			prev: $(".jukebox-controls-previous"),
			mute: $(".jukebox-controls-mute"),
			upload: $(".jukebox-header-upload input"),
			songs: $(".jukebox-songs"),
		};

		// Queue up some default songs
		this.addSong("./songs/Zimbabwe.mp3", {
			title: "Can I Get Wit' Ya in Zimbabwe",
			artist: "Notorious B.I.G. / New Navy",
		});
		this.addSong("./songs/IllGetYou.mp3", {
			title: "I'll Get You (ft. Jeppe)",
			artist: "Classixx",
		});
		this.addSong("./songs/CoastalBrake.mp3", {
			title: "Coastal Brake",
			artist: "Tycho",
		});
		this.change(this.songs[0]);

		// Render and bind!
		this.render();
		this.listen();
	},

	/**
	 * Binds all event listeners. Must run `start()` before running this.
	 */
	listen: function() {
		this.dom.play.on("click", function() {
			if (this.isPlaying) {
				this.pause();
			}
			else {
				this.play();
			}
		}.bind(this));

		this.dom.mute.on("click", function() {
			this.setVolume(0);
		}.bind(this));

		this.dom.next.on("click", function() {
			this.skip(1);
		}.bind(this));

		this.dom.prev.on("click", function() {
			this.skip(-1);
		}.bind(this));

		this.dom.stop.on("click", this.stop.bind(this));

		this.dom.upload.on("change", function() {
			var files = this.dom.upload.prop("files");
			console.log(files);

			for (var i = 0; i < files.length; i++) {
				var file = URL.createObjectURL(files[i]);
				this.addSong(file, {
					title: "Uploaded song",
					artist: "Unknown",
				});
			}
		}.bind(this));
	},

	/**
	 * Updates the state of the DOM to match the state of the Jukebox. Must run
	 * `start()` before running this.
	 */
	render: function() {
		// Render song elements
		this.dom.songs.html("");
		for (var i = 0; i < this.songs.length; i++) {
			var $song = this.songs[i].render();
			this.dom.songs.append($song);

			if (this.songs[i] === this.activeSong) {
				$song.addClass("isActive");
			}
		}

		// Indicate paused vs played
		this.dom.play.toggleClass("isPlaying", this.isPlaying);
		this.dom.stop.toggleClass("isDisabled", !this.isPlaying);
	},

	/**
	 * Plays a song. If passed a song, sets that to the activeSong. Otherwise
	 * plays the current activeSong. If no activeSong, returns null.
	 * @param {Song} [song] - Song to play, if changing from activeSong
	 * @returns {Song} The song that was played, or null if no song played
	 */
	play: function(song) {
		if (song) {
			this.change(song);
		}

		if (!this.activeSong) {
			return null;
		}

		this.isPlaying = true;
		this.activeSong.play();
		this.render();
		return this.activeSong;
	},

	/**
	 * Pauses a song, if one is playing. Otherwise, it's a no-op.
	 * @returns {Song} The song that was paused, or null if no song played
	 */
	pause: function() {
		if (!this.activeSong) {
			return null;
		}

		this.isPlaying = false;
		this.activeSong.pause();
		this.render();
		return this.activeSong;
	},

	/**
	 * Stops the song, and sets its playing progress to zero. If no activeSong,
	 * it's a no-op.
	 * @returns {Song} The song that was stopped, or null if no song played
	 */
	stop: function() {
		if (!this.activeSong) {
			return false;
		}

		this.activeSong.stop();
		this.isPlaying = false;
		this.render();
		return this.activeSong;
	},

	/**
	 * Changes the currently active song, and stops the previous one if there was
	 * one.
	 * @param {Song} song - The new Song to be activeSong
	 * @returns {Song} The passed song param
	 */
	change: function(song) {
		if (this.activeSong) {
			this.activeSong.stop();
		}

		this.activeSong = song;
		this.render();
		return this.activeSong;
	},

	/**
	 * Skips the current song in a direction. Can skip forwards, or backwards.
	 * @param {number} direction - Positive or negative number indicating how many to skip
	 * @returns {Song} Returns the new activeSong
	 */
	skip: function(direction) {
		if (!this.activeSong) {
			return false;
		}

		// Find the current song's index
		var idx = this.songs.indexOf(this.activeSong);

		// Set the desired index by adding the direction, and limiting it to the
		// length of the array using a modulous operator
		var desiredIndex = (idx + direction) % this.songs.length;

		// Change to the desired song
		return this.change(this.songs[desiredIndex]);
	},

	/**
	 * Shuffle the order of music.
	 */
	shuffle: function() {
		console.log("Jukebox is shuffleing");
	},

	/**
	 * Given a file and some info, add a new song.
	 * @param {string} file - Relative path, URL, or data blob string for the song
	 * @param {object} meta - Information about the song
	 * @param {string} meta.title - Name of the song
	 * @param {string} meta.artist - Name of the artist
	 * @returns {Song} The newly made song
	 */
	addSong: function(file, meta) {
		var song = new Song(file, meta);
		this.songs.push(song);
		this.render();
		return song;
	},

	// volumeLevel should be a number between 0-100
	setVolume: function(volumeLevel) {
		this.volume = volumeLevel;
	},
};



/**
 * Song Class
 */
class Song {
	/**
	 * Create a new song
	 * @param {string} file - Relative path, URL, or data blob string for the song
	 * @param {object} meta - Information about the song
	 * @param {string} meta.title - Name of the song
	 * @param {string} meta.artist - Name of the artist
	 */
	constructor(file, meta) {
		this.file = file;
		this.meta = meta || {
			title: "Unknown title",
			artist: "Unknown artist",
		};
		this.audio = new Audio(file);
	}

	/**
	 * Render the song as markup.
	 * @returns {jQuery} The song, not added to the dom yet
	 */
	render() {
		var $song = $('<div class="jukebox-songs-song"></div>');
		$song.append('<div class="jukebox-songs-song-pic"></div>');
		$song.append('<div class="jukebox-songs-song-title">' + this.meta.title + '</div>');
		$song.append('<div class="jukebox-songs-song-artist">' + this.meta.artist + '</div>');
		$song.append('<div class="jukebox-songs-song-duration">' + "3:22" + '</div>');
		$song.data("song", this);
		return $song;
	}

	/**
	 * Play the song.
	 */
	play() {
		this.audio.play();
	}

	/**
	 * Pause the song.
	 */
	pause() {
		this.audio.pause();
	}

	/**
	 * Stop the song, resetting it to the start.
	 */
	stop() {
		this.audio.pause();
		this.audio.currentTime = 0;
	}
}



$(document).ready(function() {
	Jukebox.start();
});
