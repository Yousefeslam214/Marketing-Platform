
const fs = require('fs');
const path = require('path');

const enPath = '/media/yousef/work1/CODE/octopus replit/DocuChatAI/client/src/locales/en.json';
const arPath = '/media/yousef/work1/CODE/octopus replit/DocuChatAI/client/src/locales/ar.json';

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

function getKeys(obj, prefix = '') {
    let keys = [];
    for (const key in obj) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            keys = keys.concat(getKeys(obj[key], newKey));
        } else {
            keys.push(newKey);
        }
    }
    return keys;
}

const enKeys = getKeys(en);
const arKeys = getKeys(ar);

const missingInAr = enKeys.filter(key => !arKeys.includes(key));
const missingInEn = arKeys.filter(key => !enKeys.includes(key));

console.log('Missing in AR:', missingInAr);
console.log('Missing in EN:', missingInEn);
