const form = document.getElementById('travel-form');
const results = document.getElementById('results');

// Step 1: Get a Bearer token
async function getToken() {
  const clientId = 'bGT7DcLPGsbIB99GSL9wrEBSyZIOleAv';        
  const clientSecret = 'sGaKRh4ckhbjdIlS'; 

  const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
  });

  const data = await response.json();
  console.log('🔑 Token:', data.access_token);
  return data.access_token;
}

// Step 2: Call Flight Offers API with user input
async function searchFlights(origin, destination, departureDate, maxPrice) {
  const token = await getToken();

  const url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${departureDate}&adults=1&maxPrice=${maxPrice}&currencyCode=USD`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  console.log('📦 API response:', data);
  return data;
}

// Step 3: Handle form submission
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  // Uncomment the lines below to use dynamic form inputs
  const origin = document.getElementById('origin').value.trim().toUpperCase() || 'CLT';
  const destination = document.getElementById('destination').value.trim().toUpperCase() || 'LAX';
  const budget = document.getElementById('budget').value || '500';
  const travelDate = document.getElementById('travel-date').value || '2025-08-20';

  results.innerHTML = '🔍 Searching for flights...';

  try {
    const data = await searchFlights(origin, destination, travelDate, budget);

    if (data?.data?.length) {
      results.innerHTML = data.data.slice(0, 5).map((flight, index) => {
        const itinerary = flight.itineraries[0];
        const segments = itinerary.segments;
        const firstSegment = segments[0];
        const lastSegment = segments[segments.length - 1];

        const departureTime = new Date(firstSegment.departure.at).toLocaleString();
        const arrivalTime = new Date(lastSegment.arrival.at).toLocaleString();
        const airline = flight.validatingAirlineCodes[0];
        const price = flight.price.total;

        return `
          <div class="destination">
            <h3>✈️ Flight ${index + 1}</h3>
            <p><strong>Airline:</strong> ${airline}</p>
            <p><strong>From:</strong> ${firstSegment.departure.iataCode} at ${departureTime}</p>
            <p><strong>To:</strong> ${lastSegment.arrival.iataCode} at ${arrivalTime}</p>
            <p><strong>Duration:</strong> ${itinerary.duration.replace('PT', '').toLowerCase()}</p>
            <p><strong>Stops:</strong> ${segments.length - 1}</p>
            <p><strong>Price:</strong> $${price} USD</p>
          </div>
        `;
      }).join('');
    } else {
      results.innerHTML = '⚠️ No flights found. Try adjusting your search.';
    }

    form.reset(); // Clear form after submission

  } catch (error) {
    console.error('❌ Fetch error:', error);
    results.innerHTML = '❌ Failed to fetch flight offers. Please check your inputs and try again.';
  }
});
