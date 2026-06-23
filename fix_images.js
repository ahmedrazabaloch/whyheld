const fs = require("fs");
const path = require("path");

const publicImagesPath = path.join(__dirname, "public", "images");

// The fallback image required by ResilientImage
const placeholderPath = path.join(publicImagesPath, "placeholder-travel.jpg");

// Fallback logic for missing files
const mapping = {
  "placeholder-travel.jpg": "kyoto.jpg", 
  "lake-como.jpg": "journey-fife.jpg",
  "cappadocia.jpg": "journey-crail.jpg",
  "tuscany.jpg": "journey-scotland.jpg"
};

for (const [missing, source] of Object.entries(mapping)) {
  const missingPath = path.join(publicImagesPath, missing);
  const sourcePath = path.join(publicImagesPath, source);

  if (!fs.existsSync(missingPath)) {
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, missingPath);
      console.log(`✅ Created ${missing} from ${source}`);
    } else {
      console.error(`❌ Cannot create ${missing}: Source ${source} not found.`);
    }
  } else {
    console.log(`✅ ${missing} already exists.`);
  }
}
