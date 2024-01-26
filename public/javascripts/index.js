
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

	/*function takepicture() 
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
	}*/
	
	function takepicture() {
		var context = canvas.getContext('2d');
		if (width && height) {
			canvas.width = width;
			canvas.height = height;
			context.drawImage(video, 0, 0, width, height);
	
			// Convert the canvas data to a Blob
			canvas.toBlob(blob => {
				// Create a FormData object
				var formData = new FormData();
				formData.append('image', blob, 'image.png');
	
				// Make an HTTP POST request to the server to handle the file upload
				fetch('/upload', {
					method: 'POST',
					body: formData,
				})
					.then(response => response.json())
					.then(data => {
						// Update the 'src' attribute of the 'photo' element with the saved image path
						photo.setAttribute('src', data.imagePath);
					})
					.catch(error => console.error('Error:', error));
			}, 'image/png');
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
console.log('New link:', 'https://book-club-2og7.onrender.com/static/images/' + newLink);
}


//calling image generator
document.getElementById("generateButton").addEventListener("click", async () => {
	const SwapImage = document.getElementById('photo').src
	console.log(SwapImage)
	const targetImage = "https://book-club-2og7.onrender.com/static/images/" + Target_Image
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