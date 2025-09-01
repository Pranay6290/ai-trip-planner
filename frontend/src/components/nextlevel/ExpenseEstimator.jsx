import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CurrencyRupeeIcon, 
  ChartBarIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const ExpenseEstimator = ({ tripPlan, travelers = 2, onBudgetUpdate }) => {
  const [expenses, setExpenses] = useState(null);
  const [budgetBreakdown, setBudgetBreakdown] = useState(null);
  const [budgetStatus, setBudgetStatus] = useState('within');
  const [recommendations, setRecommendations] = useState([]);

  // Calculate detailed expenses
  useEffect(() => {
    if (tripPlan) {
      calculateExpenses();
    }
  }, [tripPlan, travelers]);

  const calculateExpenses = () => {
    const duration = tripPlan.tripSummary?.duration || 3;
    const destination = tripPlan.tripSummary?.destination || 'India';
    
    // Base costs per person per day (in INR)
    const baseCosts = getBaseCosts(destination);
    
    // Calculate accommodation
    const accommodationCost = calculateAccommodation(tripPlan.hotels, duration);
    
    // Calculate activities
    const activitiesCost = calculateActivities(tripPlan.itinerary);
    
    // Calculate food
    const foodCost = baseCosts.food * travelers * duration;
    
    // Calculate transportation
    const transportationCost = calculateTransportation(destination, duration, travelers);
    
    // Calculate miscellaneous
    const miscellaneousCost = (accommodationCost + activitiesCost + foodCost + transportationCost) * 0.15;
    
    const totalCost = accommodationCost + activitiesCost + foodCost + transportationCost + miscellaneousCost;
    
    const expenseData = {
      accommodation: accommodationCost,
      activities: activitiesCost,
      food: foodCost,
      transportation: transportationCost,
      miscellaneous: miscellaneousCost,
      total: totalCost,
      perPerson: totalCost / travelers,
      perDay: totalCost / duration
    };
    
    setExpenses(expenseData);
    
    // Create budget breakdown
    const breakdown = {
      accommodation: { amount: accommodationCost, percentage: (accommodationCost / totalCost) * 100 },
      activities: { amount: activitiesCost, percentage: (activitiesCost / totalCost) * 100 },
      food: { amount: foodCost, percentage: (foodCost / totalCost) * 100 },
      transportation: { amount: transportationCost, percentage: (transportationCost / totalCost) * 100 },
      miscellaneous: { amount: miscellaneousCost, percentage: (miscellaneousCost / totalCost) * 100 }
    };
    
    setBudgetBreakdown(breakdown);
    
    // Check budget status
    const userBudget = parseInt(tripPlan.tripSummary?.budget?.replace(/[₹,]/g, '') || '15000');
    const status = totalCost <= userBudget ? 'within' : 
                  totalCost <= userBudget * 1.2 ? 'slightly_over' : 'over';
    setBudgetStatus(status);
    
    // Generate recommendations
    generateRecommendations(expenseData, userBudget, status);
  };

  // Get base costs for different destinations
  const getBaseCosts = (destination) => {
    const costMap = {
      'goa': { food: 800, transport: 300 },
      'kerala': { food: 600, transport: 250 },
      'rajasthan': { food: 500, transport: 200 },
      'himachal': { food: 400, transport: 350 },
      'mumbai': { food: 1000, transport: 400 },
      'delhi': { food: 700, transport: 300 },
      'bangalore': { food: 800, transport: 250 },
      'kolkata': { food: 500, transport: 200 },
      'chennai': { food: 600, transport: 250 }
    };
    
    const key = Object.keys(costMap).find(k => 
      destination.toLowerCase().includes(k)
    );
    
    return costMap[key] || { food: 600, transport: 250 }; // Default
  };

  // Calculate accommodation costs
  const calculateAccommodation = (hotels, duration) => {
    if (!hotels || hotels.length === 0) return 3000 * duration; // Default ₹3000/night
    
    const avgPrice = hotels.reduce((sum, hotel) => {
      const price = parseInt(hotel.price?.replace(/[₹,]/g, '') || '3000');
      return sum + price;
    }, 0) / hotels.length;
    
    return avgPrice * duration;
  };

  // Calculate activities costs
  const calculateActivities = (itinerary) => {
    if (!itinerary || itinerary.length === 0) return 2000; // Default
    
    let totalCost = 0;
    itinerary.forEach(day => {
      if (day.activities) {
        day.activities.forEach(activity => {
          const price = parseInt(activity.ticketPricing?.replace(/[₹,]/g, '') || '200');
          totalCost += price * travelers;
        });
      }
    });
    
    return totalCost || 2000;
  };

  // Calculate transportation costs
  const calculateTransportation = (destination, duration, travelers) => {
    const baseCosts = getBaseCosts(destination);
    const localTransport = baseCosts.transport * travelers * duration;
    
    // Add intercity transport (if applicable)
    const intercityTransport = destination.toLowerCase().includes('goa') || 
                              destination.toLowerCase().includes('kerala') ? 
                              2000 * travelers : 1000 * travelers;
    
    return localTransport + intercityTransport;
  };

  // Generate budget recommendations
  const generateRecommendations = (expenses, userBudget, status) => {
    const recs = [];
    
    if (status === 'over') {
      recs.push({
        type: 'warning',
        title: 'Budget Exceeded',
        message: `Your estimated cost is ₹${Math.floor(expenses.total - userBudget)} over budget`,
        suggestions: [
          'Consider budget accommodations',
          'Reduce number of paid activities',
          'Use public transportation',
          'Try local street food'
        ]
      });
    } else if (status === 'slightly_over') {
      recs.push({
        type: 'caution',
        title: 'Slightly Over Budget',
        message: 'You might want to make minor adjustments',
        suggestions: [
          'Book accommodations in advance for better rates',
          'Look for combo tickets for attractions',
          'Consider shared transportation'
        ]
      });
    } else {
      recs.push({
        type: 'success',
        title: 'Within Budget',
        message: `You have ₹${Math.floor(userBudget - expenses.total)} remaining for extras`,
        suggestions: [
          'Add a spa session or special dining experience',
          'Consider upgrading accommodation',
          'Book additional activities or tours'
        ]
      });
    }
    
    // Add category-specific recommendations
    if (expenses.food > expenses.total * 0.4) {
      recs.push({
        type: 'tip',
        title: 'Food Budget High',
        message: 'Consider mixing restaurant meals with local street food',
        suggestions: ['Try local markets', 'Cook some meals if staying in apartments']
      });
    }
    
    setRecommendations(recs);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getBudgetStatusColor = (status) => {
    switch (status) {
      case 'within': return 'text-green-600 bg-green-50 border-green-200';
      case 'slightly_over': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'over': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getBudgetStatusIcon = (status) => {
    switch (status) {
      case 'within': return <CheckCircleIcon className="w-5 h-5" />;
      case 'slightly_over': return <ExclamationCircleIcon className="w-5 h-5" />;
      case 'over': return <ArrowTrendingUpIcon className="w-5 h-5" />;
      default: return <ChartBarIcon className="w-5 h-5" />;
    }
  };

  if (!expenses) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <CurrencyRupeeIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Smart Expense Estimation</h3>
            <p className="text-sm text-gray-600">AI-powered budget breakdown and recommendations</p>
          </div>
        </div>
      </div>

      {/* Budget Status */}
      <div className={`p-4 rounded-lg border mb-6 ${getBudgetStatusColor(budgetStatus)}`}>
        <div className="flex items-center space-x-3">
          {getBudgetStatusIcon(budgetStatus)}
          <div>
            <h4 className="font-semibold">
              Total Estimated Cost: {formatCurrency(expenses.total)}
            </h4>
            <p className="text-sm">
              {formatCurrency(expenses.perPerson)} per person • {formatCurrency(expenses.perDay)} per day
            </p>
          </div>
        </div>
      </div>

      {/* Budget Breakdown */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-4">Budget Breakdown</h4>
        <div className="space-y-3">
          {budgetBreakdown && Object.entries(budgetBreakdown).map(([category, data]) => (
            <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium capitalize">{category}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatCurrency(data.amount)}</div>
                <div className="text-sm text-gray-600">{data.percentage.toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">💡 Smart Recommendations</h4>
          {recommendations.map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              delay={index * 0.1}
              className={`p-4 rounded-lg border ${
                rec.type === 'success' ? 'bg-green-50 border-green-200' :
                rec.type === 'warning' ? 'bg-red-50 border-red-200' :
                rec.type === 'caution' ? 'bg-yellow-50 border-yellow-200' :
                'bg-blue-50 border-blue-200'
              }`}
            >
              <h5 className="font-medium mb-2">{rec.title}</h5>
              <p className="text-sm text-gray-700 mb-2">{rec.message}</p>
              {rec.suggestions && (
                <ul className="text-sm text-gray-600 space-y-1">
                  {rec.suggestions.map((suggestion, i) => (
                    <li key={i}>• {suggestion}</li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpenseEstimator;
