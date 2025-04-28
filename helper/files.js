
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({ 
    cloud_name: 'dscjjaxtk', 
    api_key: '851373697286344', 
    api_secret: 'h0QdFRcrRRxGk2sbfJ8wfsjIh1Q' 
  });

module.exports = {
    uploadImage: async (imageBuffer) => {
        try {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'user-profile-pics' }, 
                    (error, result) => {
                        if (error) {
                            console.error(error);
                            reject(error);
                        } else {
                            resolve(result.secure_url);
                        }
                    }
                );
                streamifier.createReadStream(imageBuffer).pipe(uploadStream);
            });
        } catch (error) {
            console.error(error);
            throw new Error("Something went wrong while uploading image!");
        }
    },
};