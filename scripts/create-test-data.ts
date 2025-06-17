import { db } from '../server/db';
import { users, listings, sellerProfiles, farmSpaces } from '../shared/schema';
import bcrypt from 'bcrypt';

async function createTestData() {
  console.log('🌱 Creating test data for FarmDirect...');

  try {
    // Create test users
    const testUsers = [
      {
        name: 'Sarah Martinez',
        email: 'sarah@greenvalleyfarm.com',
        password: await bcrypt.hash('password123', 10),
        zip: '90210',
        productsGrown: 'Tomatoes, Peppers, Herbs',
        about: 'Organic farmer with 15 years of experience growing heirloom vegetables.',
        image: 'https://images.unsplash.com/photo-1494790108755-2616b332c98c?w=400',
        authType: 'email',
        authId: 'sarah@greenvalleyfarm.com'
      },
      {
        name: 'Mike Johnson',
        email: 'mike@sunshinefarms.com',
        password: await bcrypt.hash('password123', 10),
        zip: '90212',
        productsGrown: 'Fruits, Berries, Citrus',
        about: 'Third-generation citrus farmer specializing in organic fruit production.',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        authType: 'email',
        authId: 'mike@sunshinefarms.com'
      },
      {
        name: 'Emma Chen',
        email: 'emma@urbangarden.com',
        password: await bcrypt.hash('password123', 10),
        zip: '90403',
        productsGrown: 'Leafy Greens, Microgreens, Herbs',
        about: 'Urban gardener focused on sustainable growing methods and community education.',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        authType: 'email',
        authId: 'emma@urbangarden.com'
      },
      {
        name: 'David Rodriguez',
        email: 'david@valleyharvest.com',
        password: await bcrypt.hash('password123', 10),
        zip: '90404',
        productsGrown: 'Root Vegetables, Squash, Beans',
        about: 'Sustainable farmer practicing permaculture and soil health regeneration.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        authType: 'email',
        authId: 'david@valleyharvest.com'
      }
    ];

    const insertedUsers = [];
    for (const user of testUsers) {
      const [newUser] = await db.insert(users).values(user).returning();
      insertedUsers.push(newUser);
      console.log(`✅ Created user: ${newUser.name}`);
    }

    // Create seller profiles
    const testProfiles = [
      {
        userId: insertedUsers[0].id,
        farmName: 'Green Valley Organic Farm',
        bio: 'Family-owned organic farm producing the freshest vegetables using sustainable farming practices. We specialize in heirloom tomatoes and artisanal herbs.',
        address: '123 Farm Road, Beverly Hills, CA 90210',
        locationVisibility: 'area',
        phone: '(555) 123-4567',
        contactVisibility: 'public',
        operationalHours: JSON.stringify({
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          hours: '7:00 AM - 6:00 PM'
        })
      },
      {
        userId: insertedUsers[1].id,
        farmName: 'Sunshine Citrus Groves',
        bio: 'Premium citrus farm with over 50 years of experience. We grow the sweetest oranges, lemons, and grapefruits in Southern California.',
        address: '456 Citrus Ave, Beverly Hills, CA 90212',
        locationVisibility: 'full',
        phone: '(555) 234-5678',
        contactVisibility: 'public',
        operationalHours: JSON.stringify({
          days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          hours: '8:00 AM - 5:00 PM'
        })
      },
      {
        userId: insertedUsers[2].id,
        farmName: 'Urban Garden Co-op',
        bio: 'Community-focused urban growing operation. We grow fresh greens and herbs using hydroponic and vertical farming techniques.',
        address: '789 Green St, Santa Monica, CA 90403',
        locationVisibility: 'area',
        phone: '(555) 345-6789',
        contactVisibility: 'members',
        operationalHours: JSON.stringify({
          days: ['Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          hours: '9:00 AM - 4:00 PM'
        })
      },
      {
        userId: insertedUsers[3].id,
        farmName: 'Valley Harvest Collective',
        bio: 'Regenerative agriculture farm focused on soil health and biodiversity. We grow nutrient-dense vegetables using ancient farming wisdom.',
        address: '321 Valley Road, Santa Monica, CA 90404',
        locationVisibility: 'full',
        phone: '(555) 456-7890',
        contactVisibility: 'public',
        operationalHours: JSON.stringify({
          days: ['Thursday', 'Friday', 'Saturday', 'Sunday'],
          hours: '8:00 AM - 3:00 PM'
        })
      }
    ];

    const insertedProfiles = [];
    for (const profile of testProfiles) {
      const [newProfile] = await db.insert(sellerProfiles).values(profile).returning();
      insertedProfiles.push(newProfile);
      console.log(`✅ Created seller profile: ${profile.farmName}`);
    }

    // Create test listings
    const testListings = [
      {
        userId: insertedUsers[0].id,
        title: 'Heirloom Cherry Tomatoes',
        description: 'Sweet and juicy cherry tomatoes grown organically. Perfect for salads, snacking, or cooking. Harvested fresh daily.',
        category: 'vegetables',
        price: 650, // $6.50
        unit: 'pound',
        quantity: 25,
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500',
        availableDate: new Date(),
        pickAndPack: true
      },
      {
        userId: insertedUsers[0].id,
        title: 'Fresh Basil',
        description: 'Aromatic organic basil, perfect for pesto, pasta, and Mediterranean dishes. Grown in greenhouse conditions.',
        category: 'herbs',
        price: 350, // $3.50
        unit: 'bunch',
        quantity: 15,
        imageUrl: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=500',
        availableDate: new Date(),
        pickAndPack: false
      },
      {
        userId: insertedUsers[1].id,
        title: 'Valencia Oranges',
        description: 'Sweet, juicy Valencia oranges perfect for eating fresh or juicing. Tree-ripened for maximum flavor.',
        category: 'fruits',
        price: 450, // $4.50
        unit: 'pound',
        quantity: 50,
        imageUrl: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=500',
        availableDate: new Date(),
        pickAndPack: true
      },
      {
        userId: insertedUsers[1].id,
        title: 'Meyer Lemons',
        description: 'Premium Meyer lemons with thin skin and sweet flavor. Great for cooking, baking, and cocktails.',
        category: 'fruits',
        price: 550, // $5.50
        unit: 'pound',
        quantity: 30,
        imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500',
        availableDate: new Date(),
        pickAndPack: true
      },
      {
        userId: insertedUsers[2].id,
        title: 'Mixed Baby Greens',
        description: 'Fresh mix of baby lettuce, spinach, arugula, and other greens. Hydroponically grown without pesticides.',
        category: 'vegetables',
        price: 750, // $7.50
        unit: 'item',
        quantity: 20,
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500',
        availableDate: new Date(),
        pickAndPack: false
      },
      {
        userId: insertedUsers[2].id,
        title: 'Microgreen Variety Pack',
        description: 'Assorted microgreens including pea shoots, radish, and sunflower microgreens. Nutrient-dense and flavorful.',
        category: 'vegetables',
        price: 1200, // $12.00
        unit: 'item',
        quantity: 12,
        imageUrl: 'https://images.unsplash.com/photo-1622205313162-be1d5712a43f?w=500',
        availableDate: new Date(),
        pickAndPack: false
      },
      {
        userId: insertedUsers[3].id,
        title: 'Rainbow Carrots',
        description: 'Beautiful rainbow carrots in purple, orange, and white varieties. Sweet and crunchy, grown in rich soil.',
        category: 'vegetables',
        price: 400, // $4.00
        unit: 'bunch',
        quantity: 18,
        imageUrl: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=500',
        availableDate: new Date(),
        pickAndPack: true
      },
      {
        userId: insertedUsers[3].id,
        title: 'Butternut Squash',
        description: 'Large, sweet butternut squash perfect for roasting, soups, and autumn dishes. Grown using regenerative methods.',
        category: 'vegetables',
        price: 300, // $3.00
        unit: 'item',
        quantity: 8,
        imageUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=500',
        availableDate: new Date(),
        pickAndPack: false
      }
    ];

    for (const listing of testListings) {
      const [newListing] = await db.insert(listings).values(listing).returning();
      console.log(`✅ Created listing: ${newListing.title}`);
    }

    // Create test farm spaces
    const testFarmSpaces = [
      {
        sellerProfileId: insertedProfiles[0].id,
        title: 'Sunny Garden Plot - 200 sq ft',
        description: 'Perfect sunny spot for growing vegetables. Water access nearby, tool storage available. Great for beginners.',
        squareFootage: 200,
        soilType: 'loam',
        lightConditions: 'full_sun',
        irrigationOptions: 'hose_access',
        managementLevel: 'minimal_guidance',
        price: 8000, // $80.00/month
        pricingType: 'month',
        status: 'available',
        availableFrom: new Date(),
        additionalNotes: 'Includes access to shared tools and composting area. Perfect for growing tomatoes and peppers.'
      },
      {
        sellerProfileId: insertedProfiles[0].id,
        title: 'Herb Garden Section - 50 sq ft',
        description: 'Small dedicated herb section with drip irrigation. Ideal for culinary herbs and aromatics.',
        squareFootage: 50,
        soilType: 'organic',
        lightConditions: 'partial_sun',
        irrigationOptions: 'drip_irrigation',
        managementLevel: 'active_support',
        price: 3500, // $35.00/month
        pricingType: 'month',
        status: 'available',
        availableFrom: new Date(),
        additionalNotes: 'Already established with rosemary, thyme, and sage. Perfect for herb enthusiasts.'
      },
      {
        sellerProfileId: insertedProfiles[1].id,
        title: 'Citrus Grove Space - 300 sq ft',
        description: 'Large space under partial shade of citrus trees. Rich soil perfect for understory crops.',
        squareFootage: 300,
        soilType: 'sandy',
        lightConditions: 'partial_shade',
        irrigationOptions: 'sprinkler',
        managementLevel: 'hands_off',
        price: 12000, // $120.00/month
        pricingType: 'month',
        status: 'available',
        availableFrom: new Date(),
        additionalNotes: 'Great for growing shade-tolerant vegetables like lettuce and spinach.'
      },
      {
        sellerProfileId: insertedProfiles[2].id,
        title: 'Urban Vertical Growing Space',
        description: 'Modern vertical growing system with automated watering. Perfect for leafy greens and herbs.',
        squareFootage: 75,
        soilType: 'organic',
        lightConditions: 'full_sun',
        irrigationOptions: 'drip_irrigation',
        managementLevel: 'full_management',
        price: 15000, // $150.00/month
        pricingType: 'month',
        status: 'available',
        availableFrom: new Date(),
        additionalNotes: 'Includes training on vertical growing systems and ongoing support. All supplies included.'
      },
      {
        sellerProfileId: insertedProfiles[3].id,
        title: 'Regenerative Farm Plot - 500 sq ft',
        description: 'Large plot on our regenerative farm. Learn sustainable growing methods while producing your own food.',
        squareFootage: 500,
        soilType: 'clay',
        lightConditions: 'full_sun',
        irrigationOptions: 'manual_watering',
        managementLevel: 'active_support',
        price: 10000, // $100.00/month
        pricingType: 'month',
        status: 'available',
        availableFrom: new Date(),
        additionalNotes: 'Includes education on regenerative agriculture practices and soil building techniques.'
      }
    ];

    for (const farmSpace of testFarmSpaces) {
      const [newFarmSpace] = await db.insert(farmSpaces).values(farmSpace).returning();
      console.log(`✅ Created farm space: ${newFarmSpace.title}`);
    }

    console.log('\n🎉 Test data creation completed!');
    console.log('\nTest Users Created:');
    insertedUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Password: password123`);
    });

    console.log('\n📊 Summary:');
    console.log(`- ${insertedUsers.length} users created`);
    console.log(`- ${insertedProfiles.length} seller profiles created`);
    console.log(`- ${testListings.length} listings created`);
    console.log(`- ${testFarmSpaces.length} farm spaces created`);

  } catch (error) {
    console.error('❌ Error creating test data:', error);
    process.exit(1);
  }
}

// Run the script
createTestData().then(() => {
  console.log('✅ Script completed successfully');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 