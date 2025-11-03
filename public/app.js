const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = true;
recognition.interimResults = false;
recognition.lang = 'en-US';

let isListening = false;

document.addEventListener('DOMContentLoaded', (event) => {
    const micStatus = document.getElementById('mic-status');
    const responseBox = document.getElementById('response');

    const startListening = () => {
        micStatus.innerText = "Listening...";
        recognition.start();
        isListening = true;
    };

    const stopListening = () => {
        micStatus.innerText = "Stopped listening...";
        recognition.stop();
        isListening = false;
    };

    recognition.onresult = (event) => {
        const transcript = event.results[event.resultIndex][0].transcript.trim().toLowerCase();
        handleVoiceCommand(transcript);
    };

    recognition.onerror = (event) => {
        responseBox.innerText = 'Error occurred in recognition: ' + event.error;
    };

    const handleVoiceCommand = (command) => {
        responseBox.innerText = `You said: ${command}`;
        
        if (command.includes('what is the time')) {
            const currentTime = new Date().toLocaleTimeString();
            responseBox.innerText = `Current time is ${currentTime}`;
            speak(`The current time is ${currentTime}`);
        } else if (command.includes('weather')) {
            fetchWeather();  // Fetch weather information
        } else if (command.includes('open')) {
            openAppOrWebsite(command);  // Open apps or websites
        } else if (command.includes('help') || command.includes('support')) {
            fetchSupportFromServer(command);  // Fetch support via server
        } else if (command.includes('stop')) {
            stopListening();
            responseBox.innerText = 'Stopped listening.';
        } else {
            speak('Sorry, I did not understand the command.');
        }
    };

    // Convert text to speech
    const speak = (message) => {
        const speech = new SpeechSynthesisUtterance(message);
        window.speechSynthesis.speak(speech);
    };

    // Fetch support from the backend (Node.js server)
    const fetchSupportFromServer = (query) => {
        responseBox.innerText = 'Fetching support...';
        fetch('/support', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        })
        .then(response => response.json())
        .then(data => {
            const supportResponse = data.answer || "Sorry, I couldn't find any support for that query.";
            responseBox.innerText = supportResponse;
            speak(supportResponse);
        })
        .catch(error => {
            responseBox.innerText = 'Error fetching support: ' + error;
            speak('Sorry, I was unable to fetch support.');
        });
    };

    // Fetch weather from the server
    const fetchWeather = () => {
        responseBox.innerText = 'Fetching weather...';
        fetch('/weather')
        .then(response => response.json())
        .then(data => {
            const weatherInfo = `The current temperature is ${data.temp}°C with ${data.description}.`;
            responseBox.innerText = weatherInfo;
            speak(weatherInfo);
        })
        .catch(error => {
            responseBox.innerText = 'Error fetching weather: ' + error;
            speak('Sorry, I was unable to fetch weather information.');
        });
    };

    // Open apps or commonly used websites
    const openAppOrWebsite = (command) => {
        const websites = {
            'google': 'https://www.google.com',
            'youtube': 'https://www.youtube.com',
            'facebook': 'https://www.facebook.com',
            'github': 'https://www.github.com',
            'gmail': 'https://mail.google.com',
            'twitter': 'https://www.twitter.com',
        };

        const apps = {
            'calculator': 'calc.exe',
            'notepad': 'notepad.exe',
            'paint': 'mspaint.exe',
            'explorer': 'explorer.exe',
            'command prompt': 'cmd.exe',
        };

        const appOrSite = command.replace('open', '').trim();

        // Check if it's a known website
        if (websites[appOrSite]) {
            responseBox.innerText = `Opening ${appOrSite}...`;
            window.open(websites[appOrSite], '_blank');
        } 
        // Check if it's a known app
        else if (apps[appOrSite]) {
            responseBox.innerText = `Opening ${appOrSite}...`;
            fetch('/open-app', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ appName: apps[appOrSite] })
            })
            .then(() => speak(`Opening ${appOrSite}.`))
            .catch(error => {
                responseBox.innerText = `Error opening ${appOrSite}: ${error}`;
                speak(`Sorry, I couldn't open ${appOrSite}.`);
            });
        } else {
            speak('Sorry, I did not recognize the app or website.');
        }
    };

    // Toggle listening on click
    document.getElementById('toggle-mic').addEventListener('click', () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    });
});
