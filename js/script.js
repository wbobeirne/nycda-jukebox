/* globals $ */

/**
 * JUKEBOX SINGLETON
 */
var Jukebox = {
	songs: [],
	activeSong: null,
	volume: 100,
	isPlaying: false,
	dom: {},

	// Run this function to kick the whole thing off
	start: function() {
		// Grab the dom elements
		this.dom = {
			play: $(".jukebox-controls-play"),
			stop: $(".jukebox-controls-stop"),
			next: $(".jukebox-controls-next"),
			prev: $(".jukebox-controls-previous"),
			mute: $(".jukebox-controls-mute"),
			upload: $(".jukebox-header-upload"),
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

			for (var i = 0; i < files.length; i++) {
				var file = URL.createObjectURL(files[i]);
				this.addSong(file, {
					title: "Uploaded song",
					artist: "Unknown",
				});
			}
		}.bind(this));
	},

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

	play: function(song) {
		if (song) {
			this.change(song);
		}

		if (!this.activeSong) {
			return false;
		}

		this.isPlaying = true;
		this.activeSong.play();
		this.render();
		return this.activeSong;
	},

	pause: function() {
		if (!this.activeSong) {
			return false;
		}

		this.isPlaying = false;
		this.activeSong.pause();
		this.render();
		return this.activeSong;
	},

	stop: function() {
		if (!this.activeSong) {
			return false;
		}

		this.activeSong.stop();
		this.isPlaying = false;
		this.render();
		return this.activeSong;
	},

	change: function(song) {
		if (this.activeSong) {
			this.activeSong.stop();
		}

		this.activeSong = song;
		this.render();
		return this.activeSong;
	},

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

	shuffle: function() {
		console.log("Jukebox is shuffleing");
	},

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
 * SONG CLASS
 */
class Song {
	constructor(file, meta) {
		this.file = file;
		this.meta = meta || {
			title: "Unknown title",
			artist: "Unknown artist",
		};
		this.audio = new Audio(file);
	}

	render() {
		var $song = $('<div class="jukebox-songs-song"></div>');
		$song.append('<div class="jukebox-songs-song-pic"></div>');
		$song.append('<div class="jukebox-songs-song-title">' + this.meta.title + '</div>');
		$song.append('<div class="jukebox-songs-song-artist">' + this.meta.artist + '</div>');
		$song.append('<div class="jukebox-songs-song-duration">' + "3:22" + '</div>');
		$song.data("song", this);
		return $song;
	}

	play() {
		this.audio.play();
	}

	pause() {
		this.audio.pause();
	}

	stop() {
		this.audio.pause();
		this.audio.currentTime = 0;
	}
}



$(document).ready(function() {
	Jukebox.start();
});
