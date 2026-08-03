const { Detail } = require("../models/Detail");
const { uploadBufferToCloudinary, isCloudinaryConfigured } = require("./cloudinary");

/**
 * Automatically migrates existing base64 images in MongoDB to Cloudinary CDN URLs.
 * Runs in the background on server start.
 */
const runImageMigration = async () => {
  try {
    if (!isCloudinaryConfigured()) {
      console.log("Cloudinary is not configured. Skipping database image migration.");
      return;
    }

    console.log("Starting background migration of base64 images to Cloudinary...");
    // Find all products that have at least one file with non-url base64 data
    const items = await Detail.find({
      "files.data": { $exists: true, $ne: "" },
    });

    let migratedCount = 0;

    for (const item of items) {
      let isModified = false;
      const updatedFiles = [];

      for (const file of item.files) {
        const fileObj = file.toObject ? file.toObject() : file;
        
        // If the data exists and is a base64 string (does not start with http/https)
        if (
          fileObj.data &&
          !fileObj.data.startsWith("http://") &&
          !fileObj.data.startsWith("https://")
        ) {
          try {
            let base64Data = fileObj.data;
            // Strip data URL prefix if present (e.g., "data:image/jpeg;base64,")
            if (base64Data.startsWith("data:")) {
              const commaIndex = base64Data.indexOf(",");
              if (commaIndex !== -1) {
                base64Data = base64Data.substring(commaIndex + 1);
              }
            }
            
            const buffer = Buffer.from(base64Data, "base64");
            const cdnResult = await uploadBufferToCloudinary(buffer, {
              folder: "ecommerce_products_migrated",
            });

            fileObj.url = cdnResult.secure_url;
            fileObj.data = cdnResult.secure_url; // Replace heavy base64 data with short CDN URL
            fileObj.public_id = cdnResult.public_id;
            isModified = true;
          } catch (uploadError) {
            console.error(
              `Failed to migrate file for product ID ${item.id || item._id}:`,
              uploadError.message
            );
          }
        }
        updatedFiles.push(fileObj);
      }

      if (isModified) {
        await Detail.updateOne(
          { _id: item._id },
          { $set: { files: updatedFiles } }
        );
        migratedCount++;
      }
    }

    if (migratedCount > 0) {
      console.log(`Database image migration completed. Migrated ${migratedCount} products successfully.`);
    } else {
      console.log("No legacy base64 images found to migrate.");
    }
  } catch (err) {
    console.error("Error during database image migration:", err);
  }
};

module.exports = {
  runImageMigration,
};
