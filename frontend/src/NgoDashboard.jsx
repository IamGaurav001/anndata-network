import React, { useState, useEffect, useCallback } from 'react';
import { 
    LogOut, 
    Map, 
    Package, 
    Clock, 
    Truck, 
    CheckCircle, 
    LocateFixed, 
    Users, 
    Compass, 
    RefreshCw, 
    XCircle, 
    MapPin // 🛑 FIXED: MapPin icon imported here
} from 'lucide-react';
import { FormInput, PRIMARY_RED, DARK_CHARCOAL, MessageDisplay } from './Shared';

// --- MOCK DATA & API FUNCTIONS ---
const MOCK_NGO_USER = {
    name: "City Welfare Foundation",
    location: { lat: 28.59, lng: 77.20 }, // NGO HQ near New Delhi center
    locationText: 'NGO Headquarters, Central Delhi',
};

const MOCK_PENDING_DONATIONS_DATA = [
    {
        id: 201, foodType: 'Dal Rice', quantity: 20, unit: 'plates', expiresInHours: 2, 
        location: 'LPU Gate 3, Jalandhar', donorLocation: { lat: 31.255, lng: 75.69 }, 
        status: 'pending', donorName: 'Ravi K.'
    },
    {
        id: 202, foodType: 'Fresh Fruits', quantity: 15, unit: 'kg', expiresInHours: 12, 
        location: 'Sector 15, Chandigarh', donorLocation: { lat: 30.73, lng: 76.78 }, 
        status: 'pending', donorName: 'Priya S.'
    },
    {
        id: 203, foodType: 'Canned Food', quantity: 50, unit: 'items', expiresInHours: 72, 
        location: 'Dwarka, New Delhi', donorLocation: { lat: 28.58, lng: 77.05 }, 
        status: 'pending', donorName: 'Mohan L.'
    },
];

const MOCK_ACCEPTED_DONATIONS_DATA = [
    {
        id: 301, foodType: 'Chapati', quantity: 100, unit: 'units', expiresInHours: 1, 
        location: 'Connaught Place, Delhi', donorLocation: { lat: 28.63, lng: 77.22 }, 
        status: 'accepted', donorName: 'Aman S.'
    },
];

// Mock API call to fetch all pending donations
const mockFetchPendingDonations = () => {
    return new Promise(resolve => {
        setTimeout(() => resolve(MOCK_PENDING_DONATIONS_DATA), 500);
    });
};

// Mock API call to update NGO's location and check status
const mockUpdateLocation = (donationId, ngoLocation) => {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log(`Mock API: Updating location for donation ${donationId}`);
            // Simulate minor movement
            const newLat = ngoLocation.lat + (Math.random() - 0.5) * 0.001;
            const newLng = ngoLocation.lng + (Math.random() - 0.5) * 0.001;
            resolve({ 
                success: true, 
                message: 'Location updated.', 
                newNgoLocation: { lat: newLat, lng: newLng } 
            });
        }, 50);
    });
};

// Mock API call to change status
const mockUpdateStatus = (donationId, newStatus) => {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log(`Mock API: Status updated for donation ${donationId} to ${newStatus}`);
            resolve({ success: true, message: `Status updated to ${newStatus}` });
        }, 500);
    });
};

// --- HELPER COMPONENTS ---

// Simple distance calculation (Simplified Haversine formula for illustration)
const calculateDistance = (loc1, loc2) => {
    const R = 6371; // km
    const dLat = (loc2.lat - loc1.lat) * (Math.PI / 180);
    const dLon = (loc2.lng - loc1.lng) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + 
              Math.cos(loc1.lat * (Math.PI / 180)) * Math.cos(loc2.lat * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
};


// --- NGO DASHBOARD COMPONENT ---

const NgoDashboard = ({ onLogout }) => {
    const [pendingDonations, setPendingDonations] = useState([]);
    const [acceptedDonations, setAcceptedDonations] = useState(MOCK_ACCEPTED_DONATIONS_DATA);
    const [ngoLocation, setNgoLocation] = useState(MOCK_NGO_USER.location);
    const [message, setMessage] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const [trackingDonationId, setTrackingDonationId] = useState(null);
    const [isLoadingPending, setIsLoadingPending] = useState(false);
    
    // The currently active donation being tracked
    const activeTrackingDonation = acceptedDonations.find(d => d.id === trackingDonationId);


    // 1. Fetch Pending Donations (and Poll)
    const loadPendingDonations = useCallback(async () => {
        setIsLoadingPending(true);
        try {
            const data = await mockFetchPendingDonations();
            setPendingDonations(data);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load pending donations.' });
        } finally {
            setIsLoadingPending(false);
        }
    }, []);

    useEffect(() => {
        loadPendingDonations(); // Initial load

        const pendingPoll = setInterval(loadPendingDonations, 10000); // Poll every 10s
        return () => clearInterval(pendingPoll);
    }, [loadPendingDonations]);


    // 2. Live Tracking Polling (Every 5 seconds)
    useEffect(() => {
        if (!isTracking || !trackingDonationId) return;

        const trackingPoll = setInterval(async () => {
            if (!activeTrackingDonation) {
                setIsTracking(false);
                setTrackingDonationId(null);
                return;
            }

            try {
                const result = await mockUpdateLocation(trackingDonationId, ngoLocation);
                setNgoLocation(result.newNgoLocation);
                setMessage({ type: 'info', text: 'Tracking location updated.' });
            } catch (error) {
                setMessage({ type: 'error', text: 'Failed to update live location.' });
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(trackingPoll);
    }, [isTracking, trackingDonationId, ngoLocation, activeTrackingDonation]);


    // --- ACTION HANDLERS ---

    // 3. Accept Donation
    const handleAcceptDonation = (donation) => {
        // Remove from pending list
        setPendingDonations(prev => prev.filter(d => d.id !== donation.id));
        
        // Add to accepted list with 'accepted' status and current NGO location
        const acceptedDonation = { 
            ...donation, 
            status: 'accepted', 
            ngoLocation: ngoLocation,
        };
        setAcceptedDonations(prev => [acceptedDonation, ...prev]);
        setMessage({ type: 'success', text: `Donation of ${donation.foodType} accepted!` });

        // Automatically start tracking the newly accepted one
        handleStartPickup(acceptedDonation.id); 
    };

    // 4. Start Pickup / Tracking
    const handleStartPickup = (id) => {
        setIsTracking(true);
        setTrackingDonationId(id);
        
        // Update the status of the accepted donation to 'onTheWay'
        setAcceptedDonations(prev => prev.map(d => 
            d.id === id ? { ...d, status: 'onTheWay' } : d
        ));
        
        // Trigger the initial location update immediately
        mockUpdateLocation(id, ngoLocation); 
        setMessage({ type: 'info', text: 'Live tracking started. On the way to pickup!' });
    };

    // 4. Pickup Completed
    const handlePickupCompleted = async (id) => {
        setIsTracking(false);
        setTrackingDonationId(null);
        setMessage(null);

        // Mock API call to change status
        await mockUpdateStatus(id, 'picked');
        
        setAcceptedDonations(prev => prev.map(d => 
            d.id === id ? { ...d, status: 'picked', ngoLocation: null } : d
        ));
        
        setMessage({ type: 'success', text: 'Pickup completed! Thank you.' });
    };

    // --- RENDER HELPERS ---

    const renderMapMarker = (donation, isNgo) => {
        const distance = calculateDistance(ngoLocation, donation.donorLocation || ngoLocation);
        
        return (
            <div 
                key={donation.id}
                className={`absolute p-2 rounded-lg shadow-xl cursor-pointer transition transform hover:scale-[1.05] ${isNgo ? 'bg-blue-600' : 'bg-orange-500'}`}
                style={{
                    // Mock positioning based on lat/lng difference relative to NGO location
                    top: `${(donation.donorLocation?.lat - ngoLocation.lat) * -5000 + 150}px`,
                    left: `${(donation.donorLocation?.lng - ngoLocation.lng) * 5000 + 250}px`,
                }}
            >
                {isNgo ? 
                    <LocateFixed className="w-6 h-6 text-white animate-pulse" /> : 
                    <Package className="w-5 h-5 text-white" />
                }
                
                {/* Popup Content */}
                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 p-3 bg-white text-gray-800 text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity w-48 pointer-events-none">
                    <p className="font-bold">{donation.foodType} ({donation.quantity} {donation.unit})</p>
                    <p className="mt-1 text-gray-600">Distance: {distance} km</p>
                    
                    {!isNgo && donation.status === 'pending' && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleAcceptDonation(donation); }}
                            className="w-full mt-2 py-1 text-white text-xs font-semibold rounded"
                            style={{ backgroundColor: PRIMARY_RED }}
                        >
                            Accept
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-20 py-8">
                
                {/* 1️⃣ Page Header */}
                <div className="flex justify-between items-center mb-10 pb-4 border-b border-gray-200">
                    <div>
                        <h1 className="text-4xl font-extrabold" style={{ color: DARK_CHARCOAL }}>BloomNet</h1>
                        <p className="text-lg text-gray-600 mt-1">NGO Dashboard</p>
                        <p className="text-xl font-semibold mt-2 flex items-center text-gray-800">
                            <Users className="w-5 h-5 mr-2 text-blue-500" /> Welcome, {MOCK_NGO_USER.name}
                        </p>
                    </div>
                    <button
                        onClick={onLogout} 
                        className="flex items-center py-2 px-4 text-white rounded font-bold transition duration-150 shadow-md whitespace-nowrap bg-gray-500 hover:bg-gray-700 active:scale-[0.98]"
                    >
                        <LogOut className="w-5 h-5 mr-1" />
                        <span>Logout</span>
                    </button>
                </div>

                {message && <div className="mb-6"><MessageDisplay message={message} /></div>}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* 2️⃣ Live Map Section */}
                    <div className="lg:col-span-2">
                        <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-100 relative">
                            <h2 className="text-2xl font-bold mb-4 flex items-center" style={{ color: DARK_CHARCOAL }}>
                                <Map className="w-6 h-6 mr-2 text-[#CC3D4B]" /> Nearby Donations Map
                            </h2>
                            <div className="relative h-[400px] bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                                {/* Map Placeholder */}
                                <div className="text-gray-600 font-bold">Map View Placeholder (Centered at NGO Location)</div>
                                
                                {/* NGO Marker */}
                                {renderMapMarker({ id: 'ngo', foodType: 'NGO', quantity: 0, location: MOCK_NGO_USER.locationText, donorLocation: ngoLocation, status: 'base' }, true)}

                                {/* Donation Markers (Pending) */}
                                {pendingDonations.map(d => renderMapMarker(d, false))}

                                {/* Legend/Info */}
                                <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md text-sm font-medium">
                                    <p><span className="inline-block w-3 h-3 bg-blue-600 rounded-full mr-2"></span> Your Location</p>
                                    <p><span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-2"></span> Pending Donations</p>
                                </div>
                                <div className="absolute top-4 right-4 text-xs bg-white p-3 rounded-lg shadow-md">
                                    <p className="text-gray-600">Map automatically refreshes every 10s.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3️⃣ Pending Donation List */}
                    <div className="lg:col-span-1">
                        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 sticky top-24">
                            <h2 className="text-2xl font-bold mb-4 flex items-center" style={{ color: DARK_CHARCOAL }}>
                                <Clock className="w-6 h-6 mr-2 text-yellow-500" /> Pending Pickups ({pendingDonations.length})
                            </h2>
                            <button
                                onClick={loadPendingDonations}
                                disabled={isLoadingPending}
                                className={`flex items-center mb-4 text-sm font-semibold py-1 px-3 rounded transition ${isLoadingPending ? 'text-gray-400' : 'text-blue-600 hover:text-blue-800'}`}
                            >
                                <RefreshCw className={`w-4 h-4 mr-1 ${isLoadingPending ? 'animate-spin' : ''}`} />
                                {isLoadingPending ? 'Refreshing...' : 'Refresh List'}
                            </button>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto">
                                {pendingDonations.length === 0 ? (
                                    <div className="text-center text-gray-500 p-4 border rounded-lg">No pending donations nearby.</div>
                                ) : (
                                    pendingDonations.map(donation => (
                                        <div key={donation.id} className="p-3 border border-gray-100 rounded-lg shadow-sm bg-gray-50 flex justify-between items-center">
                                            <div>
                                                <p className="text-md font-bold">{donation.foodType} ({donation.quantity} {donation.unit})</p>
                                                <p className="text-sm text-gray-600 flex items-center mt-0.5">
                                                    <MapPin className="w-4 h-4 mr-1 text-gray-400" /> {donation.location}
                                                </p>
                                                <p className="text-xs text-red-500 font-semibold flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" /> Expires in: {donation.expiresInHours} hours
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleAcceptDonation(donation)}
                                                className="py-2 px-4 text-white font-semibold rounded transition hover:opacity-90 active:scale-[0.98]"
                                                style={{ backgroundColor: PRIMARY_RED }}
                                            >
                                                Accept
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5️⃣ Accepted Donation List & 4️⃣ Tracking Controls */}
                <div className="mt-8">
                    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                        <h2 className="text-2xl font-bold mb-4 flex items-center" style={{ color: DARK_CHARCOAL }}>
                            <CheckCircle className="w-6 h-6 mr-2 text-green-600" /> Accepted Donations
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {acceptedDonations.map(donation => (
                                <div key={donation.id} className="p-4 border rounded-lg shadow-md bg-gray-50">
                                    <p className="text-lg font-bold text-gray-800">{donation.foodType}</p>
                                    <p className={`text-sm font-semibold uppercase mt-1 ${donation.status === 'picked' ? 'text-gray-500' : 'text-green-600'}`}>
                                        Status: {donation.status}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">Donor: <span className="font-medium">{donation.donorName}</span></p>
                                    <p className="text-sm text-gray-600">Location: {donation.location}</p>

                                    {/* 4️⃣ Tracking Controls */}
                                    <div className="mt-4 space-y-2">
                                        {donation.status !== 'picked' && (
                                            <>
                                                {/* Start/Stop Tracking Button */}
                                                {isTracking && trackingDonationId === donation.id ? (
                                                    <button
                                                        onClick={() => setIsTracking(false)}
                                                        className="w-full py-2 flex items-center justify-center text-white font-semibold rounded bg-yellow-500 hover:bg-yellow-600 transition"
                                                    >
                                                        <XCircle className="w-5 h-5 mr-2" /> Pause Tracking
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleStartPickup(donation.id)}
                                                        className="w-full py-2 flex items-center justify-center text-white font-semibold rounded transition"
                                                        style={{ backgroundColor: PRIMARY_RED }}
                                                        disabled={isTracking && trackingDonationId !== donation.id} // Disable if another is active
                                                    >
                                                        <Truck className="w-5 h-5 mr-2" /> {donation.status === 'accepted' ? 'Start Pickup' : 'Resume Tracking'}
                                                    </button>
                                                )}

                                                {/* Pickup Completed Button */}
                                                <button
                                                    onClick={() => handlePickupCompleted(donation.id)}
                                                    disabled={donation.status === 'accepted'} // Should be "onTheWay" to complete
                                                    className={`w-full py-2 flex items-center justify-center text-white font-semibold rounded transition ${donation.status === 'onTheWay' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
                                                >
                                                    <Package className="w-5 h-5 mr-2" /> Pickup Completed
                                                </button>
                                            </>
                                        )}
                                        {donation.status === 'picked' && (
                                            <p className="text-center text-sm text-gray-500 italic pt-2">Donation successfully delivered.</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NgoDashboard;