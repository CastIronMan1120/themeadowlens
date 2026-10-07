const fs = require('fs')
const file1 = 'src/app/api/auto-categorize/route.js'
let c1 = fs.readFileSync(file1, 'utf8')
c1 = c1.replace('models/gemini-1.5-flash-latest:generateContent', 'models/gemini-1.5-flash:generateContent')
fs.writeFileSync(file1, c1)
