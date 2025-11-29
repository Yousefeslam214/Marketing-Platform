
const fs = require('fs');
const ar = JSON.parse(fs.readFileSync('/media/yousef/work1/CODE/octopus replit/DocuChatAI/client/src/locales/ar.json', 'utf8'));
console.log(JSON.stringify(ar.adDetail, null, 2));
