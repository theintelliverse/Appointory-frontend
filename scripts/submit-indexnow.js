// IndexNow Submission Utility for Appointory
// Automatically submits all canonical URLs to IndexNow (Bing, Yandex, Seznam, Naver)
// Run with: node scripts/submit-indexnow.js

const INDEXNOW_KEY = '3a5e8c1094f6479bb7e10df2bc983a04';
const HOST = 'appointory.in';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

const URLS = [
    `https://${HOST}/`,
    `https://${HOST}/features/queue-management`,
    `https://${HOST}/features/token-display-tv`,
    `https://${HOST}/features/gst-billing`,
    `https://${HOST}/features/lab-network`,
    `https://${HOST}/features/digital-prescription`,
    `https://${HOST}/for/clinics`,
    `https://${HOST}/for/doctors`,
    `https://${HOST}/for/labs`,
    `https://${HOST}/pricing`,
    `https://${HOST}/blog`,
    `https://${HOST}/compare/appointory-vs-practo`,
    `https://${HOST}/clinic-software/ahmedabad`,
    `https://${HOST}/clinic-software/surat`,
    `https://${HOST}/clinic-software/vadodara`,
    `https://${HOST}/clinic-software/rajkot`,
    `https://${HOST}/clinic-software/mumbai`,
    `https://${HOST}/clinic-software/delhi`,
    `https://${HOST}/clinic-software/bengaluru`,
    `https://${HOST}/clinic-software/pune`,
    `https://${HOST}/about`,
    `https://${HOST}/press`,
    `https://${HOST}/links`
];

async function submitIndexNow() {
    console.log(`📡 Submitting ${URLS.length} URLs to IndexNow API for ${HOST}...`);
    try {
        const payload = {
            host: HOST,
            key: INDEXNOW_KEY,
            keyLocation: KEY_LOCATION,
            urlList: URLS
        };

        const response = await fetch('https://api.indexnow.org/indexnow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok || response.status === 200 || response.status === 202) {
            console.log(`✅ IndexNow Submission Successful! (HTTP ${response.status})`);
            console.log(`Bing & IndexNow search engines notified for instantaneous indexing.`);
        } else {
            console.log(`⚠️ IndexNow response status: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.log(`Details: ${text}`);
        }
    } catch (error) {
        console.error(`❌ Failed to submit to IndexNow:`, error.message);
    }
}

submitIndexNow();
