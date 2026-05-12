function sanitizeFileName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("read-error"));
    reader.readAsDataURL(file);
  });
}

export function compressImageFile(file, maxSize = 820, quality = 0.88) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const ratio = Math.min(maxSize / image.width, maxSize / image.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * ratio));
        canvas.height = Math.max(1, Math.round(image.height * ratio));

        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("blob-error"));
              return;
            }

            const stem = sanitizeFileName(file.name.replace(/\.[^.]+$/, "")) || "avatar";
            const optimizedFile = new File([blob], `${stem}.jpg`, {
              type: "image/jpeg",
            });

            resolve(optimizedFile);
          },
          "image/jpeg",
          quality,
        );
      };
      image.onerror = () => reject(new Error("image-error"));
      image.src = reader.result;
    };
    reader.onerror = () => reject(new Error("read-error"));
    reader.readAsDataURL(file);
  });
}

export function buildStorageFilePath(prefix, fileName) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const cleanName = sanitizeFileName(fileName) || "asset";
  return `${prefix}/${timestamp}-${cleanName}`;
}
