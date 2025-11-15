import React, { useState, useEffect } from 'react';
import { LogOut, PlusCircle, Compass, MapPin, User, Clock, Package, CheckCircle, Truck, RefreshCw } from 'lucide-react';
import { FormInput, PRIMARY_RED, DARK_CHARCOAL, MessageDisplay } from './Shared';

// --- DUMMY DATA & MOCK API FUNCTIONS ---
const MOCK_DONATIONS_DATA = [
    {
        id: 101,
        foodType: 'Rice',
        quantity: 15,
        expiresInHours: 3,
        location: '123 Main St, New Delhi',
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        ngoName: null,
        ngoLocation: null,
    },
    {
        id: 102,
        foodType: 'Bread & Pastries',
        quantity: 50,
        expiresInHours: 1,
        location: '45B Sector 18, Gurgaon',
        status: 'accepted',
        createdAt: new Date(Date.now() - 7200000), // 2 hours ago
        ngoName: 'Feeding Hands NGO',
        ngoLocation: { lat: 28.5355, lng: 77.3910 }, // Example coordinates for Noida
    },
    {
        id: 103,
        foodType: 'Canned Vegetables',
        quantity: 20,
        expiresInHours: 48,
        location: 'Near Central Market, Noida',
        status: 'picked',
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        ngoName: 'City Helpers Foundation',
        ngoLocation: { lat: 28.5772, lng: 77.2600 }, // Example coordinates for East Delhi
    },
];

const MOCK_CURRENT_USER = {
    name: "Aman Sharma",
    location: { lat: 28.6139, lng: 77.2090 }, // Example coordinates for Connaught Place, New Delhi
    locationText: 'Central Market, Connaught Place, New Delhi',
};

// Mock function to simulate fetching donations
const mockFetchDonations = () => {
    return new Promise(resolve => {
        setTimeout(() => {
            // In a real app, this would be a fetch to /donations/my
            resolve(MOCK_DONATIONS_DATA.map(d => ({
                ...d,
                // Simulate location update only for the accepted one
                ngoLocation: d.status === 'onTheWay' || d.status === 'accepted' ? { lat: d.ngoLocation.lat + (Math.random() - 0.5) * 0.002, lng: d.ngoLocation.lng + (Math.random() - 0.5) * 0.002 } : d.ngoLocation
            })));
        }, 500);
    });
};

// --- HELPER COMPONENTS ---

const StatusIcon = ({ status }) => {
    switch (status) {
        case 'pending':
            return <Clock className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" />;
        case 'accepted':
            return <CheckCircle className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" />;
        case 'onTheWay':
            return <Truck className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />;
        case 'picked':
            return <Package className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" />;
        default:
            return <Package className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />;
    }
};

const DonationItem = ({ donation }) => {
    const formattedTime = new Date(donation.createdAt).toLocaleTimeString();

    return (
        <div className="p-4 border-b border-gray-100 last:border-b-0 flex items-start space-x-3">
            <StatusIcon status={donation.status} />
            <div className="flex-1 min-w-0">
                <p className="text-md font-semibold text-gray-800 truncate">Food: {donation.foodType}</p>
                <div className="text-sm text-gray-500 mt-0.5 space-y-1">
                    <p>Qty: {donation.quantity} units, Expires In: {donation.expiresInHours} hours</p>
                    <p className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" /> Location: {donation.location}
                    </p>
                    {donation.ngoName && (
                        <p className="font-medium text-gray-700">Accepted By: <span className="text-[#CC3D4B]">{donation.ngoName}</span></p>
                    )}
                    <p className={`font-bold uppercase text-xs pt-1 ${donation.status === 'pending' ? 'text-yellow-600' :
                            donation.status === 'accepted' ? 'text-blue-600' :
                                donation.status === 'onTheWay' ? 'text-green-600' : 'text-gray-600'
                        }`}>
                        Status: {donation.status} (Created at {formattedTime})
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- LIVE TRACKING MAP COMPONENT ---
const LiveTrackingMap = ({ donorLocation, ngoLocation }) => {

    // Simple distance calculation (Haversine formula - simplified for illustration)
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (ngoLocation.lat - donorLocation.lat) * (Math.PI / 180);
    const dLon = (ngoLocation.lng - donorLocation.lng) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(donorLocation.lat * (Math.PI / 180)) * Math.cos(ngoLocation.lat * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;

    // Mock ETA calculation (e.g., 20 km/h)
    const mockSpeedKmh = 20;
    const etaMinutes = Math.round((distanceKm / mockSpeedKmh) * 60);

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold mb-4 flex items-center" style={{ color: DARK_CHARCOAL }}>
                <Compass className="w-5 h-5 mr-2 text-blue-500" /> Live Tracking
            </h3>

            {/* Mock Map View */}
            <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="text-center">
                    <p className="text-gray-600 font-bold mb-2">Map View Placeholder</p>
                    <div className="flex justify-center space-x-8">
                        <div className="flex flex-col items-center">
                            <MapPin className="w-8 h-8 text-[#CC3D4B] animate-pulse" />
                            <span className="text-sm font-semibold mt-1">Your Location</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Truck className="w-8 h-8 text-green-600 animate-bounce" />
                            <span className="text-sm font-semibold mt-1">NGO Vehicle</span>
                        </div>
                    </div>
                </div>
                {/* Distance Indicator Overlay */}
                <div className="absolute top-4 left-4 bg-white p-2 rounded-lg shadow-md text-sm font-medium">
                    Distance: <span className="text-blue-600">{distanceKm.toFixed(2)} km</span>
                </div>
                <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-md text-sm font-medium">
                    ETA: <span className="text-green-600">{etaMinutes > 0 ? `${etaMinutes} min` : 'Arrived!'}</span>
                </div>
            </div>

            <p className="mt-4 text-center text-sm text-gray-600">
                Tracking live location of NGO vehicle accepting your donation. Location refreshes every 5 seconds.
            </p>
        </div>
    );
};


// --- MAIN DASHBOARD COMPONENT ---

const DonorDashboard = ({ onLogout }) => {
    const [donations, setDonations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [donationForm, setDonationForm] = useState({
        foodType: '',
        quantity: '',
        expiresInHours: '',
        locationText: MOCK_CURRENT_USER.locationText, // Pre-fill with user's location
        gpsCoordinates: MOCK_CURRENT_USER.location,
    });
    const [message, setMessage] = useState(null);

    // Filter for the currently active/trackable donation
    const activeDonation = donations.find(d =>
        d.status === 'accepted' || d.status === 'onTheWay'
    );

    // Function to load donations (including location refresh for active ones)
    const loadDonations = async () => {
        setIsLoading(true);
        setMessage(null);
        try {
            const data = await mockFetchDonations();
            setDonations(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to fetch donations.' });
        } finally {
            setIsLoading(false);
        }
    };

    // Initial load and polling setup
    useEffect(() => {
        loadDonations(); // Initial load

        const intervalId = setInterval(() => {
            // Only poll if there is an active donation to track
            if (activeDonation) {
                // We use the mockFetchDonations to simulate the API call that provides the NGO's updated location
                mockFetchDonations().then(data => {
                    setDonations(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
                });
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [activeDonation]); // Re-run effect if activeDonation status changes

    const handleFormChange = (e) => {
        const { id, value } = e.target;
        setDonationForm(prev => ({ ...prev, [id]: value }));
    };

    const handleCreateDonation = (e) => {
        e.preventDefault();
        setMessage(null);

        // Basic validation
        if (!donationForm.foodType || !donationForm.quantity || !donationForm.expiresInHours) {
            setMessage({ type: 'error', text: 'Food Type, Quantity, and Expiry Hours are required.' });
            return;
        }

        // Mock API call to create donation
        const newDonation = {
            id: Date.now(),
            foodType: donationForm.foodType,
            quantity: parseInt(donationForm.quantity),
            expiresInHours: parseInt(donationForm.expiresInHours),
            location: donationForm.locationText,
            status: 'pending',
            createdAt: new Date(),
            ngoName: null,
            ngoLocation: null,
        };

        // Update local state and show success message
        setDonations(prev => [newDonation, ...prev]);
        setDonationForm({ foodType: '', quantity: '', expiresInHours: '', locationText: MOCK_CURRENT_USER.locationText, gpsCoordinates: MOCK_CURRENT_USER.location });
        setMessage({ type: 'success', text: 'Donation created successfully! Awaiting NGO acceptance.' });
    };

    const handleAutoGps = () => {
        // In a real app, this would use navigator.geolocation.getCurrentPosition()
        alert(`Simulating GPS autofill: Location set to ${MOCK_CURRENT_USER.locationText}`);
        setDonationForm(prev => ({
            ...prev,
            locationText: MOCK_CURRENT_USER.locationText,
            gpsCoordinates: MOCK_CURRENT_USER.location
        }));
    };

    const buttonStyle = { backgroundColor: PRIMARY_RED };

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-20 py-8">

                {/* ⿡ Page Header */}
                <div className="flex justify-between items-center mb-10 pb-4 border-b border-gray-200">
                    <div>
                        <h1 className="text-4xl font-extrabold" style={{ color: DARK_CHARCOAL }}>BloomNet</h1>
                        <p className="text-lg text-gray-600 mt-1">Donor Dashboard</p>
                        <p className="text-xl font-semibold mt-2 flex items-center text-gray-800">
                            <User className="w-5 h-5 mr-2 text-[#CC3D4B]" /> Welcome, {MOCK_CURRENT_USER.name}
                        </p>
                    </div>
                    <button
                        onClick={onLogout} // Placeholder for logout action
                        className="flex items-center py-2 px-4 text-white rounded font-bold transition duration-150 shadow-md whitespace-nowrap bg-gray-500 hover:bg-gray-700 active:scale-[0.98]"
                    >
                        <LogOut className="w-5 h-5 mr-1" />
                        <span>Logout</span>
                    </button>
                </div>

                {message && <div className="mb-6"><MessageDisplay message={message} /></div>}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ⿢ Create Donation Form */}
                    <div className="lg:col-span-1">
                        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 sticky top-24">
                            <h2 className="text-2xl font-bold mb-6 flex items-center" style={{ color: DARK_CHARCOAL }}>
                                <PlusCircle className="w-6 h-6 mr-2 text-[#CC3D4B]" /> Create New Donation
                            </h2>
                            <form onSubmit={handleCreateDonation} className="space-y-4">
                                <FormInput
                                    id="foodType"
                                    label="Food Type (e.g., Rice, Bread, Meals)"
                                    icon={Package}
                                    value={donationForm.foodType}
                                    onChange={handleFormChange}
                                    required
                                />
                                <FormInput
                                    id="quantity"
                                    label="Quantity (in units/servings/kg)"
                                    type="number"
                                    icon={User}
                                    value={donationForm.quantity}
                                    onChange={handleFormChange}
                                    required
                                />
                                <FormInput
                                    id="expiresInHours"
                                    label="Expires In Hours (e.g., 3, 24)"
                                    type="number"
                                    icon={Clock}
                                    value={donationForm.expiresInHours}
                                    onChange={handleFormChange}
                                    required
                                />

                                {/* Location Input with GPS button */}
                                <div className="relative">
                                    <FormInput
                                        id="locationText"
                                        label="Location (Manual Text)"
                                        icon={MapPin}
                                        value={donationForm.locationText}
                                        onChange={handleFormChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAutoGps}
                                        className="absolute top-0 right-0 mt-3 mr-3 p-2 text-sm font-semibold rounded-lg text-white transition duration-150 flex items-center bg-blue-500 hover:bg-blue-600"
                                    >
                                        <Compass className="w-4 h-4 mr-1" />
                                        GPS Auto
                                    </button>
                                </div>


                                <button
                                    type="submit"
                                    className="w-full py-3 mt-4 text-white font-bold rounded-lg transition duration-200 shadow-md hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center"
                                    style={buttonStyle}
                                >
                                    <PlusCircle className="w-5 h-5 mr-2" />
                                    Create Donation
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* ⿣ Your Donations List & ⿤ Live Tracking Map */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Live Tracking Section (Only shows if activeDonation is found) */}
                        {activeDonation && activeDonation.ngoLocation && (
                            <LiveTrackingMap
                                donorLocation={MOCK_CURRENT_USER.location}
                                ngoLocation={activeDonation.ngoLocation}
                            />
                        )}

                        {/* Donations List */}
                        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold flex items-center" style={{ color: DARK_CHARCOAL }}>
                                    <Package className="w-6 h-6 mr-2 text-[#CC3D4B]" /> Your Donations ({donations.length})
                                </h2>
                                <button
                                    onClick={loadDonations}
                                    disabled={isLoading}
                                    className={`flex items-center text-sm font-semibold py-1 px-3 rounded transition ${isLoading ? 'text-gray-400' : 'text-[#CC3D4B] hover:text-red-700'}`}
                                >
                                    <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                                    {isLoading ? 'Refreshing...' : 'Refresh'}
                                </button>
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto">
                                {donations.length === 0 ? (
                                    <p className="text-center text-gray-500 p-8">You have not created any donations yet.</p>
                                ) : (
                                    donations.map(donation => (
                                        <DonationItem key={donation.id} donation={donation} />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonorDashboard;