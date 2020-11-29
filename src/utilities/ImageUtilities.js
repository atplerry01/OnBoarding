export const previewImage = (fieldId, previewBoxId) => {
  const previewBox = document.getElementById(previewBoxId);
  while (previewBox.firstChild) previewBox.removeChild(previewBox.firstChild);

  const { files } = document.getElementById(fieldId);
  const img = document.createElement('img');

  if (files[0] !== undefined) {
    img.src = URL.createObjectURL(files[0]);
    previewBox.appendChild(img);
  }
};

export const convertImgToBase64 = (inputFile) => {
  if (inputFile === undefined) return '';
  const file = new FileReader();

  return new Promise((resolve, reject) => {
    file.onerror = () => {
      file.abort();
      reject(new DOMException("Problem parsing input file."));
    };

    file.onload = () => {
      resolve(file.result);
    };
    file.readAsDataURL(inputFile);
  });
};

export const getBase64ImageFromUrl = async (imageUrl) => {
  var res = await fetch(imageUrl);
  console.log(res);
  var blob = await res.blob();

  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.addEventListener("load", () => {
      resolve(reader.result);
    }, false);

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(blob);
  });
};
