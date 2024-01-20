
(function() {
	var width = 320;
	var height = 0;

	var streaming = false;

	var video = null;
	var canvas = null;
	var photo = null;
	var startbutton = null;
	var countdownDisplay = null;
	var playBtn = document.getElementById('playBtn');
	function startup() 
	{
		video = document.getElementById('video');
		canvas = document.getElementById('canvas');
		photo = document.getElementById('photo');
		startbutton = document.getElementById('startbutton');
		countdownDisplay = document.getElementById('countdown');
		navigator.mediaDevices.getUserMedia({
				video: true,
				audio: false
			})
			.then(function(stream) {
				video.srcObject = stream;
				video.play();
			})
			.catch(function(err) {
				console.log("An error occurred: " + err);
			});

		video.addEventListener('canplay', function(ev) {
			if (!streaming) {
				height = video.videoHeight / (video.videoWidth / width);

				if (isNaN(height)) {
					height = width / (4 / 3);
				}

				video.setAttribute('width', width);
				video.setAttribute('height', height);
				canvas.setAttribute('width', width);
				canvas.setAttribute('height', height);
				streaming = true;
			}
		}, false);

		startbutton.addEventListener('click', function(ev) {
			countdownAndCapture();
			ev.preventDefault();
		}, false);

		clearphoto();
	}

	function clearphoto() 
	{
		var context = canvas.getContext('2d');
		context.fillStyle = "#AAA";
		context.fillRect(0, 0, canvas.width, canvas.height);

		var data = canvas.toDataURL('image/png');
		photo.setAttribute('src', data);
	}

	function countdownAndCapture() 
	{
		var countdown = 5;

		function updateCountdown() {
			if (countdown > 0) {
				countdownDisplay.innerHTML = countdown;
				countdown--;
				setTimeout(updateCountdown, 1000);
			} else {
				countdownDisplay.innerHTML = "";
				takepicture();
			}
		}

		updateCountdown();
	}

	function takepicture() 
	{
		var context = canvas.getContext('2d');
		if (width && height) {
			canvas.width = width;
			canvas.height = height;
			context.drawImage(video, 0, 0, width, height);

			var data = canvas.toDataURL('image/png');
			photo.setAttribute('src', data);
		} else {
			clearphoto();
		}
	}

	//window.addEventListener('load', startup, false);
	playBtn.addEventListener('click', startup, false);
})();

// Select Target Image from provided
var Target_Image = null;
function selectImage(newLink, alt) {
var thumbnails = document.querySelectorAll('.thumbnail');
thumbnails.forEach(function(thumbnail) {
	thumbnail.classList.remove('selected-target');
});

var clickedImage = event.target;
clickedImage.classList.add('selected-target');

Target_Image = newLink;
console.log('New link:', 'http://localhost:3000' + newLink);
}


//calling image generator
document.getElementById("generateButton").addEventListener("click", async () => {
	const SwapImage = "https://static.tvtropes.org/pmwiki/pub/images/daemon_hotd4.png"
	const targetImage = "https://www.looper.com/img/gallery/why-house-of-the-dragons-king-viserys-targaryen-looks-so-familiar/l-intro-1661180672.jpg"
	await fetch("/setImages", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({swap: SwapImage, target: targetImage}),
	});

	await fetch("/generateImage");
	
	await new Promise(resolve => setTimeout(resolve, 5000));

	const response = await fetch("/getGeneratedImageUrl");
	const generatedImageUrl = await response.json();

	document.getElementById("resultImage").src = generatedImageUrl;

})
