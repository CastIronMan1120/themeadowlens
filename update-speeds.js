const fs = require('fs');
let schema = fs.readFileSync('src/sanity/schema/homepage.js', 'utf8');

// Replace the single tickerSpeed with two separate speed controls
schema = schema.replace(/\{[\s]*name:\s*'tickerSpeed'[\s\S]*?validation:[\s\S]*?\},/g, `    {
      name: 'featuredTickerSpeed',
      title: 'Featured Ticker Speed (Seconds)',
      type: 'number',
      description: 'How many seconds it takes for the FEATURED WORKS ticker to complete one loop. Default is 120.',
      initialValue: 120,
      validation: (Rule) => Rule.min(10).max(300)
    },
    {
      name: 'newTickerSpeed',
      title: 'What\\'s New Ticker Speed (Seconds)',
      type: 'number',
      description: 'How many seconds it takes for the WHAT\\'S NEW ticker to complete one loop. Default is 100.',
      initialValue: 100,
      validation: (Rule) => Rule.min(10).max(300)
    },`);

fs.writeFileSync('src/sanity/schema/homepage.js', schema);
