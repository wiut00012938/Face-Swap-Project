
(function() {
    var streaming = false;
    var video = null;
    var canvas = null;
    var photo = null;
    var startbutton = null;
    var countdownDisplay = null;
    var playBtn = document.getElementById('playBtn');

    function startup() {
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        photo = document.getElementById('photo');
        startbutton = document.getElementById('startbutton');
        countdownDisplay = document.getElementById('countdown');
		startbutton.style.display = "block"
		playBtn.style.display = "none"
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
                // Use the parent div's dimensions
                var parentDiv = video.parentElement;
                var parentWidth = parentDiv.offsetWidth;
                var parentHeight = parentDiv.offsetHeight;

                // Set video dimensions dynamically
                video.setAttribute('width', parentWidth);
                video.setAttribute('height', parentHeight);

                // Set canvas dimensions dynamically
                canvas.setAttribute('width', parentWidth);
                canvas.setAttribute('height', parentHeight);

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
				toggleCameraOutput();
			}
		}

		updateCountdown();
	}

	function toggleCameraOutput() {
		var cameraElements = document.querySelectorAll('.camera');
		var outputElements = document.querySelectorAll('.output');
		var swapbutton = document.getElementById('generateButton');
		cameraElements.forEach(function(element) {
			element.style.display = 'none';
		});
	
		outputElements.forEach(function(element) {
			element.style.display = 'flex';
		});
		swapbutton.style.visibility = 'visible'
	}
	document.getElementById("retake").addEventListener("click", function () {
		var cameraElements = document.querySelectorAll('.camera');
		var outputElements = document.querySelectorAll('.output');
		var swapbutton = document.getElementById('generateButton');
		cameraElements.forEach(function(element) {
			element.style.display = 'block';
		});
	
		outputElements.forEach(function(element) {
			element.style.display = 'none';
		});
		swapbutton.style.visibility = 'hidden'
		deletePhotoOnServer(photo.src);

	})
	function takepicture() {
		var context = canvas.getContext('2d');
		var parentDiv = video.parentElement;
		var parentWidth = parentDiv.offsetWidth;
		var parentHeight = parentDiv.offsetHeight;
	
		if (parentWidth && parentHeight) {
			canvas.width = parentWidth;
			canvas.height = parentHeight;
			context.drawImage(video, 0, 0, parentWidth, parentHeight);
	
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



var restartButton = document.getElementById('finish');

// Add an event listener to the button
restartButton.addEventListener('click', function() {
    // Reload the website when the button is clicked
    window.location.reload();
});












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
	const targetImage = "https://book-club-2og7.onrender.com/static/images/" + Target_Image

    var section4 = document.getElementById('section4');
	section4.scrollIntoView({ behavior: 'smooth' });
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

	if (generatedImageUrl){
		document.getElementById("resultImage").src = generatedImageUrl;
		document.getElementById("load-animation").style.display = 'none';
		document.getElementById("resultImage").style.display = 'block'
		document.getElementById("options").style.display = 'flex'
	}
	else{
		window.alert("Swap and target images are required.")
	}

})

window.addEventListener('beforeunload', function () {
    // Call your cleanup function here
	if (photo !== null){
		deletePhotoOnServer(photo.src);
	}
});

function deletePhotoOnServer(photoUrl) {
    fetch('/deletePhoto', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: photoUrl }),
    })
    .then(response => {
        if (response.ok) {
            console.log('Photo deleted successfully on the server');
        } else {
            console.error('Failed to delete photo on the server');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


document.addEventListener('DOMContentLoaded', function () {
    var exportButton = document.getElementById('export');
    var qrOverlay = document.getElementById('qrOverlay');
    var qrCodeImage = document.getElementById('qrCodeImage');
    var doneButton = document.getElementById('doneButton');
    var resultImage = document.getElementById('resultImage');

    exportButton.addEventListener('click', function () {
        // Get the src URL of the result image
        var imageUrl = resultImage.src;

        // Generate the QR code using Google Charts API
        var qrCodeUrl = 'https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=' + encodeURIComponent(imageUrl);

        // Set the QR code image source
        qrCodeImage.src = qrCodeUrl;

        // Show the overlay
        qrOverlay.style.display = 'block';
    });

    doneButton.addEventListener('click', function () {
        // Hide the overlay when "Done" is clicked
        qrOverlay.style.display = 'none';
    });
});