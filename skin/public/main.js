(function() {
window.addEventListener('load',onload);
function onload() {
	var images = document.getElementsByTagName('img');
	for(var i=0;i<images.length;i++) {
		images[i].addEventListener('click',onimageclick);
	}
}
function onimageclick() {
	var backdrop = document.createElement('div');
	backdrop.className = 'backdrop';
	var centertable = document.createElement('table');
	var centercell = document.createElement('td');
	var img = document.createElement('img');
	img.src = this.src;

	centercell.appendChild(img);
	centertable.appendChild(centercell);
	backdrop.appendChild(centertable);
	document.body.appendChild(backdrop);

	img.addEventListener('click',close);
	centercell.addEventListener('click',close);

	function close() {
		if (!backdrop.parentNode) { return; }
		backdrop.parentNode.removeChild(backdrop);
	}
}
})();