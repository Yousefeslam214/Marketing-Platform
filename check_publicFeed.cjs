
const fs = require('fs');
const en = JSON.parse(fs.readFileSync('/media/yousef/work1/CODE/octopus replit/DocuChatAI/client/src/locales/en.json', 'utf8'));
const ar = JSON.parse(fs.readFileSync('/media/yousef/work1/CODE/octopus replit/DocuChatAI/client/src/locales/ar.json', 'utf8'));

console.log("EN publicFeed:", en.publicFeed);
console.log("AR publicFeed:", ar.publicFeed);
