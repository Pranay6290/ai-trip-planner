// Comprehensive global destinations database
export const globalDestinations = {
  // INDIA - Major Cities
  mumbai: {
    name: "Mumbai", country: "India", continent: "Asia",
    attractions: [
      { name: "Gateway of India", type: "monument", entry: "Free", timing: "24 hours", duration: "1 hour", description: "Iconic arch monument overlooking Arabian Sea", coordinates: { lat: 18.9220, lng: 72.8347 } },
      { name: "Marine Drive", type: "promenade", entry: "Free", timing: "24 hours", duration: "2 hours", description: "Queen's Necklace - 3.6km waterfront promenade", coordinates: { lat: 18.9434, lng: 72.8234 } },
      { name: "Elephanta Caves", type: "heritage", entry: "₹40 + Ferry ₹150", timing: "9:30 AM - 5:30 PM", duration: "3 hours", description: "UNESCO World Heritage rock-cut temples", coordinates: { lat: 18.9633, lng: 72.9315 } },
      { name: "Chhatrapati Shivaji Terminus", type: "heritage", entry: "Free", timing: "24 hours", duration: "30 minutes", description: "UNESCO World Heritage Victorian Gothic railway station", coordinates: { lat: 18.9401, lng: 72.8353 } },
      { name: "Haji Ali Dargah", type: "religious", entry: "Free", timing: "5:30 AM - 10:00 PM", duration: "1 hour", description: "Indo-Islamic shrine on islet in Arabian Sea", coordinates: { lat: 18.9826, lng: 72.8093 } },
      { name: "Siddhivinayak Temple", type: "religious", entry: "Free", timing: "5:30 AM - 9:00 PM", duration: "1 hour", description: "Famous Ganesh temple in Prabhadevi", coordinates: { lat: 19.0176, lng: 72.8301 } }
    ],
    restaurants: [
      { name: "Leopold Café", cuisine: "Continental", cost: "₹800 for 2", mustTry: "Chicken Tikka, Fish & Chips", location: "Colaba" },
      { name: "Trishna", cuisine: "Seafood", cost: "₹2500 for 2", mustTry: "Koliwada Prawns, Crab Curry", location: "Fort" }
    ],
    transport: { metro: true, taxi: true, bus: true, auto: true },
    bestTime: "October to February",
    currency: "INR"
  },

  delhi: {
    name: "Delhi", country: "India", continent: "Asia",
    attractions: [
      { name: "Red Fort", type: "heritage", entry: "₹35", timing: "9:30 AM - 4:30 PM", duration: "2 hours", description: "UNESCO World Heritage Mughal fortress", coordinates: { lat: 28.6562, lng: 77.2410 } },
      { name: "India Gate", type: "monument", entry: "Free", timing: "24 hours", duration: "1 hour", description: "War memorial arch on Rajpath", coordinates: { lat: 28.6129, lng: 77.2295 } },
      { name: "Qutub Minar", type: "heritage", entry: "₹30", timing: "7:00 AM - 5:00 PM", duration: "1.5 hours", description: "UNESCO World Heritage 73m tall minaret", coordinates: { lat: 28.5245, lng: 77.1855 } },
      { name: "Lotus Temple", type: "religious", entry: "Free", timing: "9:00 AM - 7:00 PM", duration: "1 hour", description: "Bahá'í House of Worship shaped like lotus", coordinates: { lat: 28.5535, lng: 77.2588 } }
    ],
    restaurants: [
      { name: "Karim's", cuisine: "Mughlai", cost: "₹600 for 2", mustTry: "Mutton Korma, Seekh Kebab", location: "Jama Masjid" },
      { name: "Paranthe Wali Gali", cuisine: "North Indian", cost: "₹400 for 2", mustTry: "Stuffed Parathas", location: "Chandni Chowk" }
    ],
    transport: { metro: true, taxi: true, bus: true, auto: true },
    bestTime: "October to March",
    currency: "INR"
  },

  // INTERNATIONAL DESTINATIONS
  paris: {
    name: "Paris", country: "France", continent: "Europe",
    attractions: [
      { name: "Eiffel Tower", type: "monument", entry: "€29", timing: "9:30 AM - 11:45 PM", duration: "2 hours", description: "Iconic iron lattice tower and symbol of Paris", coordinates: { lat: 48.8584, lng: 2.2945 } },
      { name: "Louvre Museum", type: "museum", entry: "€17", timing: "9:00 AM - 6:00 PM", duration: "3 hours", description: "World's largest art museum, home to Mona Lisa", coordinates: { lat: 48.8606, lng: 2.3376 } },
      { name: "Notre-Dame Cathedral", type: "religious", entry: "Free", timing: "8:00 AM - 6:45 PM", duration: "1 hour", description: "Medieval Catholic cathedral with Gothic architecture", coordinates: { lat: 48.8530, lng: 2.3499 } },
      { name: "Arc de Triomphe", type: "monument", entry: "€13", timing: "10:00 AM - 11:00 PM", duration: "1 hour", description: "Triumphal arch at western end of Champs-Élysées", coordinates: { lat: 48.8738, lng: 2.2950 } }
    ],
    restaurants: [
      { name: "Le Comptoir Relais", cuisine: "French", cost: "€80 for 2", mustTry: "Coq au Vin, Crème Brûlée", location: "Saint-Germain" },
      { name: "L'As du Fallafel", cuisine: "Middle Eastern", cost: "€25 for 2", mustTry: "Falafel, Shawarma", location: "Marais" }
    ],
    transport: { metro: true, taxi: true, bus: true, bike: true },
    bestTime: "April to June, September to October",
    currency: "EUR"
  },

  london: {
    name: "London", country: "United Kingdom", continent: "Europe",
    attractions: [
      { name: "Big Ben", type: "monument", entry: "Free (exterior)", timing: "24 hours", duration: "30 minutes", description: "Iconic clock tower at Palace of Westminster", coordinates: { lat: 51.4994, lng: -0.1245 } },
      { name: "Tower of London", type: "heritage", entry: "£29.90", timing: "9:00 AM - 5:30 PM", duration: "3 hours", description: "Historic castle housing Crown Jewels", coordinates: { lat: 51.5081, lng: -0.0759 } },
      { name: "British Museum", type: "museum", entry: "Free", timing: "10:00 AM - 5:30 PM", duration: "3 hours", description: "World-famous museum with artifacts from around globe", coordinates: { lat: 51.5194, lng: -0.1270 } },
      { name: "London Eye", type: "attraction", entry: "£27", timing: "11:00 AM - 6:00 PM", duration: "1 hour", description: "Giant observation wheel on South Bank", coordinates: { lat: 51.5033, lng: -0.1196 } }
    ],
    restaurants: [
      { name: "Dishoom", cuisine: "Indian", cost: "£50 for 2", mustTry: "Black Daal, Chicken Ruby", location: "Covent Garden" },
      { name: "Borough Market", cuisine: "Various", cost: "£30 for 2", mustTry: "Artisan foods, Street food", location: "Southwark" }
    ],
    transport: { tube: true, taxi: true, bus: true, bike: true },
    bestTime: "May to September",
    currency: "GBP"
  },

  tokyo: {
    name: "Tokyo", country: "Japan", continent: "Asia",
    attractions: [
      { name: "Senso-ji Temple", type: "religious", entry: "Free", timing: "6:00 AM - 5:00 PM", duration: "2 hours", description: "Ancient Buddhist temple in Asakusa", coordinates: { lat: 35.7148, lng: 139.7967 } },
      { name: "Tokyo Skytree", type: "observation", entry: "¥2100", timing: "8:00 AM - 10:00 PM", duration: "2 hours", description: "Tallest structure in Japan with panoramic views", coordinates: { lat: 35.7101, lng: 139.8107 } },
      { name: "Meiji Shrine", type: "religious", entry: "Free", timing: "5:00 AM - 6:30 PM", duration: "1.5 hours", description: "Shinto shrine dedicated to Emperor Meiji", coordinates: { lat: 35.6764, lng: 139.6993 } },
      { name: "Tsukiji Outer Market", type: "market", entry: "Free", timing: "5:00 AM - 2:00 PM", duration: "2 hours", description: "Famous fish market with fresh sushi", coordinates: { lat: 35.6654, lng: 139.7707 } }
    ],
    restaurants: [
      { name: "Sukiyabashi Jiro", cuisine: "Sushi", cost: "¥40000 for 2", mustTry: "Omakase Sushi", location: "Ginza" },
      { name: "Ichiran Ramen", cuisine: "Ramen", cost: "¥2000 for 2", mustTry: "Tonkotsu Ramen", location: "Shibuya" }
    ],
    transport: { metro: true, taxi: true, bus: true, train: true },
    bestTime: "March to May, September to November",
    currency: "JPY"
  },

  newyork: {
    name: "New York", country: "United States", continent: "North America",
    attractions: [
      { name: "Statue of Liberty", type: "monument", entry: "$23", timing: "8:30 AM - 4:00 PM", duration: "3 hours", description: "Iconic symbol of freedom on Liberty Island", coordinates: { lat: 40.6892, lng: -74.0445 } },
      { name: "Central Park", type: "park", entry: "Free", timing: "6:00 AM - 1:00 AM", duration: "3 hours", description: "843-acre park in Manhattan", coordinates: { lat: 40.7829, lng: -73.9654 } },
      { name: "Empire State Building", type: "observation", entry: "$37", timing: "8:00 AM - 2:00 AM", duration: "2 hours", description: "Art Deco skyscraper with city views", coordinates: { lat: 40.7484, lng: -73.9857 } },
      { name: "Times Square", type: "commercial", entry: "Free", timing: "24 hours", duration: "2 hours", description: "Bright lights and Broadway theaters", coordinates: { lat: 40.7580, lng: -73.9855 } }
    ],
    restaurants: [
      { name: "Katz's Delicatessen", cuisine: "Jewish", cost: "$40 for 2", mustTry: "Pastrami Sandwich", location: "Lower East Side" },
      { name: "Joe's Pizza", cuisine: "Italian", cost: "$20 for 2", mustTry: "New York Style Pizza", location: "Multiple locations" }
    ],
    transport: { subway: true, taxi: true, bus: true, bike: true },
    bestTime: "April to June, September to November",
    currency: "USD"
  },

  // More Indian destinations
  kolkata: {
    name: "Kolkata", country: "India", continent: "Asia",
    attractions: [
      { name: "Victoria Memorial", type: "monument", entry: "₹30", timing: "10:00 AM - 6:00 PM", duration: "2 hours", description: "White marble monument to Queen Victoria", coordinates: { lat: 22.5448, lng: 88.3426 } },
      { name: "Howrah Bridge", type: "bridge", entry: "Free", timing: "24 hours", duration: "30 minutes", description: "Iconic cantilever bridge over Hooghly River", coordinates: { lat: 22.5851, lng: 88.3468 } },
      { name: "Dakshineswar Kali Temple", type: "religious", entry: "Free", timing: "6:00 AM - 12:30 PM, 3:00 PM - 9:00 PM", duration: "1.5 hours", description: "Famous Kali temple where Ramakrishna worshipped", coordinates: { lat: 22.6555, lng: 88.3575 } }
    ],
    restaurants: [
      { name: "Peter Cat", cuisine: "Continental", cost: "₹1200 for 2", mustTry: "Chelo Kebab", location: "Park Street" },
      { name: "6 Ballygunge Place", cuisine: "Bengali", cost: "₹1500 for 2", mustTry: "Fish Curry, Mishti Doi", location: "Ballygunge" }
    ],
    transport: { metro: true, taxi: true, bus: true, tram: true },
    bestTime: "October to March",
    currency: "INR"
  }
};

// Function to get destination data
export const getGlobalDestination = (destination) => {
  const destKey = destination.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '');
  
  // Direct match
  if (globalDestinations[destKey]) {
    return globalDestinations[destKey];
  }
  
  // Partial match
  for (const [key, value] of Object.entries(globalDestinations)) {
    if (key.includes(destKey) || destKey.includes(key) || 
        value.name.toLowerCase().includes(destination.toLowerCase())) {
      return value;
    }
  }
  
  return null;
};

// Function to get attractions with variety
export const getVariedAttractions = (attractions, count = 6, preferences = {}) => {
  if (!attractions || attractions.length === 0) return [];
  
  // Shuffle and ensure variety by type
  const types = [...new Set(attractions.map(a => a.type))];
  const result = [];
  
  // Try to get at least one of each type
  types.forEach(type => {
    const typeAttractions = attractions.filter(a => a.type === type);
    if (typeAttractions.length > 0 && result.length < count) {
      result.push(typeAttractions[Math.floor(Math.random() * typeAttractions.length)]);
    }
  });
  
  // Fill remaining slots randomly
  while (result.length < count && result.length < attractions.length) {
    const remaining = attractions.filter(a => !result.includes(a));
    if (remaining.length > 0) {
      result.push(remaining[Math.floor(Math.random() * remaining.length)]);
    } else {
      break;
    }
  }
  
  return result.slice(0, count);
};

// Function to calculate travel time between attractions
export const calculateTravelTime = (from, to, mode = 'taxi') => {
  // Simplified calculation - in real app, use Google Distance Matrix API
  const modes = {
    'walk': 5, // 5 km/h
    'taxi': 25, // 25 km/h in city traffic
    'metro': 35, // 35 km/h average
    'bus': 20 // 20 km/h with stops
  };
  
  const speed = modes[mode] || 25;
  const distance = Math.sqrt(
    Math.pow(to.lat - from.lat, 2) + Math.pow(to.lng - from.lng, 2)
  ) * 111; // Rough km conversion
  
  const timeHours = distance / speed;
  const timeMinutes = Math.round(timeHours * 60);
  
  return {
    distance: Math.round(distance * 10) / 10,
    time: timeMinutes,
    mode: mode,
    cost: Math.round(distance * (mode === 'taxi' ? 15 : mode === 'metro' ? 5 : 10))
  };
};

export default globalDestinations;
