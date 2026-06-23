/* eslint-disable */
const fs = require('fs');
const https = require('https');
const path = require('path');

const publicImagesDir = path.join(__dirname, 'public', 'images');

if (!fs.existsSync(publicImagesDir)){
    fs.mkdirSync(publicImagesDir, { recursive: true });
}

const imagesToDownload = [
    { url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80', filename: 'kyoto.jpg' },
    { url: 'https://images.unsplash.com/photo-1559103986-eab52cb10263?auto=format&fit=crop&w=1600&q=80', filename: 'lake-como.jpg' },
    { url: 'https://images.unsplash.com/photo-1643900223789-5f252cfb2a26?auto=format&fit=crop&w=1600&q=80', filename: 'cappadocia.jpg' },
    { url: 'https://images.unsplash.com/photo-1523365280197-f1c54817a353?auto=format&fit=crop&w=1600&q=80', filename: 'tuscany.jpg' },
    { url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1600&q=80', filename: 'swiss-alps.jpg' },
    
    { url: 'https://images.unsplash.com/photo-1506377585622-bedcbb027afc?auto=format&fit=crop&w=1400&q=80', filename: 'journey-scotland.jpg' },
    { url: 'https://images.unsplash.com/photo-1486911278844-a81c5267e227?auto=format&fit=crop&w=1400&q=80', filename: 'journey-fife.jpg' },
    { url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1400&q=80', filename: 'journey-crail.jpg' },

    { url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80', filename: 'how-main.jpg' },
    { url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80', filename: 'how-small.jpg' }
];

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                   .on('error', reject)
                   .once('close', () => resolve(filepath));
            } else {
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        }).on('error', reject);
    });
}

async function run() {
    for (const img of imagesToDownload) {
        const filepath = path.join(publicImagesDir, img.filename);
        try {
            await downloadImage(img.url, filepath);
            console.log(`Downloaded ${img.filename}`);
        } catch (e) {
            console.error(`Error downloading ${img.filename}: ${e.message}`);
        }
    }
}

run();
