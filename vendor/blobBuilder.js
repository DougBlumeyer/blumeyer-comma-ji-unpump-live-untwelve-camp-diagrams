var getFileBlob = function (url, cb) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.responseType = "blob";
	xhr.addEventListener('load', function() {
		cb(xhr.response);
	});
  xhr.send();
};

var blobToFile = function (blob, name) {
  blob.lastModifiedDate = new Date();
  blob.name = name;
  return blob;
};

getFileObject = function(filePathOrUrl, cb) {
  getFileBlob(filePathOrUrl, function (blob) {
    cb(blobToFile(blob, 'song.csv'));
  });
};
