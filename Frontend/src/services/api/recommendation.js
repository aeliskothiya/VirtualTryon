import API from '../axios';

// Get outfit recommendations
export const getRecommendations = (bottomItemId, occasion = '', suggestionCount = 5) => {
  return API.post('/recommend', {
    bottom_item_id: bottomItemId,
    occasion,
    suggestion_count: suggestionCount,
  });
};

// Get recommendation history
export const getRecommendationHistory = () => {
  return API.get('/recommend/history');
};

// Occasion options available
export const OCCASION_OPTIONS = [
  'casual',
  'formal',
  'office',
  'party',
  'sports',
  'beach',
  'outdoor',
  'date',
  'business',
  'semi-formal',
  'evening',
];
