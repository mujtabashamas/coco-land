import React, { useState } from 'react';
import axios from 'axios';

const PostalCodeLookup = () => {
    const [postalCode, setPostalCode] = useState('');
    const [locationData, setLocationData] = useState(null);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        const apiKey = 'cb7d0c0df13cd522260934d0b8e6c218'; // Replace with your Positionstack API key
        const url = `http://api.positionstack.com/v1/forward?access_key=${apiKey}&query=${postalCode}&country=FR`;

        try {
            const response = await axios.get(url);
            const data = response.data;

            if (data.data && data.data.length > 0) {
                setLocationData(data.data[0]);
                setError('');
            } else {
                setError('Postal code not found or invalid.');
                setLocationData(null);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('An error occurred while fetching data.');
            setLocationData(null);
        }
    };

    return (
        <div>
            <h1>Postal Code Lookup</h1>
            <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Enter postal code"
            />
            <button onClick={handleSearch}>Search</button>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {locationData && (
                <div>
                    <h2>Location Details</h2>
                    <p><strong>Label:</strong> {locationData.label}</p>
                    <p><strong>Country:</strong> {locationData.country}</p>
                    <p><strong>Region:</strong> {locationData.region}</p>
                    <p><strong>County:</strong> {locationData.county}</p>
                    <p><strong>Latitude:</strong> {locationData.latitude}</p>
                    <p><strong>Longitude:</strong> {locationData.longitude}</p>
                </div>
            )}
        </div>
    );
};

export default PostalCodeLookup;
