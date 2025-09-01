/*
 * Install the Generative AI SDK
 *
 * $ npm install @google/generative-ai
 *
 * See the getting started guide for more information
 * https://ai.google.dev/gemini-api/docs/get-started/node
 */

import { GoogleGenerativeAI } from "@google/generative-ai";


  const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_AI_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
  };
  

   export const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {text: "Generate Travel Plan for Location: Goa, India for 3 Days for 2 people with a budget of ₹15,000 (Indian Rupees). Give me a Hotels options list with HotelName, Hotel address, Price in ₹, hotel image url, geo coordinates, rating, descriptions and suggest itinerary with placeName, Place Details, Place Image Url, Geo Coordinates, ticket Pricing in ₹, rating, Time travel each of the location for 3 days with each day plan with best time to visit in JSON format. Use Indian Rupees (₹) for ALL pricing."},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "```json\n{\n  \"tripSummary\": {\n    \"destination\": \"Goa, India\",\n    \"duration\": 3,\n    \"travelers\": \"2 people\",\n    \"budget\": \"₹15,000\",\n    \"currency\": \"INR\",\n    \"totalEstimatedCost\": \"₹14,500\"\n  },\n  \"hotelOptions\": [\n    {\n      \"hotelName\": \"Hotel Mandovi\",\n      \"hotelAddress\": \"D.B. Bandodkar Marg, Panaji, Goa 403001\",\n      \"price\": \"₹2,500 per night\",\n      \"hotelImageUrl\": \"https://images.unsplash.com/photo-1571896349842-33c89424de2d\",\n      \"geoCoordinates\": {\"lat\": 15.4909, \"lng\": 73.8278},\n      \"rating\": 4.2,\n      \"description\": \"Comfortable hotel in Panaji with river views and modern amenities\"\n    },\n    {\n      \"hotelName\": \"Baga Beach Resort\",\n      \"hotelAddress\": \"Baga Beach Road, Baga, Goa 403516\",\n      \"price\": \"₹3,000 per night\",\n      \"hotelImageUrl\": \"https://images.unsplash.com/photo-1512343879784-a960bf40e7f2\",\n      \"geoCoordinates\": {\"lat\": 15.5557, \"lng\": 73.7516},\n      \"rating\": 4.0,\n      \"description\": \"Beachfront resort with easy access to Baga Beach and nightlife\"\n    }\n  ],\n  \"itinerary\": [\n    {\n      \"day\": 1,\n      \"theme\": \"Beach and Local Culture\",\n      \"activities\": [\n        {\n          \"placeName\": \"Baga Beach\",\n          \"placeDetails\": \"Famous beach with water sports, shacks, and vibrant nightlife\",\n          \"placeImageUrl\": \"https://images.unsplash.com/photo-1512343879784-a960bf40e7f2\",\n          \"geoCoordinates\": {\"lat\": 15.5557, \"lng\": 73.7516},\n          \"ticketPricing\": \"Free entry\",\n          \"rating\": 4.5,\n          \"timeToTravel\": \"15 minutes from hotel\",\n          \"bestTimeToVisit\": \"Morning\"\n        },\n        {\n          \"placeName\": \"Anjuna Flea Market\",\n          \"placeDetails\": \"Colorful market with local handicrafts, clothes, and souvenirs\",\n          \"placeImageUrl\": \"https://images.unsplash.com/photo-1578662996442-48f60103fc96\",\n          \"geoCoordinates\": {\"lat\": 15.5732, \"lng\": 73.7395},\n          \"ticketPricing\": \"Free entry\",\n          \"rating\": 4.3,\n          \"timeToTravel\": \"20 minutes\",\n          \"bestTimeToVisit\": \"Evening\"\n        }\n      ]\n    },\n    {\n      \"day\": 2,\n      \"theme\": \"Heritage and Temples\",\n      \"activities\": [\n        {\n          \"placeName\": \"Basilica of Bom Jesus\",\n          \"placeDetails\": \"UNESCO World Heritage Site with beautiful Portuguese architecture\",\n          \"placeImageUrl\": \"https://images.unsplash.com/photo-1578662996442-48f60103fc96\",\n          \"geoCoordinates\": {\"lat\": 15.5007, \"lng\": 73.9115},\n          \"ticketPricing\": \"Free entry\",\n          \"rating\": 4.7,\n          \"timeToTravel\": \"45 minutes\",\n          \"bestTimeToVisit\": \"Morning\"\n        },\n        {\n          \"placeName\": \"Dudhsagar Falls\",\n          \"placeDetails\": \"Spectacular four-tiered waterfall in the Western Ghats\",\n          \"placeImageUrl\": \"https://images.unsplash.com/photo-1506905925346-21bda4d32df4\",\n          \"geoCoordinates\": {\"lat\": 15.3144, \"lng\": 74.3144},\n          \"ticketPricing\": \"₹500 per person (including transport)\",\n          \"rating\": 4.8,\n          \"timeToTravel\": \"2 hours\",\n          \"bestTimeToVisit\": \"Afternoon\"\n        }\n      ]\n    },\n    {\n      \"day\": 3,\n      \"theme\": \"Relaxation and Departure\",\n      \"activities\": [\n        {\n          \"placeName\": \"Calangute Beach\",\n          \"placeDetails\": \"Queen of Beaches with golden sand and water sports\",\n          \"placeImageUrl\": \"https://images.unsplash.com/photo-1512343879784-a960bf40e7f2\",\n          \"geoCoordinates\": {\"lat\": 15.5435, \"lng\": 73.7516},\n          \"ticketPricing\": \"Free entry\",\n          \"rating\": 4.4,\n          \"timeToTravel\": \"10 minutes\",\n          \"bestTimeToVisit\": \"Morning\"\n        }\n      ]\n    }\n  ]\n}\n```"},
          ],
        },
      ],
    });
  
 
  
  