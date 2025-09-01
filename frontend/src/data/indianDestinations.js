// Comprehensive Indian Destinations Database
export const indianDestinations = [
  // Major Metropolitan Cities
  {
    id: 'mumbai_maharashtra',
    name: 'Mumbai, Maharashtra',
    aliases: ['mumbai', 'bombay'],
    description: 'Financial capital of India with Bollywood glamour and street food',
    imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f',
    category: 'Urban',
    state: 'Maharashtra',
    region: 'Western India',
    rating: 4.4,
    priceLevel: 3,
    location: { lat: 19.0760, lng: 72.8777 },
    highlights: ['Gateway of India', 'Marine Drive', 'Bollywood Studios', 'Elephanta Caves'],
    bestTime: 'November-February',
    averageDays: '3-5 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'shopping_mall']
  },
  {
    id: 'delhi_delhi',
    name: 'Delhi, Delhi',
    aliases: ['delhi', 'new delhi'],
    description: 'Capital city rich in history, culture, and architectural marvels',
    imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5',
    category: 'Cultural',
    state: 'Delhi',
    region: 'Northern India',
    rating: 4.6,
    priceLevel: 2,
    location: { lat: 28.7041, lng: 77.1025 },
    highlights: ['Red Fort', 'India Gate', 'Lotus Temple', 'Qutub Minar'],
    bestTime: 'October-March',
    averageDays: '3-5 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'museum']
  },
  {
    id: 'bangalore_karnataka',
    name: 'Bangalore, Karnataka',
    aliases: ['bangalore', 'bengaluru'],
    description: 'Silicon Valley of India with pleasant weather and vibrant culture',
    imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2',
    category: 'Urban',
    state: 'Karnataka',
    region: 'Southern India',
    rating: 4.5,
    priceLevel: 2,
    location: { lat: 12.9716, lng: 77.5946 },
    highlights: ['Lalbagh Botanical Garden', 'Bangalore Palace', 'UB City Mall'],
    bestTime: 'October-February',
    averageDays: '2-4 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'park'],
    itinerary: {
      "2-3 days": [
        {
          day: 1,
          title: "Heritage & Gardens",
          places: ["Bangalore Palace", "Cubbon Park", "Vidhana Soudha", "Visvesvaraya Industrial & Technological Museum"]
        },
        {
          day: 2,
          title: "Temples & Culture",
          places: ["ISKCON Temple", "Bull Temple (Nandi Temple)", "Tipu Sultan's Summer Palace", "KR Market"]
        },
        {
          day: 3,
          title: "Modern Bangalore & Food",
          places: ["Lalbagh Botanical Garden", "UB City Mall", "MG Road & Brigade Road", "Church Street"]
        }
      ]
    }
  },
  {
    id: 'kolkata_west_bengal',
    name: 'Kolkata, West Bengal',
    aliases: ['kolkata', 'calcutta'],
    description: 'Cultural capital of India with rich heritage, art, and literature',
    imageUrl: 'https://images.unsplash.com/photo-1558431382-27e303142255',
    category: 'Cultural',
    state: 'West Bengal',
    region: 'Eastern India',
    rating: 4.5,
    priceLevel: 2,
    location: { lat: 22.5726, lng: 88.3639 },
    highlights: ['Victoria Memorial', 'Howrah Bridge', 'Park Street', 'Dakshineswar Temple'],
    bestTime: 'October-March',
    averageDays: '3-5 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'museum']
  },

  // Eastern India - Jharkhand and Surrounding
  {
    id: 'jharkhand_state',
    name: 'Jharkhand, India',
    aliases: ['jharkhand'],
    description: 'Land of forests with waterfalls, tribal culture, and natural beauty',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    category: 'Nature',
    state: 'Jharkhand',
    region: 'Eastern India',
    rating: 4.3,
    priceLevel: 1,
    location: { lat: 23.6102, lng: 85.2799 },
    highlights: ['Hundru Falls', 'Betla National Park', 'Ranchi Hill Station', 'Netarhat'],
    bestTime: 'October-April',
    averageDays: '4-6 days',
    attractions: ['tourist_attraction', 'park', 'lodging', 'natural_feature']
  },
  {
    id: 'ranchi_jharkhand',
    name: 'Ranchi, Jharkhand',
    aliases: ['ranchi'],
    description: 'Hill station capital with waterfalls, lakes, and pleasant climate',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    category: 'Nature',
    state: 'Jharkhand',
    region: 'Eastern India',
    rating: 4.2,
    priceLevel: 1,
    location: { lat: 23.3441, lng: 85.3096 },
    highlights: ['Rock Garden', 'Hundru Falls', 'Tagore Hill', 'Ranchi Lake'],
    bestTime: 'October-April',
    averageDays: '2-4 days',
    attractions: ['tourist_attraction', 'park', 'lodging', 'natural_feature']
  },
  {
    id: 'digha_west_bengal',
    name: 'Digha, West Bengal',
    aliases: ['digha'],
    description: 'Popular beach destination with golden sand and seafood',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
    category: 'Beach',
    state: 'West Bengal',
    region: 'Eastern India',
    rating: 4.0,
    priceLevel: 1,
    location: { lat: 21.6281, lng: 87.5094 },
    highlights: ['Digha Beach', 'New Digha', 'Marine Aquarium', 'Shankarpur Beach'],
    bestTime: 'October-March',
    averageDays: '2-3 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'amusement_park']
  },

  // Beach Destinations
  {
    id: 'goa_goa',
    name: 'Goa, India',
    aliases: ['goa'],
    description: 'Beach paradise with Portuguese heritage and vibrant nightlife',
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2',
    category: 'Beach',
    state: 'Goa',
    region: 'Western India',
    rating: 4.7,
    priceLevel: 2,
    location: { lat: 15.2993, lng: 74.1240 },
    highlights: ['Baga Beach', 'Old Goa Churches', 'Dudhsagar Falls', 'Anjuna Market'],
    bestTime: 'November-February',
    averageDays: '4-7 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'night_club']
  },

  // Hill Stations
  {
    id: 'manali_himachal',
    name: 'Manali, Himachal Pradesh',
    aliases: ['manali'],
    description: 'Popular hill station with snow-capped mountains and adventure sports',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    category: 'Mountains',
    state: 'Himachal Pradesh',
    region: 'Northern India',
    rating: 4.6,
    priceLevel: 2,
    location: { lat: 32.2396, lng: 77.1887 },
    highlights: ['Rohtang Pass', 'Solang Valley', 'Hadimba Temple', 'Old Manali'],
    bestTime: 'March-June, October-February',
    averageDays: '4-6 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'amusement_park']
  },
  {
    id: 'shimla_himachal',
    name: 'Shimla, Himachal Pradesh',
    aliases: ['shimla'],
    description: 'Former British summer capital with colonial architecture',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    category: 'Mountains',
    state: 'Himachal Pradesh',
    region: 'Northern India',
    rating: 4.4,
    priceLevel: 2,
    location: { lat: 31.1048, lng: 77.1734 },
    highlights: ['Mall Road', 'Christ Church', 'Jakhu Temple', 'Toy Train'],
    bestTime: 'March-June, October-February',
    averageDays: '3-5 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'shopping_mall']
  },

  // Rajasthan Cities
  {
    id: 'jaipur_rajasthan',
    name: 'Jaipur, Rajasthan',
    aliases: ['jaipur', 'pink city'],
    description: 'Pink City with magnificent palaces, forts, and royal heritage',
    imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245',
    category: 'Cultural',
    state: 'Rajasthan',
    region: 'Northern India',
    rating: 4.7,
    priceLevel: 2,
    location: { lat: 26.9124, lng: 75.7873 },
    highlights: ['Hawa Mahal', 'Amber Fort', 'City Palace', 'Jantar Mantar'],
    bestTime: 'October-March',
    averageDays: '3-4 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'museum']
  },
  {
    id: 'udaipur_rajasthan',
    name: 'Udaipur, Rajasthan',
    aliases: ['udaipur', 'city of lakes'],
    description: 'City of Lakes with romantic palaces and stunning architecture',
    imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245',
    category: 'Cultural',
    state: 'Rajasthan',
    region: 'Northern India',
    rating: 4.8,
    priceLevel: 2,
    location: { lat: 24.5854, lng: 73.7125 },
    highlights: ['City Palace', 'Lake Pichola', 'Jag Mandir', 'Saheliyon Ki Bari'],
    bestTime: 'October-March',
    averageDays: '2-4 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'boat_rental']
  },

  // Kerala
  {
    id: 'kerala_state',
    name: 'Kerala, India',
    aliases: ['kerala', 'gods own country'],
    description: 'God\'s Own Country with backwaters, hill stations, and spices',
    imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944',
    category: 'Nature',
    state: 'Kerala',
    region: 'Southern India',
    rating: 4.8,
    priceLevel: 2,
    location: { lat: 10.8505, lng: 76.2711 },
    highlights: ['Alleppey Backwaters', 'Munnar Hills', 'Kochi Fort', 'Thekkady'],
    bestTime: 'September-March',
    averageDays: '5-8 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'boat_rental']
  },


  // Tamil Nadu
  {
    id: 'chennai_tamil_nadu',
    name: 'Chennai, Tamil Nadu',
    aliases: ['chennai', 'madras'],
    description: 'Gateway to South India with temples, beaches, and classical arts',
    imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220',
    category: 'Cultural',
    state: 'Tamil Nadu',
    region: 'Southern India',
    rating: 4.3,
    priceLevel: 2,
    location: { lat: 13.0827, lng: 80.2707 },
    highlights: ['Marina Beach', 'Kapaleeshwarar Temple', 'Fort St. George', 'Mahabalipuram'],
    bestTime: 'November-February',
    averageDays: '2-4 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'museum']
  },

  // Andhra Pradesh / Telangana
  {
    id: 'hyderabad_telangana',
    name: 'Hyderabad, Telangana',
    aliases: ['hyderabad'],
    description: 'City of Nizams with historic monuments and famous biryani',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
    category: 'Cultural',
    state: 'Telangana',
    region: 'Southern India',
    rating: 4.4,
    priceLevel: 2,
    location: { lat: 17.3850, lng: 78.4867 },
    highlights: ['Charminar', 'Golconda Fort', 'Ramoji Film City', 'Hussain Sagar'],
    bestTime: 'October-March',
    averageDays: '2-4 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'amusement_park']
  },

  // Maharashtra
  {
    id: 'pune_maharashtra',
    name: 'Pune, Maharashtra',
    aliases: ['pune'],
    description: 'Oxford of the East with pleasant weather and cultural heritage',
    imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220',
    category: 'Urban',
    state: 'Maharashtra',
    region: 'Western India',
    rating: 4.3,
    priceLevel: 2,
    location: { lat: 18.5204, lng: 73.8567 },
    highlights: ['Shaniwar Wada', 'Aga Khan Palace', 'Sinhagad Fort', 'Osho Ashram'],
    bestTime: 'October-February',
    averageDays: '2-3 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'museum']
  },

  // Uttar Pradesh
  {
    id: 'agra_uttar_pradesh',
    name: 'Agra, Uttar Pradesh',
    aliases: ['agra'],
    description: 'Home to the iconic Taj Mahal and Mughal architecture',
    imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523',
    category: 'Cultural',
    state: 'Uttar Pradesh',
    region: 'Northern India',
    rating: 4.8,
    priceLevel: 2,
    location: { lat: 27.1767, lng: 78.0081 },
    highlights: ['Taj Mahal', 'Agra Fort', 'Fatehpur Sikri', 'Mehtab Bagh'],
    bestTime: 'October-March',
    averageDays: '1-2 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'museum']
  },
  {
    id: 'varanasi_uttar_pradesh',
    name: 'Varanasi, Uttar Pradesh',
    aliases: ['varanasi', 'banaras', 'kashi'],
    description: 'Spiritual capital with ancient ghats and religious significance',
    imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc',
    category: 'Spiritual',
    state: 'Uttar Pradesh',
    region: 'Northern India',
    rating: 4.6,
    priceLevel: 1,
    location: { lat: 25.3176, lng: 82.9739 },
    highlights: ['Dashashwamedh Ghat', 'Kashi Vishwanath Temple', 'Sarnath', 'Ganga Aarti'],
    bestTime: 'October-March',
    averageDays: '2-3 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'place_of_worship']
  },

  // Uttarakhand
  {
    id: 'rishikesh_uttarakhand',
    name: 'Rishikesh, Uttarakhand',
    aliases: ['rishikesh'],
    description: 'Yoga capital of the world with spiritual vibes and adventure sports',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    category: 'Spiritual',
    state: 'Uttarakhand',
    region: 'Northern India',
    rating: 4.7,
    priceLevel: 1,
    location: { lat: 30.0869, lng: 78.2676 },
    highlights: ['Laxman Jhula', 'Ram Jhula', 'Parmarth Niketan', 'White Water Rafting'],
    bestTime: 'February-June, September-November',
    averageDays: '3-5 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'spa']
  },

  // West Bengal
  {
    id: 'darjeeling_west_bengal',
    name: 'Darjeeling, West Bengal',
    aliases: ['darjeeling'],
    description: 'Queen of Hills famous for tea gardens and Himalayan views',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    category: 'Mountains',
    state: 'West Bengal',
    region: 'Eastern India',
    rating: 4.6,
    priceLevel: 2,
    location: { lat: 27.0360, lng: 88.2627 },
    highlights: ['Tiger Hill', 'Darjeeling Tea Gardens', 'Toy Train', 'Peace Pagoda'],
    bestTime: 'March-May, October-December',
    averageDays: '3-5 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'park']
  },

  // More West Bengal Destinations
  {
    id: 'mandarmani_west_bengal',
    name: 'Mandarmani, West Bengal',
    aliases: ['mandarmani'],
    description: 'Pristine beach destination with red crabs and peaceful shores',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
    category: 'Beach',
    state: 'West Bengal',
    region: 'Eastern India',
    rating: 4.1,
    priceLevel: 1,
    location: { lat: 21.6583, lng: 87.7914 },
    highlights: ['Mandarmani Beach', 'Red Crab Sanctuary', 'Fishing Village', 'Sunset Point'],
    bestTime: 'October-March',
    averageDays: '2-3 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'natural_feature']
  },
  {
    id: 'shantiniketan_west_bengal',
    name: 'Shantiniketan, West Bengal',
    aliases: ['shantiniketan'],
    description: 'Cultural hub founded by Rabindranath Tagore with art and literature',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
    category: 'Cultural',
    state: 'West Bengal',
    region: 'Eastern India',
    rating: 4.4,
    priceLevel: 1,
    location: { lat: 23.6850, lng: 87.2782 },
    highlights: ['Visva Bharati University', 'Tagore Museum', 'Kala Bhavana', 'Poush Mela'],
    bestTime: 'October-March',
    averageDays: '1-2 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'university']
  },

  // Odisha
  {
    id: 'puri_odisha',
    name: 'Puri, Odisha',
    aliases: ['puri'],
    description: 'Holy city with Jagannath Temple and beautiful beaches',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
    category: 'Spiritual',
    state: 'Odisha',
    region: 'Eastern India',
    rating: 4.6,
    priceLevel: 1,
    location: { lat: 19.8135, lng: 85.8312 },
    highlights: ['Jagannath Temple', 'Puri Beach', 'Konark Sun Temple', 'Chilika Lake'],
    bestTime: 'October-March',
    averageDays: '2-4 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'place_of_worship']
  },
  {
    id: 'bhubaneswar_odisha',
    name: 'Bhubaneswar, Odisha',
    aliases: ['bhubaneswar'],
    description: 'Temple city with ancient architecture and modern development',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
    category: 'Cultural',
    state: 'Odisha',
    region: 'Eastern India',
    rating: 4.3,
    priceLevel: 2,
    location: { lat: 20.2961, lng: 85.8245 },
    highlights: ['Lingaraj Temple', 'Udayagiri Caves', 'Khandagiri Caves', 'Nandankanan Zoo'],
    bestTime: 'October-March',
    averageDays: '2-3 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'place_of_worship']
  },

  // Gujarat
  {
    id: 'ahmedabad_gujarat',
    name: 'Ahmedabad, Gujarat',
    aliases: ['ahmedabad'],
    description: 'Heritage city with textile industry and Gujarati culture',
    imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220',
    category: 'Cultural',
    state: 'Gujarat',
    region: 'Western India',
    rating: 4.4,
    priceLevel: 2,
    location: { lat: 23.0225, lng: 72.5714 },
    highlights: ['Sabarmati Ashram', 'Adalaj Stepwell', 'Sidi Saiyyed Mosque', 'Kankaria Lake'],
    bestTime: 'November-February',
    averageDays: '2-3 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'museum']
  },

  // Punjab
  {
    id: 'amritsar_punjab',
    name: 'Amritsar, Punjab',
    aliases: ['amritsar'],
    description: 'Holy city with Golden Temple and rich Sikh heritage',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
    category: 'Spiritual',
    state: 'Punjab',
    region: 'Northern India',
    rating: 4.8,
    priceLevel: 1,
    location: { lat: 31.6340, lng: 74.8723 },
    highlights: ['Golden Temple', 'Jallianwala Bagh', 'Wagah Border', 'Partition Museum'],
    bestTime: 'October-March',
    averageDays: '2-3 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'place_of_worship']
  },

  // Assam
  {
    id: 'guwahati_assam',
    name: 'Guwahati, Assam',
    aliases: ['guwahati'],
    description: 'Gateway to Northeast India with temples and river views',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    category: 'Cultural',
    state: 'Assam',
    region: 'Northeast India',
    rating: 4.2,
    priceLevel: 1,
    location: { lat: 26.1445, lng: 91.7362 },
    highlights: ['Kamakhya Temple', 'Brahmaputra River', 'Assam State Museum', 'Umananda Island'],
    bestTime: 'October-April',
    averageDays: '2-4 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'place_of_worship']
  },

  // Additional Popular Destinations
  {
    id: 'ooty_tamil_nadu',
    name: 'Ooty, Tamil Nadu',
    aliases: ['ooty', 'udhagamandalam'],
    description: 'Queen of Hill Stations with tea gardens and pleasant climate',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    category: 'Mountains',
    state: 'Tamil Nadu',
    region: 'Southern India',
    rating: 4.5,
    priceLevel: 2,
    location: { lat: 11.4064, lng: 76.6932 },
    highlights: ['Botanical Gardens', 'Doddabetta Peak', 'Toy Train', 'Tea Estates'],
    bestTime: 'April-June, September-November',
    averageDays: '2-4 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'park']
  },
  {
    id: 'kodaikanal_tamil_nadu',
    name: 'Kodaikanal, Tamil Nadu',
    aliases: ['kodaikanal'],
    description: 'Princess of Hill Stations with lakes and misty mountains',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    category: 'Mountains',
    state: 'Tamil Nadu',
    region: 'Southern India',
    rating: 4.4,
    priceLevel: 2,
    location: { lat: 10.2381, lng: 77.4892 },
    highlights: ['Kodai Lake', 'Coakers Walk', 'Bryant Park', 'Pillar Rocks'],
    bestTime: 'April-June, September-November',
    averageDays: '2-3 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'park']
  },
  {
    id: 'hampi_karnataka',
    name: 'Hampi, Karnataka',
    aliases: ['hampi'],
    description: 'UNESCO World Heritage Site with ancient ruins and temples',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
    category: 'Cultural',
    state: 'Karnataka',
    region: 'Southern India',
    rating: 4.7,
    priceLevel: 1,
    location: { lat: 15.3350, lng: 76.4600 },
    highlights: ['Virupaksha Temple', 'Stone Chariot', 'Hampi Bazaar', 'Matanga Hill'],
    bestTime: 'October-March',
    averageDays: '2-3 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'museum']
  },
  {
    id: 'mysore_karnataka',
    name: 'Mysore, Karnataka',
    aliases: ['mysore', 'mysuru'],
    description: 'City of Palaces with royal heritage and silk sarees',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
    category: 'Cultural',
    state: 'Karnataka',
    region: 'Southern India',
    rating: 4.5,
    priceLevel: 2,
    location: { lat: 12.2958, lng: 76.6394 },
    highlights: ['Mysore Palace', 'Chamundi Hills', 'Brindavan Gardens', 'St. Philomena\'s Church'],
    bestTime: 'October-March',
    averageDays: '2-3 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'museum']
  },

  // Andhra Pradesh
  {
    id: 'visakhapatnam_andhra_pradesh',
    name: 'Visakhapatnam, Andhra Pradesh',
    aliases: ['visakhapatnam', 'vizag', 'vishakhapatnam', 'vishakapatnam'],
    description: 'Port city with beautiful beaches, hills, and naval heritage',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
    category: 'Beach',
    state: 'Andhra Pradesh',
    region: 'Southern India',
    rating: 4.4,
    priceLevel: 2,
    location: { lat: 17.6868, lng: 83.2185 },
    highlights: ['RK Beach', 'Kailasagiri Hill', 'Submarine Museum', 'Araku Valley'],
    bestTime: 'October-March',
    averageDays: '3-4 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'museum']
  },
  {
    id: 'tirupati_andhra_pradesh',
    name: 'Tirupati, Andhra Pradesh',
    aliases: ['tirupati'],
    description: 'Sacred pilgrimage destination with Tirumala Venkateswara Temple',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
    category: 'Spiritual',
    state: 'Andhra Pradesh',
    region: 'Southern India',
    rating: 4.7,
    priceLevel: 1,
    location: { lat: 13.6288, lng: 79.4192 },
    highlights: ['Tirumala Temple', 'TTD Gardens', 'Sri Venkateswara Museum', 'Chandragiri Fort'],
    bestTime: 'September-March',
    averageDays: '2-3 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'place_of_worship']
  },

  // More Kerala
  {
    id: 'munnar_kerala',
    name: 'Munnar, Kerala',
    aliases: ['munnar'],
    description: 'Tea garden paradise with rolling hills and cool climate',
    imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944',
    category: 'Mountains',
    state: 'Kerala',
    region: 'Southern India',
    rating: 4.7,
    priceLevel: 2,
    location: { lat: 10.0889, lng: 77.0595 },
    highlights: ['Tea Gardens', 'Eravikulam National Park', 'Mattupetty Dam', 'Echo Point'],
    bestTime: 'September-March',
    averageDays: '3-4 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'park']
  },
  {
    id: 'alleppey_kerala',
    name: 'Alleppey, Kerala',
    aliases: ['alleppey', 'alappuzha'],
    description: 'Venice of the East with backwaters and houseboats',
    imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944',
    category: 'Nature',
    state: 'Kerala',
    region: 'Southern India',
    rating: 4.6,
    priceLevel: 2,
    location: { lat: 9.4981, lng: 76.3388 },
    highlights: ['Backwaters', 'Houseboats', 'Alleppey Beach', 'Kumarakom Bird Sanctuary'],
    bestTime: 'November-February',
    averageDays: '2-3 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'boat_rental']
  },

  // Rajasthan
  {
    id: 'jodhpur_rajasthan',
    name: 'Jodhpur, Rajasthan',
    aliases: ['jodhpur', 'blue city'],
    description: 'Blue City with magnificent forts and desert culture',
    imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245',
    category: 'Cultural',
    state: 'Rajasthan',
    region: 'Northern India',
    rating: 4.6,
    priceLevel: 2,
    location: { lat: 26.2389, lng: 73.0243 },
    highlights: ['Mehrangarh Fort', 'Umaid Bhawan Palace', 'Clock Tower', 'Mandore Gardens'],
    bestTime: 'October-March',
    averageDays: '2-3 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'museum']
  },
  {
    id: 'pushkar_rajasthan',
    name: 'Pushkar, Rajasthan',
    aliases: ['pushkar'],
    description: 'Holy city with sacred lake and colorful camel fair',
    imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245',
    category: 'Spiritual',
    state: 'Rajasthan',
    region: 'Northern India',
    rating: 4.5,
    priceLevel: 1,
    location: { lat: 26.4899, lng: 74.5511 },
    highlights: ['Pushkar Lake', 'Brahma Temple', 'Camel Fair', 'Savitri Temple'],
    bestTime: 'October-March',
    averageDays: '1-2 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'place_of_worship']
  },

  // West Bengal - Kolkata
  {
    id: 'kolkata_westbengal',
    name: 'Kolkata, West Bengal',
    aliases: ['kolkata', 'calcutta'],
    description: 'Cultural capital of India with rich heritage and intellectual legacy',
    imageUrl: 'https://images.unsplash.com/photo-1558431382-27e303142255',
    category: 'Cultural',
    state: 'West Bengal',
    region: 'Eastern India',
    rating: 4.5,
    priceLevel: 2,
    location: { lat: 22.5726, lng: 88.3639 },
    highlights: ['Victoria Memorial', 'Howrah Bridge', 'Dakshineswar Temple', 'Park Street'],
    bestTime: 'October-March',
    averageDays: '3-4 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'museum'],
    itinerary: {
      "3-4 days": [
        {
          day: 1,
          title: "Colonial Heritage",
          places: ["Victoria Memorial", "Fort William", "St. Paul's Cathedral", "Maidan"]
        },
        {
          day: 2,
          title: "Cultural Kolkata",
          places: ["Howrah Bridge", "Kumartuli Potter's Quarter", "College Street", "Indian Museum"]
        },
        {
          day: 3,
          title: "Spiritual & Modern",
          places: ["Dakshineswar Temple", "Belur Math", "Park Street", "New Market"]
        },
        {
          day: 4,
          title: "Art & Literature",
          places: ["Tagore House", "Academy of Fine Arts", "Marble Palace", "Kalighat Temple"]
        }
      ]
    }
  },

  // Jharkhand - Ranchi
  {
    id: 'ranchi_jharkhand',
    name: 'Ranchi, Jharkhand',
    aliases: ['ranchi'],
    description: 'Hill station capital known for waterfalls and tribal culture',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    category: 'Nature',
    state: 'Jharkhand',
    region: 'Eastern India',
    rating: 4.2,
    priceLevel: 1,
    location: { lat: 23.3441, lng: 85.3096 },
    highlights: ['Hundru Falls', 'Rock Garden', 'Jagannath Temple', 'Birsa Zoological Park'],
    bestTime: 'October-April',
    averageDays: '2-3 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'park'],
    itinerary: {
      "2-3 days": [
        {
          day: 1,
          title: "Natural Wonders",
          places: ["Hundru Falls", "Jonha Falls", "Dassam Falls", "Rock Garden"]
        },
        {
          day: 2,
          title: "Culture & Wildlife",
          places: ["Jagannath Temple", "Birsa Zoological Park", "Tribal Research Institute", "Kanke Dam"]
        },
        {
          day: 3,
          title: "Hill Station Experience",
          places: ["Tagore Hill", "Pahari Mandir", "Nakshatra Van", "Ranchi Lake"]
        }
      ]
    }
  },

  // Jharkhand - Jamshedpur
  {
    id: 'jamshedpur_jharkhand',
    name: 'Jamshedpur, Jharkhand',
    aliases: ['jamshedpur', 'tatanagar'],
    description: 'Steel city with planned infrastructure and natural beauty',
    imageUrl: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3',
    category: 'Urban',
    state: 'Jharkhand',
    region: 'Eastern India',
    rating: 4.1,
    priceLevel: 2,
    location: { lat: 22.8046, lng: 86.2029 },
    highlights: ['Jubilee Park', 'Tata Steel Zoological Park', 'Dimna Lake', 'Bhuvaneshwari Temple'],
    bestTime: 'October-March',
    averageDays: '2-3 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'park'],
    itinerary: {
      "2-3 days": [
        {
          day: 1,
          title: "Industrial Heritage",
          places: ["Tata Steel Plant Tour", "Jubilee Park", "JRD Tata Sports Complex", "Keenan Stadium"]
        },
        {
          day: 2,
          title: "Nature & Recreation",
          places: ["Dimna Lake", "Tata Steel Zoological Park", "Dalma Wildlife Sanctuary", "Bhuvaneshwari Temple"]
        },
        {
          day: 3,
          title: "Cultural Experience",
          places: ["Tribal Cultural Centre", "Russi Modi Centre of Excellence", "Sakchi Market", "Sir Dorabji Tata Park"]
        }
      ]
    }
  },

  // Odisha - Bhubaneswar
  {
    id: 'bhubaneswar_odisha',
    name: 'Bhubaneswar, Odisha',
    aliases: ['bhubaneswar'],
    description: 'Temple city with ancient Kalinga architecture',
    imageUrl: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3',
    category: 'Cultural',
    state: 'Odisha',
    region: 'Eastern India',
    rating: 4.3,
    priceLevel: 1,
    location: { lat: 20.2961, lng: 85.8245 },
    highlights: ['Lingaraj Temple', 'Khandagiri Caves', 'Udayagiri Caves', 'Nandankanan Zoo'],
    bestTime: 'October-March',
    averageDays: '2-3 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'place_of_worship'],
    itinerary: {
      "2-3 days": [
        {
          day: 1,
          title: "Ancient Temples",
          places: ["Lingaraj Temple", "Mukteshwar Temple", "Rajarani Temple", "Parasurameswara Temple"]
        },
        {
          day: 2,
          title: "Historical Caves",
          places: ["Khandagiri Caves", "Udayagiri Caves", "Dhauli Peace Pagoda", "Odisha State Museum"]
        },
        {
          day: 3,
          title: "Modern Attractions",
          places: ["Nandankanan Zoo", "Ekamra Kanan", "Regional Science Centre", "Tribal Museum"]
        }
      ]
    }
  },

  // Assam - Guwahati
  {
    id: 'guwahati_assam',
    name: 'Guwahati, Assam',
    aliases: ['guwahati'],
    description: 'Gateway to Northeast India with rich Assamese culture',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    category: 'Cultural',
    state: 'Assam',
    region: 'Northeast India',
    rating: 4.2,
    priceLevel: 2,
    location: { lat: 26.1445, lng: 91.7362 },
    highlights: ['Kamakhya Temple', 'Brahmaputra River Cruise', 'Assam State Museum', 'Umananda Temple'],
    bestTime: 'October-April',
    averageDays: '2-3 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'place_of_worship'],
    itinerary: {
      "2-3 days": [
        {
          day: 1,
          title: "Sacred Sites",
          places: ["Kamakhya Temple", "Umananda Temple", "Navagraha Temple", "Basistha Ashram"]
        },
        {
          day: 2,
          title: "Cultural Heritage",
          places: ["Assam State Museum", "Srimanta Sankaradeva Kalakshetra", "Brahmaputra River Cruise", "Fancy Bazaar"]
        },
        {
          day: 3,
          title: "Nature & Wildlife",
          places: ["Pobitora Wildlife Sanctuary", "Deepor Beel", "Shillong Peak (day trip)", "Tea Gardens Visit"]
        }
      ]
    }
  },

  // Chhattisgarh - Raipur
  {
    id: 'raipur_chhattisgarh',
    name: 'Raipur, Chhattisgarh',
    aliases: ['raipur'],
    description: 'Rice bowl of India with tribal culture and natural beauty',
    imageUrl: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3',
    category: 'Cultural',
    state: 'Chhattisgarh',
    region: 'Central India',
    rating: 4.0,
    priceLevel: 1,
    location: { lat: 21.2514, lng: 81.6296 },
    highlights: ['Mahant Ghasidas Museum', 'Vivekananda Sarovar', 'Dudhadhari Math', 'Telibandha Lake'],
    bestTime: 'October-March',
    averageDays: '2-3 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'museum'],
    itinerary: {
      "2-3 days": [
        {
          day: 1,
          title: "Cultural Heritage",
          places: ["Mahant Ghasidas Museum", "Dudhadhari Math", "Gandhi Udyan", "Swami Vivekananda Sarovar"]
        },
        {
          day: 2,
          title: "Natural Beauty",
          places: ["Telibandha Lake", "Nandan Van Zoo", "Jungle Safari", "Energy Education Park"]
        },
        {
          day: 3,
          title: "Tribal Culture",
          places: ["Tribal Museum", "Purkhouti Muktangan", "Chitrakote Falls (day trip)", "Bastar Palace"]
        }
      ]
    }
  }
];

// International destinations for common searches
const internationalDestinations = [
  {
    id: 'bali_indonesia',
    name: 'Bali, Indonesia',
    aliases: ['bali'],
    description: 'Tropical paradise with beautiful beaches and temples',
    category: 'International',
    state: 'Indonesia',
    region: 'Southeast Asia',
    rating: 4.8,
    priceLevel: 2,
    location: { lat: -8.3405, lng: 115.0920 },
    highlights: ['Ubud', 'Kuta Beach', 'Tanah Lot Temple', 'Mount Batur'],
    bestTime: 'April-October',
    averageDays: '5-7 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'beach']
  },
  {
    id: 'dubai_uae',
    name: 'Dubai, UAE',
    aliases: ['dubai'],
    description: 'Modern city with luxury shopping and architecture',
    category: 'International',
    state: 'UAE',
    region: 'Middle East',
    rating: 4.7,
    priceLevel: 4,
    location: { lat: 25.2048, lng: 55.2708 },
    highlights: ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah', 'Desert Safari'],
    bestTime: 'November-March',
    averageDays: '4-6 days',
    attractions: ['tourist_attraction', 'restaurant', 'lodging', 'shopping_mall']
  }
];

// Enhanced search function for destinations (Indian + International)
export const searchIndianDestinations = (query) => {
  if (!query || query.length < 2) return [];

  const lowerQuery = query.toLowerCase().trim();
  console.log('🔍 Searching for:', lowerQuery);

  // Combine Indian and international destinations
  const allDestinations = [...indianDestinations, ...internationalDestinations];

  const results = [];

  // First pass: Exact matches (highest priority)
  allDestinations.forEach(dest => {
    const exactNameMatch = dest.name.toLowerCase() === lowerQuery ||
                          dest.name.toLowerCase().startsWith(lowerQuery + ',') ||
                          dest.name.toLowerCase().startsWith(lowerQuery + ' ');

    const exactAliasMatch = dest.aliases.some(alias =>
      alias.toLowerCase() === lowerQuery ||
      alias.toLowerCase().startsWith(lowerQuery + ',') ||
      alias.toLowerCase().startsWith(lowerQuery + ' ')
    );

    if (exactNameMatch || exactAliasMatch) {
      results.push({ ...dest, matchScore: 100 });
    }
  });

  // Second pass: Starts with matches
  if (results.length < 5) {
    allDestinations.forEach(dest => {
      // Skip if already added
      if (results.some(r => r.id === dest.id)) return;

      const startsWithName = dest.name.toLowerCase().startsWith(lowerQuery);
      const startsWithAlias = dest.aliases.some(alias =>
        alias.toLowerCase().startsWith(lowerQuery)
      );

      if (startsWithName || startsWithAlias) {
        results.push({ ...dest, matchScore: 80 });
      }
    });
  }

  // Third pass: Contains matches (but avoid partial word matches for short queries)
  if (results.length < 8 && lowerQuery.length >= 3) {
    allDestinations.forEach(dest => {
      // Skip if already added
      if (results.some(r => r.id === dest.id)) return;

      // Only match full words to avoid "bali" matching "Mahabalipuram"
      const nameWords = dest.name.toLowerCase().split(/[\s,]+/);
      const aliasWords = dest.aliases.flatMap(alias => alias.toLowerCase().split(/[\s,]+/));

      const wordMatch = nameWords.some(word => word.includes(lowerQuery)) ||
                       aliasWords.some(word => word.includes(lowerQuery));

      if (wordMatch) {
        results.push({ ...dest, matchScore: 60 });
      }
    });
  }

  // Fourth pass: State matches (lowest priority)
  if (results.length < 10) {
    allDestinations.forEach(dest => {
      // Skip if already added
      if (results.some(r => r.id === dest.id)) return;

      const stateMatch = dest.state.toLowerCase().includes(lowerQuery);

      if (stateMatch) {
        results.push({ ...dest, matchScore: 40 });
      }
    });
  }

  // Sort by match score, then by rating
  const sortedResults = results.sort((a, b) => {
    if (a.matchScore !== b.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return (b.rating || 0) - (a.rating || 0);
  });

  console.log(`🔍 Found ${sortedResults.length} results for "${lowerQuery}"`);
  return sortedResults.slice(0, 10); // Limit to top 10 results
};

// Get destinations by state
export const getDestinationsByState = (state) => {
  return indianDestinations.filter(dest => 
    dest.state.toLowerCase() === state.toLowerCase()
  );
};

// Get destinations by category
export const getDestinationsByCategory = (category) => {
  return indianDestinations.filter(dest => 
    dest.category.toLowerCase() === category.toLowerCase()
  );
};
