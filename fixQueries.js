const fs = require('fs')
const file1 = 'src/app/category/[...slug]/page.js'
let c1 = fs.readFileSync(file1, 'utf8')
c1 = c1.replace('category->slug.current == $currentSlug || subcategory->slug.current == $currentSlug', 'category->slug.current == $currentSlug || subcategory->slug.current == $currentSlug || category->parentCategory->slug.current == $currentSlug')
fs.writeFileSync(file1, c1)

const file2 = 'src/app/bird-index/page.js'
let c2 = fs.readFileSync(file2, 'utf8')
c2 = c2.replace('category->slug.current in ["birds", "fauna", "flora"]', 'category->slug.current in ["birds", "fauna", "flora"] || category->parentCategory->slug.current in ["birds", "fauna", "flora"]')
fs.writeFileSync(file2, c2)

const file3 = 'src/app/species/[speciesName]/page.js'
let c3 = fs.readFileSync(file3, 'utf8')
c3 = c3.replace('category->slug.current in ["birds", "fauna", "flora"]', 'category->slug.current in ["birds", "fauna", "flora"] || category->parentCategory->slug.current in ["birds", "fauna", "flora"]')
fs.writeFileSync(file3, c3)
