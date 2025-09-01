import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import GooglePlacesAutocomplete from "react-google-places-autocomplete"
import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import workingAIService from "../services/workingAIService"
import { doc, setDoc } from "firebase/firestore"
import { db } from "../service/firebaseConfig"
import {
  MapPinIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

// Budget options with modern styling
const SelectBudgetOptions = [
  {
    id: 1,
    title: 'Budget',
    desc: "Stay conscious of costs",
    icon: '💵',
    range: '$500 - $1,500'
  },
  {
    id: 2,
    title: 'Moderate',
    desc: "Keep cost on the average side",
    icon: '💰',
    range: '$1,500 - $3,000'
  },
  {
    id: 3,
    title: 'Luxury',
    desc: "Don't worry about cost",
    icon: '💎',
    range: '$3,000+'
  },
];

const SelectTravelList = [
  {
    id: 1,
    title: 'Just Me',
    desc: "A solo traveler's adventure",
    icon: '🙋‍♀️',
    people: '1 person',
  },
  {
    id: 2,
    title: 'A Couple',
    desc: "Two travelers in love",
    icon: '💑',
    people: '2 people',
  },
  {
    id: 3,
    title: 'Family',
    desc: "A group of fun loving adventurers",
    icon: '👨‍👩‍👧‍👦',
    people: '3 to 5 people',
  },
  {
    id: 4,
    title: 'Friends',
    desc: "A bunch of thrill-seekers",
    icon: '👥',
    people: '5 to 12 people',
  },
];

function CreateTrip() {
  const [place, setPlace] = useState();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  const OnGenerateTrip = async () => {
    if (!currentUser) {
      toast.error('Please sign in to create a trip');
      navigate('/login');
      return;
    }
      return ;
    }
    if(formData?.totalDays>5 || !formData?.location || !formData?.budget || !formData?.traveler){
      toast("Please fill all details!")
      return ;
    }
    toast("Form generated.");
    setLoading(true);
    const FINAL_PROMPT=AI_PROMPT
    .replace('{location}',formData?.location)
    .replace('{totalDays}',formData?.totalDays)
    .replace('{traveler}',formData?.traveler)
    .replace('{budget}',formData?.budget)

    // Use working AI service instead of direct AI call
    const tripQuery = `${formData?.totalDays} days in ${formData?.location?.label} for ${formData?.traveler} people budget ₹${formData?.budget}`;
    const result = await workingAIService.generateTrip(tripQuery);

    setLoading(false);
    SaveAiTrip(JSON.stringify(result));
  } 

  const SaveAiTrip=async(TripData) => {
    setLoading(true);
    const user=JSON.parse(localStorage.getItem("user"));
    const docId=Date.now().toString();
    await setDoc(doc(db, "AiTrips", docId), {
      userSelection:formData,
      tripData:JSON.parse(TripData),
      userEmail:user?.email,
      id:docId
    });
    setLoading(false);
    navigate('/view-trip/'+docId);
  }

  const GetUserProfile=(tokenInfo)=>{
    axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?acess_token=${tokenInfo?.access_token}`,{
      headers: {
       Authorization: `Bearer ${tokenInfo?.access_token}`,
       Accept:'Application/json'
      }
    }).then((resp) => {console.log(resp);
      localStorage.setItem('user',JSON.stringify(resp.data));
      setOpenDialog(false);
      OnGenerateTrip();
    })
  }

  return (
    <div className="px-5 mt-12 sm:px-10 md:px-32 lg:px-56 xl:px-72">
     <div>
     <h2 className="font-bold text-3xl ">Tell us your travel preferences 🌍✈️🌴</h2>
     <p className="mt-3 text-gray-600 text-xl">Just provide some basic information,and our trip planner will generate a customized itinerary based on your preferences.</p>
     </div>

      <div className="mt-20 flex flex-col gap-10 ">
       <div className="mb-5">
        <label className="text-xl mb-3 font-medium">What is destination of choice?</label>
          <GooglePlacesAutocomplete
          apiKey={import.meta.env.VITE_GOOGLE_PLACES_API_KEY}
          selectProps={{
            place,
            onChange:(v)=>{setPlace(v); handleInputChange('location',v.label)}
          }}
        />
       </div>

        <div className="mb-5">
          <label className="text-xl font-medium">How many days are you planning your trip?</label>
          <Input placeholder={'ex.3'} type='number' min="1" 
          onChange={(v)=>handleInputChange('totalDays',v.target.value)}/>
        </div>

        <div>
            <label className="text-xl my-3 font-medium">What is Your Budget?</label>
            <p>The budget is exclusively allocated for activities and dining purposes. </p>
            <div className="grid grid-cols-3 gap-5 mt-5 mb-5">
              {SelectBudgetOptions.map((item,index)=>(
                <div key={index} 
                onClick={()=>handleInputChange('budget',item.title)}
                className={`cursor-pointer p-4 border rounded-lg hover:shadow-lg
                ${formData?.budget==item.title&&'shadow-lg border-cyan-500'}
                `}>
                  <h2 className="text-3xl">{item.icon}</h2>
                  <h2 className="font-bold text-lg">{item.title}</h2>
                  <h2 className="text-sm text-gray-500">{item.desc}</h2>
                </div>
              ))}
            </div>

            <label className="text-xl font-medium my-3"> Who do you plan on traveling with on your next adventure?</label>
            <div className="grid grid-cols-3 gap-5 mt-5">
              {SelectTravelList.map(( item,index)=>(
                <div key={index}
                onClick={()=>handleInputChange('traveler',item.people)}
                className={`cursor-pointer p-4 border rounded-lg hover:shadow-lg
                  ${formData?.traveler==item.people&&'shadow-lg border-cyan-500'}
                  `}>
                  <h2 className="text-3xl">{item.icon}</h2> 
                  <h2 className="text-lg font-bold">{item.title}</h2> 
                  <h2 className="text-sm text-gray-500">{item.desc}</h2> 
                </div>
              ))}
            </div>
        </div>
      </div>
      <div className="my-10 flex justify-end ">
        <Button onClick={OnGenerateTrip} disabled={loading} >
          {loading ? 
          <AiOutlineLoading3Quarters className="h-7 w-7 animate-spin" />
           : 'Generate Trip' }
          </Button>
      </div>

      <Dialog open={openDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogDescription>
              <img src="/logo.svg"/>
              <h2 className="font-bold text-lg mt-6">Sign In with Google</h2>
              <p>Sign In to the App with Google authentication securely</p>
              <Button 
              onClick={login} className="w-full mt-5 flex gap-4 items-center">
                <FcGoogle className="h-7 w-7"/>
                Sign In With Google
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default CreateTrip
