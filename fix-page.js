const fs = require('fs');
let page = fs.readFileSync('src/app/(frontend)/page.js', 'utf8');
page = page.replace(/\*\[_type == "homepage"\]\[0\] \{`n    welcomeHeadline,`n    welcomeText,`n    quote,`n    tickerSpeed,`n    "featuredPhotos": featuredArtworks\[\]->\{_id, title, slug, "url": image.asset->url, "imageUrl": image.asset->url\},`n    "heroImageUrl": heroImage.asset->url`n  \}/g, `*[_type == "homepage"][0] {
    welcomeHeadline,
    welcomeText,
    quote,
    tickerSpeed,
    "featuredPhotos": featuredArtworks[]->{_id, title, slug, "url": image.asset->url, "imageUrl": image.asset->url},
    "heroImageUrl": heroImage.asset->url
  }`);
fs.writeFileSync('src/app/(frontend)/page.js', page);
