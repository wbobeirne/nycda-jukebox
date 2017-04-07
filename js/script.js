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
		this.dom = {
			play: $(".jukebox-controls-play"),
			stop: $(".jukebox-controls-stop"),
			next: $(".jukebox-controls-next"),
			mute: $(".jukebox-controls-mute"),
			songs: $(".jukebox-songs"),
		};

		var initialSong = this.addSong("./songs/Zimbabwe.mp3");
		this.change(initialSong);

		this.render();
		this.listen();
	},

	listen: function() {
		this.dom.play.on("click", function() {
			this.play();
		}.bind(this));

		this.dom.mute.on("click", function() {
			this.setVolume(0);
		}.bind(this));

		this.dom.stop.on("click", this.stop.bind(this));
		this.dom.next.on("click", this.skip.bind(this));
	},

	render: function() {
		// Render song elements
		this.dom.songs.html("");
		for (var i = 0; i < this.songs.length; i++) {
			var $song = this.songs[i].render();
			this.dom.songs.append($song);
		}

		// Indicate paused vs played
		this.dom.play.toggleClass("isDisabled", this.isPlaying);
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
		console.log("Jukebox is pauseing");
	},

	stop: function() {
		console.log("Jukebox is stoping");
	},

	change: function(song) {
		if (this.activeSong) {
			this.activeSong.stop();
		}

		this.activeSong = song;
	},

	skip: function() {
		console.log("Jukebox is skipping");
	},

	shuffle: function() {
		console.log("Jukebox is shuffleing");
	},

	addSong: function(path) {
		var song = new Song(path);
		this.songs.push(song);
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
	constructor(file) {
		this.file = file;
		this.audio = new Audio(file);
	}

	render() {
		return $('<div class="jukebox-songs-song">' + this.file + '</div>');
	}

	play() {
		this.audio.play();
	}

	pause() {

	}

	stop() {

	}
}



$(document).ready(function() {
	Jukebox.start();
});
