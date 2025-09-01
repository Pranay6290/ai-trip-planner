// Comprehensive database of Indian tourist attractions by city/state
export const indianTouristSpots = {
  // Major Cities
  mumbai: {
    name: "Mumbai",
    state: "Maharashtra",
    attractions: [
      { name: "Gateway of India", type: "monument", coordinates: { lat: 18.9220, lng: 72.8347 }, timing: "24 hours", entry: "Free", description: "Iconic arch monument overlooking Arabian Sea" },
      { name: "Marine Drive", type: "promenade", coordinates: { lat: 18.9434, lng: 72.8234 }, timing: "24 hours", entry: "Free", description: "Queen's Necklace - 3.6km waterfront promenade" },
      { name: "Elephanta Caves", type: "heritage", coordinates: { lat: 18.9633, lng: 72.9315 }, timing: "9:30 AM - 5:30 PM", entry: "₹40 + Ferry ₹150", description: "UNESCO World Heritage rock-cut temples" },
      { name: "Chhatrapati Shivaji Terminus", type: "heritage", coordinates: { lat: 18.9401, lng: 72.8353 }, timing: "24 hours", entry: "Free", description: "UNESCO World Heritage Victorian Gothic railway station" },
      { name: "Haji Ali Dargah", type: "religious", coordinates: { lat: 18.9826, lng: 72.8093 }, timing: "5:30 AM - 10:00 PM", entry: "Free", description: "Indo-Islamic shrine on islet in Arabian Sea" },
      { name: "Siddhivinayak Temple", type: "religious", coordinates: { lat: 19.0176, lng: 72.8301 }, timing: "5:30 AM - 9:00 PM", entry: "Free", description: "Famous Ganesh temple in Prabhadevi" },
      { name: "Juhu Beach", type: "beach", coordinates: { lat: 19.0990, lng: 72.8265 }, timing: "24 hours", entry: "Free", description: "Popular beach with street food and celebrity homes" },
      { name: "Bandra-Worli Sea Link", type: "bridge", coordinates: { lat: 19.0368, lng: 72.8119 }, timing: "24 hours", entry: "Toll ₹75", description: "8-lane cable-stayed bridge over Mahim Bay" },
      { name: "Crawford Market", type: "market", coordinates: { lat: 18.9467, lng: 72.8342 }, timing: "11:00 AM - 8:00 PM", entry: "Free", description: "Historic market for fruits, vegetables, and spices" },
      { name: "Hanging Gardens", type: "garden", coordinates: { lat: 18.9561, lng: 72.8052 }, timing: "5:00 AM - 9:00 PM", entry: "Free", description: "Terraced gardens on Malabar Hill with city views" },
      { name: "Chowpatty Beach", type: "beach", coordinates: { lat: 18.9547, lng: 72.8081 }, timing: "24 hours", entry: "Free", description: "Famous for street food and Ganesh Chaturthi celebrations" },
      { name: "Dhobi Ghat", type: "cultural", coordinates: { lat: 18.9833, lng: 72.8258 }, timing: "6:00 AM - 6:00 PM", entry: "Free", description: "World's largest outdoor laundry" }
    ],
    restaurants: [
      { name: "Leopold Café", cuisine: "Continental", location: "Colaba", cost: "₹800 for 2", mustTry: "Chicken Tikka, Fish & Chips" },
      { name: "Trishna", cuisine: "Seafood", location: "Fort", cost: "₹2500 for 2", mustTry: "Koliwada Prawns, Crab Curry" },
      { name: "Britannia & Co.", cuisine: "Parsi", location: "Ballard Estate", cost: "₹1200 for 2", mustTry: "Berry Pulao, Dhansak" }
    ]
  },

  delhi: {
    name: "Delhi",
    state: "Delhi",
    attractions: [
      { name: "Red Fort", type: "heritage", coordinates: { lat: 28.6562, lng: 77.2410 }, timing: "9:30 AM - 4:30 PM", entry: "₹35", description: "UNESCO World Heritage Mughal fortress" },
      { name: "India Gate", type: "monument", coordinates: { lat: 28.6129, lng: 77.2295 }, timing: "24 hours", entry: "Free", description: "War memorial arch on Rajpath" },
      { name: "Qutub Minar", type: "heritage", coordinates: { lat: 28.5245, lng: 77.1855 }, timing: "7:00 AM - 5:00 PM", entry: "₹30", description: "UNESCO World Heritage 73m tall minaret" },
      { name: "Lotus Temple", type: "religious", coordinates: { lat: 28.5535, lng: 77.2588 }, timing: "9:00 AM - 7:00 PM", entry: "Free", description: "Bahá'í House of Worship shaped like lotus" },
      { name: "Humayun's Tomb", type: "heritage", coordinates: { lat: 28.5933, lng: 77.2507 }, timing: "6:00 AM - 6:00 PM", entry: "₹30", description: "UNESCO World Heritage Mughal tomb" },
      { name: "Jama Masjid", type: "religious", coordinates: { lat: 28.6507, lng: 77.2334 }, timing: "7:00 AM - 12:00 PM, 1:30 PM - 6:30 PM", entry: "Free", description: "Largest mosque in India" },
      { name: "Chandni Chowk", type: "market", coordinates: { lat: 28.6506, lng: 77.2303 }, timing: "10:00 AM - 9:00 PM", entry: "Free", description: "Historic market in Old Delhi" },
      { name: "Akshardham Temple", type: "religious", coordinates: { lat: 28.6127, lng: 77.2773 }, timing: "9:30 AM - 6:30 PM", entry: "Free", description: "Modern Hindu temple complex" },
      { name: "Raj Ghat", type: "memorial", coordinates: { lat: 28.6419, lng: 77.2499 }, timing: "7:00 AM - 7:00 PM", entry: "Free", description: "Memorial to Mahatma Gandhi" },
      { name: "Connaught Place", type: "commercial", coordinates: { lat: 28.6315, lng: 77.2167 }, timing: "10:00 AM - 10:00 PM", entry: "Free", description: "Georgian-style commercial center" }
    ],
    restaurants: [
      { name: "Karim's", cuisine: "Mughlai", location: "Jama Masjid", cost: "₹600 for 2", mustTry: "Mutton Korma, Seekh Kebab" },
      { name: "Paranthe Wali Gali", cuisine: "North Indian", location: "Chandni Chowk", cost: "₹400 for 2", mustTry: "Stuffed Parathas" },
      { name: "Indian Accent", cuisine: "Modern Indian", location: "Lodhi Road", cost: "₹4000 for 2", mustTry: "Duck Kheer, Pork Ribs" }
    ]
  },

  kolkata: {
    name: "Kolkata",
    state: "West Bengal",
    attractions: [
      { name: "Victoria Memorial", type: "monument", coordinates: { lat: 22.5448, lng: 88.3426 }, timing: "10:00 AM - 6:00 PM", entry: "₹30", description: "White marble monument to Queen Victoria" },
      { name: "Howrah Bridge", type: "bridge", coordinates: { lat: 22.5851, lng: 88.3468 }, timing: "24 hours", entry: "Free", description: "Iconic cantilever bridge over Hooghly River" },
      { name: "Dakshineswar Kali Temple", type: "religious", coordinates: { lat: 22.6555, lng: 88.3575 }, timing: "6:00 AM - 12:30 PM, 3:00 PM - 9:00 PM", entry: "Free", description: "Famous Kali temple where Ramakrishna worshipped" },
      { name: "Park Street", type: "commercial", coordinates: { lat: 22.5488, lng: 88.3638 }, timing: "24 hours", entry: "Free", description: "Food and nightlife hub of Kolkata" },
      { name: "Kalighat Kali Temple", type: "religious", coordinates: { lat: 22.5186, lng: 88.3426 }, timing: "5:00 AM - 2:00 PM, 5:00 PM - 10:30 PM", entry: "Free", description: "One of 51 Shakti Peethas" },
      { name: "Indian Museum", type: "museum", coordinates: { lat: 22.5579, lng: 88.3511 }, timing: "10:00 AM - 5:00 PM", entry: "₹20", description: "Oldest and largest museum in India" },
      { name: "Fort William", type: "heritage", coordinates: { lat: 22.5553, lng: 88.3441 }, timing: "Restricted", entry: "Permission required", description: "British colonial fort" },
      { name: "College Street", type: "cultural", coordinates: { lat: 22.5726, lng: 88.3639 }, timing: "10:00 AM - 8:00 PM", entry: "Free", description: "Largest book market in India" },
      { name: "Belur Math", type: "religious", coordinates: { lat: 22.6320, lng: 88.3581 }, timing: "6:00 AM - 12:00 PM, 4:00 PM - 7:00 PM", entry: "Free", description: "Headquarters of Ramakrishna Mission" }
    ],
    restaurants: [
      { name: "Peter Cat", cuisine: "Continental", location: "Park Street", cost: "₹1200 for 2", mustTry: "Chelo Kebab" },
      { name: "Flurys", cuisine: "Continental", location: "Park Street", cost: "₹800 for 2", mustTry: "Pastries, English Breakfast" },
      { name: "6 Ballygunge Place", cuisine: "Bengali", location: "Ballygunge", cost: "₹1500 for 2", mustTry: "Fish Curry, Mishti Doi" }
    ]
  },

  bangalore: {
    name: "Bangalore",
    state: "Karnataka",
    attractions: [
      { name: "Bangalore Palace", type: "palace", coordinates: { lat: 12.9982, lng: 77.5920 }, timing: "10:00 AM - 5:30 PM", entry: "₹230", description: "Tudor-style palace inspired by Windsor Castle" },
      { name: "Lalbagh Botanical Garden", type: "garden", coordinates: { lat: 12.9507, lng: 77.5848 }, timing: "6:00 AM - 7:00 PM", entry: "₹10", description: "240-acre botanical garden with glass house" },
      { name: "Cubbon Park", type: "park", coordinates: { lat: 12.9762, lng: 77.5993 }, timing: "6:00 AM - 6:00 PM", entry: "Free", description: "300-acre park in heart of city" },
      { name: "ISKCON Temple", type: "religious", coordinates: { lat: 12.9716, lng: 77.6103 }, timing: "7:15 AM - 1:00 PM, 4:00 PM - 8:20 PM", entry: "Free", description: "Modern temple dedicated to Krishna" },
      { name: "Bull Temple", type: "religious", coordinates: { lat: 12.9434, lng: 77.5694 }, timing: "6:00 AM - 8:00 PM", entry: "Free", description: "16th-century temple with monolithic Nandi bull" },
      { name: "Tipu Sultan's Summer Palace", type: "heritage", coordinates: { lat: 12.9591, lng: 77.5750 }, timing: "8:30 AM - 5:30 PM", entry: "₹15", description: "18th-century wooden palace" },
      { name: "UB City Mall", type: "shopping", coordinates: { lat: 12.9719, lng: 77.6188 }, timing: "10:00 AM - 10:00 PM", entry: "Free", description: "Luxury shopping and dining destination" },
      { name: "Vidhana Soudha", type: "government", coordinates: { lat: 12.9791, lng: 77.5912 }, timing: "External viewing only", entry: "Free", description: "Seat of Karnataka state legislature" }
    ],
    restaurants: [
      { name: "MTR", cuisine: "South Indian", location: "Lalbagh Road", cost: "₹400 for 2", mustTry: "Masala Dosa, Filter Coffee" },
      { name: "Vidyarthi Bhavan", cuisine: "South Indian", location: "Basavanagudi", cost: "₹300 for 2", mustTry: "Masala Dosa" },
      { name: "Toit", cuisine: "Continental", location: "Indiranagar", cost: "₹1500 for 2", mustTry: "Craft Beer, Wood Fired Pizza" }
    ]
  },

  // Jharkhand Cities
  ranchi: {
    name: "Ranchi",
    state: "Jharkhand",
    attractions: [
      { name: "Hundru Falls", type: "waterfall", coordinates: { lat: 23.4186, lng: 85.6055 }, timing: "8:00 AM - 6:00 PM", entry: "₹10", description: "98m high waterfall on Subarnarekha River" },
      { name: "Rock Garden", type: "garden", coordinates: { lat: 23.4041, lng: 85.4298 }, timing: "9:00 AM - 8:00 PM", entry: "₹10", description: "Artistic garden with rock sculptures" },
      { name: "Jagannath Temple", type: "religious", coordinates: { lat: 23.3441, lng: 85.3096 }, timing: "5:00 AM - 10:00 PM", entry: "Free", description: "Replica of Puri Jagannath Temple" },
      { name: "Birsa Zoological Park", type: "zoo", coordinates: { lat: 23.4593, lng: 85.2528 }, timing: "8:30 AM - 5:00 PM", entry: "₹20", description: "Zoo with diverse wildlife species" },
      { name: "Jonha Falls", type: "waterfall", coordinates: { lat: 23.2931, lng: 85.4439 }, timing: "8:00 AM - 6:00 PM", entry: "₹5", description: "43m high waterfall also known as Gautamdhara" },
      { name: "Dassam Falls", type: "waterfall", coordinates: { lat: 23.4667, lng: 85.5167 }, timing: "8:00 AM - 6:00 PM", entry: "₹10", description: "44m high waterfall on Kanchi River" },
      { name: "Pahari Mandir", type: "religious", coordinates: { lat: 23.3957, lng: 85.3094 }, timing: "5:00 AM - 9:00 PM", entry: "Free", description: "Hilltop temple dedicated to Lord Shiva" },
      { name: "Tagore Hill", type: "hill", coordinates: { lat: 23.3615, lng: 85.3203 }, timing: "6:00 AM - 8:00 PM", entry: "Free", description: "Hill where Rabindranath Tagore stayed" }
    ],
    restaurants: [
      { name: "Kaveri Restaurant", cuisine: "North Indian", location: "Main Road", cost: "₹600 for 2", mustTry: "Thali, Biryani" },
      { name: "Punjabi Rasoi", cuisine: "Punjabi", location: "Circular Road", cost: "₹500 for 2", mustTry: "Butter Chicken, Naan" }
    ]
  },

  jamshedpur: {
    name: "Jamshedpur",
    state: "Jharkhand",
    attractions: [
      { name: "Jubilee Park", type: "park", coordinates: { lat: 22.7868, lng: 86.1982 }, timing: "5:00 AM - 10:00 PM", entry: "Free", description: "Large park with rose garden and lake" },
      { name: "Tata Steel Zoological Park", type: "zoo", coordinates: { lat: 22.7868, lng: 86.1982 }, timing: "8:30 AM - 5:00 PM", entry: "₹15", description: "Well-maintained zoo with diverse animals" },
      { name: "Dimna Lake", type: "lake", coordinates: { lat: 22.7196, lng: 86.0841 }, timing: "6:00 AM - 6:00 PM", entry: "₹10", description: "Artificial lake for water sports and boating" },
      { name: "Bhuvaneshwari Temple", type: "religious", coordinates: { lat: 22.8046, lng: 86.2029 }, timing: "6:00 AM - 8:00 PM", entry: "Free", description: "Ancient temple dedicated to Goddess Bhuvaneshwari" },
      { name: "Dalma Wildlife Sanctuary", type: "wildlife", coordinates: { lat: 22.8500, lng: 86.0833 }, timing: "6:00 AM - 6:00 PM", entry: "₹25", description: "Wildlife sanctuary with elephants and other animals" },
      { name: "Sir Dorabji Tata Park", type: "park", coordinates: { lat: 22.8046, lng: 86.2029 }, timing: "5:00 AM - 9:00 PM", entry: "Free", description: "Beautiful park with Japanese garden" }
    ],
    restaurants: [
      { name: "Hotel Alcor", cuisine: "Multi-cuisine", location: "Bistupur", cost: "₹800 for 2", mustTry: "Continental dishes" },
      { name: "Kwality Restaurant", cuisine: "North Indian", location: "Sakchi", cost: "₹500 for 2", mustTry: "Tandoori items" }
    ]
  },

  // More Indian Destinations
  bhubaneswar: {
    name: "Bhubaneswar",
    state: "Odisha",
    attractions: [
      { name: "Lingaraj Temple", type: "religious", coordinates: { lat: 20.2379, lng: 85.8338 }, timing: "5:00 AM - 9:30 PM", entry: "Free", description: "11th-century temple dedicated to Lord Shiva" },
      { name: "Khandagiri Caves", type: "heritage", coordinates: { lat: 20.2521, lng: 85.7803 }, timing: "8:00 AM - 6:00 PM", entry: "₹15", description: "Ancient Jain rock-cut caves" },
      { name: "Udayagiri Caves", type: "heritage", coordinates: { lat: 20.2521, lng: 85.7803 }, timing: "8:00 AM - 6:00 PM", entry: "₹15", description: "2nd century BCE rock-cut caves" },
      { name: "Nandankanan Zoo", type: "zoo", coordinates: { lat: 20.3974, lng: 85.8081 }, timing: "7:30 AM - 5:30 PM", entry: "₹30", description: "Famous zoo and botanical garden" },
      { name: "Mukteshwar Temple", type: "religious", coordinates: { lat: 20.2379, lng: 85.8338 }, timing: "6:00 AM - 8:00 PM", entry: "Free", description: "10th-century temple with exquisite carvings" },
      { name: "Rajarani Temple", type: "heritage", coordinates: { lat: 20.2379, lng: 85.8338 }, timing: "6:00 AM - 6:00 PM", entry: "₹15", description: "11th-century temple known for sculptures" },
      { name: "Dhauli Peace Pagoda", type: "monument", coordinates: { lat: 20.1929, lng: 85.8563 }, timing: "6:00 AM - 7:00 PM", entry: "Free", description: "Buddhist peace pagoda at Kalinga war site" }
    ],
    restaurants: [
      { name: "Dalma", cuisine: "Odia", location: "Jaydev Vihar", cost: "₹600 for 2", mustTry: "Pakhala, Chhena Poda" },
      { name: "Truptee", cuisine: "Vegetarian", location: "Saheed Nagar", cost: "₹400 for 2", mustTry: "South Indian, Gujarati Thali" }
    ]
  },

  guwahati: {
    name: "Guwahati",
    state: "Assam",
    attractions: [
      { name: "Kamakhya Temple", type: "religious", coordinates: { lat: 26.1665, lng: 91.7037 }, timing: "5:30 AM - 1:00 PM, 2:30 PM - 5:30 PM", entry: "Free", description: "Ancient Shakti Peeth temple" },
      { name: "Umananda Temple", type: "religious", coordinates: { lat: 26.1833, lng: 91.7333 }, timing: "6:00 AM - 6:00 PM", entry: "Ferry ₹10", description: "Temple on Peacock Island in Brahmaputra" },
      { name: "Brahmaputra River Cruise", type: "activity", coordinates: { lat: 26.1445, lng: 91.7362 }, timing: "4:00 PM - 6:00 PM", entry: "₹200", description: "Sunset cruise on mighty Brahmaputra" },
      { name: "Assam State Museum", type: "museum", coordinates: { lat: 26.1445, lng: 91.7898 }, timing: "10:00 AM - 4:30 PM", entry: "₹10", description: "Museum showcasing Assamese culture" },
      { name: "Navagraha Temple", type: "religious", coordinates: { lat: 26.1912, lng: 91.7756 }, timing: "6:00 AM - 8:00 PM", entry: "Free", description: "Temple dedicated to nine planets" },
      { name: "Basistha Ashram", type: "religious", coordinates: { lat: 26.1028, lng: 91.8081 }, timing: "6:00 AM - 7:00 PM", entry: "Free", description: "Ancient ashram with natural hot springs" },
      { name: "Pobitora Wildlife Sanctuary", type: "wildlife", coordinates: { lat: 26.2167, lng: 91.9833 }, timing: "7:00 AM - 4:00 PM", entry: "₹50", description: "Sanctuary famous for one-horned rhinoceros" }
    ],
    restaurants: [
      { name: "Paradise Restaurant", cuisine: "Assamese", location: "GS Road", cost: "₹700 for 2", mustTry: "Fish Curry, Duck Curry" },
      { name: "Khorikaa", cuisine: "Northeast", location: "Christian Basti", cost: "₹800 for 2", mustTry: "Assamese Thali, Pork dishes" }
    ]
  },

  pune: {
    name: "Pune",
    state: "Maharashtra",
    attractions: [
      { name: "Shaniwar Wada", type: "heritage", coordinates: { lat: 18.5196, lng: 73.8553 }, timing: "8:00 AM - 6:30 PM", entry: "₹25", description: "18th-century Maratha palace fortress" },
      { name: "Aga Khan Palace", type: "heritage", coordinates: { lat: 18.5679, lng: 73.8957 }, timing: "9:00 AM - 5:30 PM", entry: "₹25", description: "Palace where Gandhi was imprisoned" },
      { name: "Sinhagad Fort", type: "fort", coordinates: { lat: 18.3664, lng: 73.7562 }, timing: "6:00 AM - 6:00 PM", entry: "Free", description: "Historic hill fort with panoramic views" },
      { name: "Osho Ashram", type: "spiritual", coordinates: { lat: 18.5362, lng: 73.8847 }, timing: "6:00 AM - 10:00 PM", entry: "₹10", description: "International meditation resort" },
      { name: "Dagdusheth Halwai Ganpati Temple", type: "religious", coordinates: { lat: 18.5158, lng: 73.8567 }, timing: "4:00 AM - 11:30 PM", entry: "Free", description: "Famous Ganesh temple" },
      { name: "Pune Okayama Friendship Garden", type: "garden", coordinates: { lat: 18.5679, lng: 73.8957 }, timing: "8:00 AM - 8:00 PM", entry: "₹15", description: "Japanese-style garden" },
      { name: "Lal Mahal", type: "heritage", coordinates: { lat: 18.5158, lng: 73.8567 }, timing: "8:00 AM - 12:00 PM, 4:00 PM - 8:00 PM", entry: "₹5", description: "Replica of Shivaji's childhood palace" }
    ],
    restaurants: [
      { name: "Vaishali", cuisine: "South Indian", location: "FC Road", cost: "₹400 for 2", mustTry: "Dosa, Filter Coffee" },
      { name: "Shabree", cuisine: "Maharashtrian", location: "Multiple locations", cost: "₹600 for 2", mustTry: "Maharashtrian Thali" }
    ]
  },

  darjeeling: {
    name: "Darjeeling",
    state: "West Bengal",
    attractions: [
      { name: "Tiger Hill", type: "viewpoint", coordinates: { lat: 27.0238, lng: 88.2932 }, timing: "4:00 AM - 6:00 AM", entry: "₹30", description: "Famous sunrise viewpoint over Kanchenjunga" },
      { name: "Darjeeling Himalayan Railway", type: "heritage", coordinates: { lat: 27.0410, lng: 88.2663 }, timing: "Various", entry: "₹1200", description: "UNESCO World Heritage toy train" },
      { name: "Peace Pagoda", type: "religious", coordinates: { lat: 27.0238, lng: 88.2932 }, timing: "4:30 AM - 6:30 PM", entry: "Free", description: "Japanese Buddhist temple" },
      { name: "Batasia Loop", type: "viewpoint", coordinates: { lat: 27.0238, lng: 88.2932 }, timing: "6:00 AM - 6:00 PM", entry: "₹10", description: "Spiral railway track with war memorial" },
      { name: "Happy Valley Tea Estate", type: "plantation", coordinates: { lat: 27.0238, lng: 88.2932 }, timing: "8:00 AM - 4:30 PM", entry: "₹10", description: "Second oldest tea estate in Darjeeling" },
      { name: "Himalayan Mountaineering Institute", type: "museum", coordinates: { lat: 27.0238, lng: 88.2932 }, timing: "9:00 AM - 4:30 PM", entry: "₹10", description: "Mountaineering museum and training institute" }
    ],
    restaurants: [
      { name: "Glenary's", cuisine: "Continental", location: "Mall Road", cost: "₹800 for 2", mustTry: "Pastries, English Breakfast" },
      { name: "Kunga Restaurant", cuisine: "Tibetan", location: "Gandhi Road", cost: "₹500 for 2", mustTry: "Momos, Thukpa" }
    ]
  }
};

// Function to get attractions for any destination
export const getDestinationAttractions = (destination) => {
  const destKey = destination.toLowerCase().replace(/\s+/g, '');
  
  // Direct match
  if (indianTouristSpots[destKey]) {
    return indianTouristSpots[destKey];
  }
  
  // Partial match
  for (const [key, value] of Object.entries(indianTouristSpots)) {
    if (key.includes(destKey) || destKey.includes(key) || 
        value.name.toLowerCase().includes(destination.toLowerCase())) {
      return value;
    }
  }
  
  return null;
};

// Function to get random attractions for variety
export const getRandomAttractions = (attractions, count = 6) => {
  const shuffled = [...attractions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export default indianTouristSpots;
