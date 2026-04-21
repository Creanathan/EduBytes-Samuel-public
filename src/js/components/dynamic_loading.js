const specRules = {
    "prerender": [
        {
            "source": "list",
            "urls": ["hallway.html", "nursery.html", "living_room.html"]
        }
    ]
};

// Create a script element
const script = document.createElement('script');
script.type = 'speculationrules';
script.textContent = JSON.stringify(specRules);

// Inject it into the document
document.head.appendChild(script);