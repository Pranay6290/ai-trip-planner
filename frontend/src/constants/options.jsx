export const SelectBudgetOptions=[
    {
        id:1,
        title:'Cheap',
        desc:"Stay conscious of costs",
        icon:'💵',
    },
    {
        id:2,
        title:'Moderate',
        desc:"Keep cost on the average side",
        icon:'💰',
    },
    {
        id:3,
        title:'Luxury',
        desc:"Don't worry about cost",
        icon:'💎',
    },
]

export const SelectTravelList=[
    {
        id:1,
        title:'Just Me',
        desc:"A sole traveles",
        icon:'🙋🏾‍♀️',
        people:'1',
    },
    {
        id:2,
        title:'A couple',
        desc:"Two travelers",
        icon:'👫🏾',
        people:'2',
    },
    {
        id:3,
        title:'Family',
        desc:"A group of fun loving adv",
        icon:'🏡',
        people:'3 to 5 people',
    },
    {
        id:4,
        title:'Friends',
        desc:"A bunch of thrill-seekers",
        icon:'👩‍👩‍👦‍👦',
        people:'5 to 12 people',
    },
]


export const AI_PROMPT=`Generate a comprehensive travel plan for Location: {location} for {totalDays} days for {traveler} with a budget of {budget} (in Indian Rupees ₹).

IMPORTANT INSTRUCTIONS:
- Use INDIAN RUPEES (₹) for ALL prices and budget calculations
- Respect the EXACT number of travelers specified: {traveler}
- Focus on destinations within INDIA unless specifically mentioned otherwise
- Provide realistic Indian pricing for hotels, activities, and transportation

Please provide a detailed JSON response with this exact structure:

{
  "tripSummary": {
    "destination": "{location}",
    "duration": {totalDays},
    "travelers": "{traveler}",
    "budget": "{budget}",
    "currency": "INR",
    "totalEstimatedCost": "₹XX,XXX"
  },
  "hotels": [
    {
      "hotelName": "Hotel Name",
      "hotelAddress": "Complete Address",
      "price": "₹X,XXX per night",
      "hotelImageUrl": "https://example.com/image.jpg",
      "geoCoordinates": {"lat": 0.0, "lng": 0.0},
      "rating": 4.5,
      "description": "Hotel description"
    }
  ],
  "itinerary": [
    {
      "day": 1,
      "theme": "Day theme",
      "activities": [
        {
          "placeName": "Place Name",
          "placeDetails": "Detailed description",
          "placeImageUrl": "https://example.com/image.jpg",
          "geoCoordinates": {"lat": 0.0, "lng": 0.0},
          "ticketPricing": "₹XXX per person",
          "rating": 4.5,
          "timeToTravel": "30 minutes",
          "bestTimeToVisit": "Morning/Afternoon/Evening"
        }
      ]
    }
  ]
}

Generate realistic Indian prices and ensure all monetary values use ₹ symbol.`