const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadToCloudinary = async (file, path) => {
  return new Promise((resolve, reject) => {
    if (file) {
      cloudinary.v2.uploader
        .upload_stream({ folder: path }, (error, res) => {
          if (error) {
            console.log(error);
            reject(error);
          } else {
            console.log(`Upload succeed: ${res}`);
            resolve(res);
          }
        })
        .end(file);
    }
  });
};
 
 
exports.removeFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  try {
    const result = await cloudinary.v2.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error(`Failed to remove image ${publicId} from Cloudinary: ${error.message}`);
    return null;
  }
};