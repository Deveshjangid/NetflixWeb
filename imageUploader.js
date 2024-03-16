const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary with your credentials
cloudinary.config({ 
    cloud_name: 'dfcud9z8j', 
    api_key: '921439417694284', 
    api_secret: 'QPde2BytiBVANxzQJsLtV5xI2DA' 
  });
  

// Array to store uploaded image URLs
const imagePaths = [
  './user-profile-icon-2.png',
  './user-profile-icon-3.jpg',
  './user-profile-icon-4.webp',
  './user-profile-icon-5.webp',
  './user-profile-icon.png'
];

// Array to store uploaded image URLs
const uploadedImageURLs = [];

// Function to upload images to Cloudinary
const uploadImages = () => {
  // Loop through the imagePaths array and upload each image
  for (const imagePath of imagePaths) {
    cloudinary.uploader.upload(imagePath, (error, result) => {
      if (error) {
        console.error('Error uploading image:', error);
      } else {
        console.log('Image uploaded successfully. Public URL:', result.url);
        uploadedImageURLs.push(result.url);

        // Check if all images have been uploaded
        if (uploadedImageURLs.length === imagePaths.length) {
          // Do something with the uploadedImageURLs array (e.g., send it to the client)
          console.log('All images uploaded:', uploadedImageURLs);
        }
      }
    });
  }
};

// Export the uploadImages function
module.exports = {
  uploadImages
};
