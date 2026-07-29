import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';

export const CategoryGrid = () => {
  const navigate = useNavigate();
  const { categories, setSelectedCategory } = useProducts();

  const displayCategories = categories.filter((cat) => cat !== 'All');

  
  const categoryImages = {
    
    clothing:      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&h=800&fit=crop',
    clothes:       'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&h=800&fit=crop',
    fashion:       'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=800&fit=crop',
    apparel:       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=800&fit=crop',
    shirts:        'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&h=800&fit=crop',
    tshirts:       'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600&h=800&fit=crop',
    jeans:         'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop',
    dresses:       'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop',
    tops:          'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=600&h=800&fit=crop',
    jackets:       'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&h=800&fit=crop',
    coats:         'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&h=800&fit=crop',
    suits:         'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=800&fit=crop',
    sportswear:    'https://images.unsplash.com/photo-1483721310020-03333e577078?w=600&h=800&fit=crop',
    activewear:    'https://images.unsplash.com/photo-1483721310020-03333e577078?w=600&h=800&fit=crop',

    
    footwear:      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=400&fit=crop',
    shoes:         'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop',
    sneakers:      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=400&fit=crop',
    boots:         'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&h=400&fit=crop',
    sandals:       'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&h=400&fit=crop',
    heels:         'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=600&h=400&fit=crop',

    
    accessories:   'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&h=400&fit=crop',
    bags:          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=400&fit=crop',
    handbags:      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=400&fit=crop',
    backpacks:     'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop',
    wallets:       'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=400&fit=crop',
    belts:         'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&h=400&fit=crop',
    hats:          'https://images.unsplash.com/photo-1533827432537-70133748f5c8?w=600&h=400&fit=crop',
    caps:          'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&h=400&fit=crop',
    scarves:       'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&h=400&fit=crop',
    sunglasses:    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=400&fit=crop',
    eyewear:       'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=400&fit=crop',
    gloves:        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&h=400&fit=crop',

    
    watches:       'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=400&fit=crop',
    watch:         'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=400&fit=crop',
    jewelry:       'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=400&fit=crop',
    jewellery:     'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=400&fit=crop',
    rings:         'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=400&fit=crop',
    necklaces:     'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=400&fit=crop',
    bracelets:     'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&h=400&fit=crop',
    earrings:      'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&h=400&fit=crop',

    
    electronics:   'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=400&fit=crop',
    technology:    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop',
    gadgets:       'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&h=400&fit=crop',
    phones:        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=400&fit=crop',
    mobiles:       'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=400&fit=crop',
    laptops:       'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop',
    computers:     'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&h=400&fit=crop',
    headphones:    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop',
    audio:         'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&h=400&fit=crop',
    cameras:       'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&h=400&fit=crop',

    
    beauty:        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=400&fit=crop',
    skincare:      'https://images.unsplash.com/photo-1570194065650-d99fb4abbd90?w=600&h=400&fit=crop',
    makeup:        'https://images.unsplash.com/photo-1631214524020-3c69888b8cdb?w=600&h=400&fit=crop',
    cosmetics:     'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=400&fit=crop',
    perfumes:      'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&h=400&fit=crop',
    fragrance:     'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&h=400&fit=crop',

    
    home:          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop',
    furniture:     'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop',
    decor:         'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600&h=400&fit=crop',
    kitchen:       'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop',
    bedding:       'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop',

    
    sports:        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=400&fit=crop',
    fitness:       'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&h=400&fit=crop',
    outdoor:       'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&h=400&fit=crop',
    gym:           'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop',

    
    books:         'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop',
    stationery:    'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=600&h=400&fit=crop',

    
    toys:          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
    kids:          'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&h=400&fit=crop',

    
    food:          'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&h=400&fit=crop',
    grocery:       'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop',

    
    general:       'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop',
    other:         'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop',
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop';

  const getCategoryImage = (catName) => {
    const key = String(catName || '').trim().toLowerCase();
    // Exact match first
    if (categoryImages[key]) return categoryImages[key];
    // Keyword partial match — find first entry whose key appears in catName or vice versa
    const matched = Object.keys(categoryImages).find(
      (k) => key.includes(k) || k.includes(key)
    );
    return matched ? categoryImages[matched] : fallbackImage;
  };

  // Fallback to defaults if no products in database have category names yet
  const finalCategories = displayCategories.length > 0 
    ? displayCategories 
    : ['Clothing', 'Accessories', 'Footwear', 'Watches', 'Jewelry'];

  const handleSelectCategory = (catName) => {
    setSelectedCategory(catName);
    navigate('/shop');
  };

  return (
    <section className="bg-gray-50 py-16 dark:bg-gray-900 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white lg:text-4xl">
            Shop by Category
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-400">
            Explore curated collections tailored to your lifestyle and taste
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {finalCategories.map((cat, idx) => {
            const catName = typeof cat === 'string' ? cat : cat.name;
            const catImage = typeof cat === 'string' ? getCategoryImage(cat) : cat.image;
            const spanClass = idx === 0 ? 'sm:col-span-2 lg:col-span-1 lg:row-span-2' : '';

            return (
              <div
                key={idx}
                onClick={() => handleSelectCategory(catName)}
                className={`group relative overflow-hidden rounded-2xl cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 ${spanClass}`}
              >
                <div className="relative overflow-hidden aspect-square lg:aspect-auto lg:h-full min-h-[260px]">
                  <img
                    src={catImage}
                    alt={catName}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/20 to-transparent" />

                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <h3 className="font-display text-2xl font-bold text-white">
                      {catName}
                    </h3>
                    <div className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary-300 opacity-90 group-hover:translate-x-1 transition-transform">
                      <span>Browse Collection</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
