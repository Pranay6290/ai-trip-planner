import { Button } from '@/components/ui/button';
import { GetPlaceDetails, PHOTO_REF_URL } from '@/service/GlobalApi';
import React, { useEffect, useState } from 'react'
import { FaLocationDot } from "react-icons/fa6";
import { Link } from 'react-router-dom';

function PlaceCardItem({ place }) {
    const [photoUrl, setPhotoUrl] = useState();

    useEffect(() => {
        place && GetPlaceImg();
    }, [place])

    const GetPlaceImg = async () => {
        const data = {
            textQuery: place.placeName
        }
        const result = await GetPlaceDetails(data).then(resp => {
            const PhotoUrl = PHOTO_REF_URL.replace('{NAME}', resp.data.places[0].photos[3].name)
            setPhotoUrl(PhotoUrl);

        })
    }
    // Enhanced map link generation - prioritize place name search
    const getMapLink = () => {
        // Prioritize place name search for better user experience
        if (place?.placeName) {
            // Search by place name (most accurate for users)
            const searchQuery = encodeURIComponent(place.placeName);
            return `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
        }

        // Use coordinates as fallback only
        if (place?.geoCoordinates && place.geoCoordinates.lat && place.geoCoordinates.lng) {
            return `https://www.google.com/maps?q=${place.geoCoordinates.lat},${place.geoCoordinates.lng}`;
        }

        // Last resort fallback
        return `https://www.google.com/maps/search/?api=1&query=tourist+attraction`;
    };

    return (
        <div>
            <Link to={getMapLink()} target='_blank'>
                <div className='my-4 bg-gray-50 p-2 gap-2 border rounded-lg flex flex-cols-2 hover:scale-105 transition-all hover:shadow-md cursor-pointer '>
                    <div className='py-2 mx-3'>
                        <img src={photoUrl ? photoUrl : '/public/road-trip-vacation.jpg'} className='w-[140px] h-[140px] rounded-xl object-cover' />
                    </div>
                    <div>
                        <h2 className='font-medium text-sm text-orange-600'>{place.time}</h2>
                        <h2 className='font-bold'>{place.placeName}</h2>
                        <p className='text-sm text-gray-500'>{place.placeDetails}</p>
                        <h2 className='text-blue-700 text-sm'>{place.ticketPricing}</h2>
                        <h2 className='text-sm text-yellow-500'>⭐{place.rating}</h2>
                    </div>
                    <div className='mt-36'>
                        <Button><FaLocationDot /></Button>
                    </div>
                </div>
            </Link>
        </div>
    )
}

export default PlaceCardItem
