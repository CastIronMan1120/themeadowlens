const https = require('https');
require('dotenv').config({ path: '.env.local' });

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const TOKEN = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_TOKEN;

// My SEO Brain generated this comprehensive, zero-cannibalization map.
const seoMap = {
  // ROOT CATEGORIES
  "Birds": {
    metaTitle: "Fine Art Bird Photography | The Meadow Lens",
    metaDescription: "Explore an exquisite collection of fine art bird photography featuring majestic raptors, colorful songbirds, and elegant waterfowl in their natural habitats.",
    keywords: ["Fine Art Bird Photography", "Bird Portraits", "Avian Photography"]
  },
  "Vistas, Landscapes and Scenes": {
    metaTitle: "Meadowlands Landscape Photography | The Meadow Lens",
    metaDescription: "Immerse yourself in stunning landscape photography showcasing the dramatic skylines, serene sunsets, and untamed beauty of the New Jersey Meadowlands.",
    keywords: ["Meadowlands Landscape Photography", "Scenic Vistas", "Nature Landscapes"]
  },
  "Fauna": {
    metaTitle: "Wildlife Photography Prints | The Meadow Lens",
    metaDescription: "Discover dramatic wildlife photography prints that bring the secret lives of wild animals into sharp, breathtaking focus for your home or gallery.",
    keywords: ["Wildlife Photography Prints", "Wild Animal Photography", "Nature Fauna"]
  },
  "Flora": {
    metaTitle: "Fine Art Botanical Photography | The Meadow Lens",
    metaDescription: "Browse our fine art botanical photography collection to bring the vibrant colors, intricate details, and delicate beauty of nature into your space.",
    keywords: ["Fine Art Botanical Photography", "Flower Prints", "Plant Photography"]
  },
  "Sky & Heavens": {
    metaTitle: "Sky and Astrophotography Prints | The Meadow Lens",
    metaDescription: "Gaze upwards with our mesmerizing sky and astrophotography collection, capturing the majestic beauty of the moon, stars, and dramatic weather events.",
    keywords: ["Sky and Astrophotography Prints", "Night Sky Photos", "Cloudscapes"]
  },
  "Captioned Works": {
    metaTitle: "Captioned Fine Art Photography | The Meadow Lens",
    metaDescription: "Enjoy our specially curated collection of captioned fine art photography, combining stunning imagery with thought-provoking context and storytelling.",
    keywords: ["Captioned Fine Art Photography", "Storytelling Photos", "Curated Art"]
  },
  "Wings of Man": {
    metaTitle: "Aviation Photography Prints | The Meadow Lens",
    metaDescription: "Experience the thrill of flight through our aviation photography prints, capturing the mechanical marvels of airplanes soaring through the skies.",
    keywords: ["Aviation Photography Prints", "Airplane Photos", "Flight Photography"]
  },
  "Video": {
    metaTitle: "Fine Art Nature Videography | The Meadow Lens",
    metaDescription: "Watch our exclusive fine art nature videography, bringing the dynamic movements of birds and wildlife to life in stunning high-definition sequences.",
    keywords: ["Fine Art Nature Videography", "Wildlife Videos", "Nature Cinema"]
  },

  // BIRDS SUBCATEGORIES
  "Birds of Prey": {
    metaTitle: "Birds of Prey Photography | The Meadow Lens",
    metaDescription: "Feel the raw power of nature with our intense birds of prey photography, showcasing hawks, falcons, and eagles captured in stunning mid-flight action.",
    keywords: ["Birds of Prey Photography", "Raptor Prints", "Eagle Photography"]
  },
  "Waterfowl": {
    metaTitle: "Waterfowl Photography Prints | The Meadow Lens",
    metaDescription: "Delight in our peaceful waterfowl photography prints, perfectly capturing the elegance of ducks, geese, and swans gliding across serene waters.",
    keywords: ["Waterfowl Photography Prints", "Duck Photography", "Swan Photos"]
  },
  "Shorebirds, Coastal Birds & Waders": {
    metaTitle: "Coastal Bird Photography | The Meadow Lens",
    metaDescription: "Wade into the wetlands with our coastal bird photography, featuring elegant herons, egrets, and sandpipers thriving along the water's edge.",
    keywords: ["Coastal Bird Photography", "Wading Bird Photos", "Heron Photography"]
  },
  "Bright and Colorful Songbirds": {
    metaTitle: "Colorful Songbird Photography | The Meadow Lens",
    metaDescription: "Brighten your walls with our colorful songbird photography, focusing on the vibrant plumage and delicate details of nature's most musical creatures.",
    keywords: ["Colorful Songbird Photography", "Bright Bird Prints", "Songbird Photos"]
  },
  "Woodpeckers & Tree Clingers": {
    metaTitle: "Woodpecker Photography Prints | The Meadow Lens",
    metaDescription: "Observe the fascinating behaviors of forest dwellers in our woodpecker photography prints, highlighting incredible tree-clinging agility.",
    keywords: ["Woodpecker Photography Prints", "Tree Clinger Photos", "Forest Birds"]
  },
  "Warblers": {
    metaTitle: "Warbler Bird Photography | The Meadow Lens",
    metaDescription: "Catch a glimpse of the energetic spring migration through our warbler bird photography, isolating these tiny, fast-moving gems in high resolution.",
    keywords: ["Warbler Bird Photography", "Spring Migration Photos", "Small Bird Prints"]
  },
  "Sparrows": {
    metaTitle: "Sparrow Bird Photography | The Meadow Lens",
    metaDescription: "Appreciate the subtle, intricate beauty of sparrows through our specialized fine art photography, elevating these common birds into breathtaking subjects.",
    keywords: ["Sparrow Bird Photography", "Sparrow Prints", "Subtle Bird Art"]
  },
  "Aerial Maneuvers and Acrobatics": {
    metaTitle: "Acrobatic Bird Photography | The Meadow Lens",
    metaDescription: "Witness gravity-defying flight through our acrobatic bird photography, freezing the fastest and most complex aerial maneuvers into spectacular still art.",
    keywords: ["Acrobatic Bird Photography", "Birds in Action", "Flight Maneuvers"]
  },
  "Mimicking Birds": {
    metaTitle: "Mockingbird and Mimic Photography | The Meadow Lens",
    metaDescription: "Discover the charismatic personalities of mockingbirds and catbirds in our mimic photography collection, capturing their bold and curious nature.",
    keywords: ["Mockingbird and Mimic Photography", "Catbird Prints", "Mimic Birds"]
  },
  "Ground foragers": {
    metaTitle: "Ground Foraging Bird Photography | The Meadow Lens",
    metaDescription: "Explore the quiet beauty of the forest floor with our ground foraging bird photography, showcasing robins and thrushes hunting in the underbrush.",
    keywords: ["Ground Foraging Bird Photography", "Forest Floor Birds", "Thrush Photos"]
  },
  "Insect Interceptors": {
    metaTitle: "Insect-Catching Bird Photography | The Meadow Lens",
    metaDescription: "Marvel at the precision of nature with our insect-catching bird photography, featuring flycatchers and swallows securing their mid-air meals.",
    keywords: ["Insect-Catching Bird Photography", "Flycatcher Prints", "Hunting Birds"]
  },
  "Marsh Birds": {
    metaTitle: "Marsh Bird Photography | The Meadow Lens",
    metaDescription: "Step into the reeds with our marsh bird photography, revealing the secretive lives of bitterns and rails hidden deep within the wetland ecosystems.",
    keywords: ["Marsh Bird Photography", "Wetland Bird Prints", "Secretive Birds"]
  },
  "Backyard and Bird Feeder": {
    metaTitle: "Backyard Bird Photography | The Meadow Lens",
    metaDescription: "Celebrate local wildlife with our backyard bird photography, transforming familiar feeder visitors into stunning, gallery-quality fine art portraits.",
    keywords: ["Backyard Bird Photography", "Feeder Bird Prints", "Local Wildlife"]
  },
  "Splish-Splash & Reflections": {
    metaTitle: "Bird Water Reflection Photography | The Meadow Lens",
    metaDescription: "Experience double the beauty in our bird water reflection photography, where vibrant bathing subjects are perfectly mirrored on calm, glassy surfaces.",
    keywords: ["Bird Water Reflection Photography", "Bathing Bird Photos", "Mirrored Birds"]
  },
  "Birds In Flight": {
    metaTitle: "Birds in Flight Photography | The Meadow Lens",
    metaDescription: "Capture the essence of freedom with our birds in flight photography, utilizing fast shutter speeds to freeze majestic wingspans against open skies.",
    keywords: ["Birds in Flight Photography", "Flying Bird Prints", "Wingspan Photos"]
  },
  "Thrushes": {
    metaTitle: "Thrush Bird Photography | The Meadow Lens",
    metaDescription: "Admire the speckled beauty and quiet grace of the thrush family through our focused fine art collection, highlighting their woodland habitats.",
    keywords: ["Thrush Bird Photography", "Woodland Thrush Prints", "Speckled Birds"]
  },
  "Crows, Ravens and Blackbirds": {
    metaTitle: "Corvid Photography Prints | The Meadow Lens",
    metaDescription: "Embrace the dark, mysterious intellect of crows, ravens, and blackbirds in our highly detailed corvid photography prints.",
    keywords: ["Corvid Photography Prints", "Crow Photos", "Raven Photography"]
  },
  "Vireos": {
    metaTitle: "Vireo Bird Photography | The Meadow Lens",
    metaDescription: "Find the hidden singers of the canopy in our exclusive vireo bird photography collection, capturing these elusive green and yellow songsters.",
    keywords: ["Vireo Bird Photography", "Canopy Bird Prints", "Elusive Songbirds"]
  },
  "Up Close and Personal": {
    metaTitle: "Macro Bird Photography | The Meadow Lens",
    metaDescription: "Get astonishingly near to your subjects with our macro bird photography, revealing the microscopic textures of feathers and intense avian gazes.",
    keywords: ["Macro Bird Photography", "Close-up Bird Prints", "Feather Textures"]
  },

  // SKY & HEAVENS SUBCATEGORIES
  "Sky & Clouds": {
    metaTitle: "Cloudscape Photography Prints | The Meadow Lens",
    metaDescription: "Look to the horizon with our sweeping cloudscape photography prints, turning dramatic cumulonimbus formations and painted skies into wall art.",
    keywords: ["Cloudscape Photography Prints", "Cloud Photos", "Dramatic Skyscapes"]
  },
  "The Moon": {
    metaTitle: "Lunar Photography Prints | The Meadow Lens",
    metaDescription: "Bring the cratered glow of the night into your home with our high-resolution lunar photography prints, capturing the moon in all its phases.",
    keywords: ["Lunar Photography Prints", "Moon Photos", "High-Res Moon Prints"]
  },
  "Sun & Stars": {
    metaTitle: "Solar and Stellar Photography | The Meadow Lens",
    metaDescription: "Experience the brilliance of the cosmos with our solar and stellar photography, capturing the blinding beauty of our sun and distant starfields.",
    keywords: ["Solar and Stellar Photography", "Starfield Prints", "Sun Photos"]
  },
  "Astrological Events": {
    metaTitle: "Astrophotography Event Prints | The Meadow Lens",
    metaDescription: "Commemorate rare celestial moments with our astrophotography event prints, documenting eclipses, meteor showers, and planetary alignments.",
    keywords: ["Astrophotography Event Prints", "Eclipse Photos", "Celestial Events"]
  },

  // VISTAS SUBCATEGORIES
  "Sunsets": {
    metaTitle: "Golden Hour Landscape Prints | The Meadow Lens",
    metaDescription: "Transform your living space with our golden hour landscape prints, featuring radiant sunsets and glowing horizons captured across the Meadowlands.",
    keywords: ["Golden Hour Landscape Prints", "Sunset Photography", "Glowing Horizons"]
  },
  "City Skylines": {
    metaTitle: "Urban Skyline Photography | The Meadow Lens",
    metaDescription: "Bridge the gap between nature and civilization with our urban skyline photography, showcasing the majestic architecture of the nearby metropolis.",
    keywords: ["Urban Skyline Photography", "Cityscape Prints", "Metropolis Photos"]
  },
  "Landscapes": {
    metaTitle: "Scenic Landscape Photography | The Meadow Lens",
    metaDescription: "Bring the outdoors inside with our scenic landscape photography, preserving the vast, untouched serenity of natural environments.",
    keywords: ["Scenic Landscape Photography", "Outdoor Landscape Prints", "Serene Nature"]
  },
  "Parks & Trails": {
    metaTitle: "Nature Trail Photography | The Meadow Lens",
    metaDescription: "Wander the winding paths of our nature trail photography collection, inviting the peaceful, grounding energy of local parks into your home.",
    keywords: ["Nature Trail Photography", "Park Landscapes", "Woodland Paths"]
  },
  "Wooden Bridges": {
    metaTitle: "Rustic Bridge Photography | The Meadow Lens",
    metaDescription: "Cross over into tranquility with our rustic bridge photography, featuring charming wooden structures nestled deep within lush green forests.",
    keywords: ["Rustic Bridge Photography", "Wooden Bridge Prints", "Forest Architecture"]
  },
  "Bird Flocks": {
    metaTitle: "Bird Flock Photography Prints | The Meadow Lens",
    metaDescription: "Witness the mesmerizing patterns of mass migration in our bird flock photography prints, capturing thousands of silhouettes against the sky.",
    keywords: ["Bird Flock Photography Prints", "Flock Silhouettes", "Mass Migration Photos"]
  },
  "Snowscapes": {
    metaTitle: "Winter Snowscape Photography | The Meadow Lens",
    metaDescription: "Feel the crisp chill of winter through our striking snowscape photography, turning frozen lakes and snow-dusted trees into monochrome masterpieces.",
    keywords: ["Winter Snowscape Photography", "Frozen Landscape Prints", "Snowy Nature"]
  },
  "Bodies of Water": {
    metaTitle: "Water Landscape Photography | The Meadow Lens",
    metaDescription: "Find your calm with our water landscape photography, featuring the meditative stillness of hidden lakes, rushing rivers, and vast oceans.",
    keywords: ["Water Landscape Photography", "Lake Prints", "River Photos"]
  },
  "Weather Scenes": {
    metaTitle: "Dramatic Weather Photography | The Meadow Lens",
    metaDescription: "Embrace the fury of the elements with our dramatic weather photography, catching the awe-inspiring power of incoming storms and lightning strikes.",
    keywords: ["Dramatic Weather Photography", "Storm Prints", "Lightning Photos"]
  },
  "Environment": {
    metaTitle: "Environmental Nature Photography | The Meadow Lens",
    metaDescription: "Celebrate the interconnected beauty of our world with our environmental nature photography, focusing on complex and thriving ecosystems.",
    keywords: ["Environmental Nature Photography", "Ecosystem Prints", "Nature Habitats"]
  },

  // FAUNA & INSECTS SUBCATEGORIES
  "Insects": {
    metaTitle: "Macro Insect Photography | The Meadow Lens",
    metaDescription: "Delve into the hidden world of macro insect photography, where vibrant butterflies, bees, and delicate pollinators are captured in extraordinary detail.",
    keywords: ["Macro Insect Photography", "Bug Prints", "Detailed Insect Photos"]
  },
  "Aquatic": {
    metaTitle: "Aquatic Wildlife Photography | The Meadow Lens",
    metaDescription: "Dive beneath the surface with our aquatic wildlife photography, highlighting the fascinating fish, frogs, and creatures that rule the waterways.",
    keywords: ["Aquatic Wildlife Photography", "Fish Prints", "Frog Photos"]
  },
  "Crustaceans": {
    metaTitle: "Crustacean Photography Prints | The Meadow Lens",
    metaDescription: "Discover the armored inhabitants of the shorelines in our crustacean photography prints, featuring highly detailed portraits of crabs and lobsters.",
    keywords: ["Crustacean Photography Prints", "Crab Photos", "Shoreline Wildlife"]
  },
  "Mammals": {
    metaTitle: "Wild Mammal Photography | The Meadow Lens",
    metaDescription: "Connect with nature's largest subjects through our wild mammal photography, bringing the majestic presence of deer and foxes right to your walls.",
    keywords: ["Wild Mammal Photography", "Deer Prints", "Fox Photos"]
  },
  "Reptiles": {
    metaTitle: "Reptile Photography Prints | The Meadow Lens",
    metaDescription: "Explore the ancient, scaly textures of our reptile photography prints, capturing the cold-blooded beauty of turtles, snakes, and lizards.",
    keywords: ["Reptile Photography Prints", "Turtle Photos", "Lizard Photography"]
  },
  "Everything": {
    metaTitle: "Diverse Wildlife Photography | The Meadow Lens",
    metaDescription: "Experience the full spectrum of biodiversity in our diverse wildlife photography collection, featuring unique species from all corners of the ecosystem.",
    keywords: ["Diverse Wildlife Photography", "Biodiversity Prints", "Unique Animal Photos"]
  },
  "Walking, crawling, jumping, etc.": {
    metaTitle: "Crawling Insect Photography | The Meadow Lens",
    metaDescription: "Get down in the dirt with our crawling insect photography, showcasing the fascinating lives of beetles, ants, and caterpillars on the move.",
    keywords: ["Crawling Insect Photography", "Beetle Photos", "Caterpillar Prints"]
  },
  "Flying": {
    metaTitle: "Flying Insect Photography | The Meadow Lens",
    metaDescription: "Follow the delicate wings of nature in our flying insect photography, capturing butterflies and dragonflies hovering perfectly in mid-air.",
    keywords: ["Flying Insect Photography", "Butterfly Prints", "Dragonfly Photos"]
  },
  "Pollinating": {
    metaTitle: "Pollinator Photography Prints | The Meadow Lens",
    metaDescription: "Celebrate the hardest workers in nature with our pollinator photography prints, featuring bees and butterflies vitalizing the spring blooms.",
    keywords: ["Pollinator Photography Prints", "Bee Photos", "Flower Pollinators"]
  },
  "Arachnids (Spiders)": {
    metaTitle: "Macro Spider Photography | The Meadow Lens",
    metaDescription: "Confront the beautiful symmetry of the web with our macro spider photography, revealing the intricate patterns and alien features of arachnids.",
    keywords: ["Macro Spider Photography", "Arachnid Prints", "Spider Web Photos"]
  }
};

const query = encodeURIComponent(`*[_type == "category"]{_id, title}`);
const fetchUrl = `https://${PROJECT_ID}.api.sanity.io/v2021-06-07/data/query/${DATASET}?query=${query}`;

https.get(fetchUrl, { headers: { Authorization: `Bearer ${TOKEN}` } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const categories = json.result || [];
    const mutations = [];

    for (const cat of categories) {
      if (seoMap[cat.title]) {
        const generatedSeo = seoMap[cat.title];
        
        const patchObj = {
          id: cat._id,
          set: {
            seo: {
              _type: 'seo',
              metaTitle: generatedSeo.metaTitle,
              metaDescription: generatedSeo.metaDescription,
              keywords: generatedSeo.keywords
            }
          }
        };
        mutations.push({ patch: patchObj });
      } else {
         console.log(`No mapping for: ${cat.title}`);
      }
    }

    console.log(`Found ${mutations.length} categories to update with SEO data.`);

    if (mutations.length === 0) return;

    const CHUNK_SIZE = 50;
    let chunksProcessed = 0;
    
    function sendChunk(chunk) {
      const mutateUrl = `https://${PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/${DATASET}`;
      const req = https.request(mutateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` }
      }, (mRes) => {
        let mData = '';
        mRes.on('data', c => mData += c);
        mRes.on('end', () => {
          chunksProcessed++;
          console.log(`Chunk ${chunksProcessed} complete. Status: ${mRes.statusCode}`);
        });
      });
      req.write(JSON.stringify({ mutations: chunk }));
      req.end();
    }

    for (let i = 0; i < mutations.length; i += CHUNK_SIZE) {
      sendChunk(mutations.slice(i, i + CHUNK_SIZE));
    }
  });
});
