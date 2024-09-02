function App() {
    const [username, setUsername] = useState('');
    const [channelName, setChannelName] = useState('');
    const [channels, setChannels] = useState([]);

    useEffect(() => {
        // Prompt user for their username and register it with the server
        const user = prompt('Enter your username:');
        setUsername(user);
        socket.emit('registerUser', user);

        // Listen for channel data emitted by the server
        socket.on('channelData', (channelData) => {
            setChannels(prevChannels => [...prevChannels, channelData]);
        });

        // Listen for all user's channels after they request it
        socket.on('userChannels', (userChannels) => {
            setChannels(userChannels.map(channel => channel.channelData));
        });

        return () => {
            socket.off('channelData');
            socket.off('userChannels');
        };
    }, []);

    // Function to create a new channel

    // Function to request channels (could be triggered, for example, on component mount or a button click)
    const requestChannels = () => {
        socket.emit('requestChannels', username);
    };

    return (
        <div className="App">

            <div>
                <h3>Channels</h3>
                <ul>
                    {channels.map((channel, index) => (
                        <li key={index}>
                            <strong>{channel.channelName}</strong> - Users: {channel.users.join(', ')}
                        </li>
                    ))}
                </ul>
            </div>

            <button onClick={requestChannels}>Request My Channels</button>
        </div>
    );
}

export default App;
