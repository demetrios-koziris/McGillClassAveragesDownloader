//jshint esversion: 6


chrome.runtime.onInstalled.addListener(function (details) {

	let currentVersion = chrome.runtime.getManifest().version;

	if (details.reason === "install") {
		console.log("Installed McGill Class Averages Downloader version " + currentVersion);
		chrome.tabs.create({url: "https://demetrios-koziris.github.io/McGillClassAveragesDownloader"}, function (tab) {
			console.log("New tab launched with https://demetrios-koziris.github.io/McGillClassAveragesDownloader");
		});
	}
	else if (details.reason === "update") {
		let previousVersion = details.previousVersion;
		console.log("Updated McGill Class Averages Downloader from version " + previousVersion + " to version " + currentVersion);
	}
	
	chrome.runtime.onUpdateAvailable.addListener(function(details) {
	  console.log("Ready to update to version " + details.version);
	  chrome.runtime.reload();
	});
});


// If default popup not set in manifest, clicking the extension icon will load the following page
chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.create({'url': "https://demetrios-koziris.github.io/McGillClassAveragesDownloader/", 'selected': true});
});