// Client Configuration - EASY TO MANAGE
// Add new clients here by copying an existing entry and changing the values

export const CLIENTS = {
  'demo': {
    name: 'Demo Hospital',
    logo: '🏥',
    color: '#2563eb',
    description: 'Demo environment for testing'
  },
  'abc-hospital': {
    name: 'ABC Hospital',
    logo: '🏥',
    color: '#059669',
    description: 'ABC Hospital HAS implementation'
  },
  'st-marys': {
    name: 'St. Mary\'s Medical Center',
    logo: '🏥',
    color: '#dc2626',
    description: 'St. Mary\'s HAS implementation'
  },
  'metro-health': {
    name: 'Metro Health System',
    logo: '🏥',
    color: '#059669',
    description: 'Metro Health HAS project'
  },
  'community-care': {
    name: 'Community Care Hospital',
    logo: '🏥',
    color: '#7c3aed',
    description: 'Community Care implementation'
  }
  // Add more clients here as needed
  // Example:
  // 'new-hospital': {
  //   name: 'New Hospital Name',
  //   logo: '🏥',
  //   color: '#f59e0b',
  //   description: 'Description of the project'
  // }
};

// Helper function to add a new client
export function addClient(clientId, name, color = '#2563eb', logo = '🏥', description = '') {
  CLIENTS[clientId] = {
    name,
    logo,
    color,
    description
  };
  console.log(`Client "${name}" added with ID "${clientId}"`);
  console.log(`URL: ${window.location.origin}${window.location.pathname}?client=${clientId}`);
}

// Helper function to get client URL
export function getClientUrl(clientId) {
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?client=${clientId}`;
}

// Helper function to get admin URL
export function getAdminUrl() {
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?admin=true`;
} 