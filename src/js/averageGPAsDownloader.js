//jshint esversion: 6


var url = window.location.href;

let devMode = !('update_url' in chrome.runtime.getManifest());
let logForDebug = ( devMode ? console.log.bind(window.console) : function(){} );
logForDebug("McGill Class Averages Downloader Debug mode is ON");

if (url.match(/.+demetrios\-koziris\.github\.io\/McGillClassAveragesDownloader/)) {

	let requiresParagraph = document.getElementById('requires-extension');
	requiresParagraph.style.display = 'none';
	let downloadButton = document.getElementById('mcad-avegpa-download');
	downloadButton.style.display = 'inline';

	averageGPAsDownloader();
}


function averageGPAsDownloader() {

	const notloggedinMessage = 'You must be already signed in to Minvera in order to use this feature. Please sign in and then return to this page.';
	const errorMessage = 'McGill Class Averages Downloader encountered an error while trying to download the average GPAs from your transcript.';
	const minervaLogin = 'https://horizon.mcgill.ca/pban1/twbkwbis.P_WWWLogin';
	const transriptURL = 'https://horizon.mcgill.ca/pban1/bzsktran.P_Display_Form?user_type=S&tran_type=V';

	//Define function to execute when downloadAveGPAs event dispactched

	document.addEventListener('downloadAveGPAs', function(data) {

	 	const xmlRequestInfo = {
			method: 'GET',
			action: 'xhttp',
			url: transriptURL
		};
		logForDebug(xmlRequestInfo);

		chrome.runtime.sendMessage(xmlRequestInfo, function(data) {
			try {
				htmlParser = new DOMParser();
				htmlDoc = htmlParser.parseFromString(data.responseXML, 'text/html');
				logForDebug(htmlDoc);

				infotext = htmlDoc.getElementsByClassName('infotext')[0].innerText.trim(" ");
				// logForDebug(infotext);

				if (infotext.includes('Please select one of the following login methods.')) {
					redirect(notloggedinMessage, minervaLogin);
				}
				else {
					let transcript = htmlDoc.getElementsByClassName('dataentrytable')[1].rows;
					logForDebug(transcript);
					let aveGPAs = [];
					let term = "";

					for (let r = 0; r < transcript.length; r++) {
						let cols = transcript[r].getElementsByClassName('fieldmediumtext');
						if (cols.length === 1) {
							let termMatch = cols[0].innerHTML.match(/\<b\>(Fall|Winter|Summer)\&nbsp\;20([0-9]{2})\<\/b\>/);
							if (termMatch) {
								term = termMatch[1][0] + termMatch[2];
								logForDebug(term);
							}
						}
						else if (cols.length === 8 || cols.length === 7) {
							if (cols[cols.length-1].innerText.match(/[ABCDF+-]/)) {
								let course = cols[0].innerText.split(" ");
								aveGPAs.push([course[0], course[1], cols[cols.length-1].innerText, term, cols[3].innerText]);
							}
						} 
					}
					logForDebug(aveGPAs);
					let csvString = arrayToCSV(aveGPAs);
					let a = document.createElement('a');
					a.href = 'data:attachment/csv,' +  encodeURIComponent(csvString);
					a.target = '_blank';
					a.download = 'averageGPAs.csv';
					document.body.appendChild(a);
					a.click();
				}
			}
			catch(err) {
				console.log(err.stack);
				redirect(errorMessage, transriptURL);
			}
		});

	});
}


function redirect(message, url) {
	alert(message);
	window.open(url, '_blank');
}


function arrayToCSV(rows) {
  var content = "";
  rows.forEach(function(row, index) {
    content += row.join(",") + "\n";
  });
  return content;
}