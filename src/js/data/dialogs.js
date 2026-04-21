/**
 * Dialog Data Store - Chapter 1
 * All dialog content is defined here in one place.
 * To add new dialogs, simply add entries to the room arrays.
 *
 * Structure per dialog entry:
 *   speaker  - Name displayed in the dialog box header
 *   lines    - Array of strings, each string is one "click" of text
 *   options  - (optional) Array of {label, action} shown after all lines
 */

const DIALOGS = {

    outside: [
        {
            speaker: "Narrator",
            lines: [
                "You arrive at the Souvellier estate. The iron gate creaks open.",
                "A cold breeze sweeps across the gravel path leading to the front door.",
                "Time to begin the investigation."
            ]
        }
    ],

    hallway: [
        {
            speaker: "Dorian (Butler)",
            lines: [
                "Bonjour. Are you the private investigator monsieur Souvellier called for?",
                "Let me see your detective licence... All right, everything seems to be in order.",
                "Unfortunately, I am somewhat occupied at the moment due to the... circumstances.",
                "I am Dorian, by the way. I have served this family for the last 15 years.",
                "Now, please wait in the hallway. I will be with you shortly."
            ],
            options: [
                { label: "Of course.", action: "exit" }
            ]
        }
    ],

    living_room: [
        {
            speaker: "Thomas Souvellier",
            lines: [
                "You must be detective Dekoning. We... spoke on the phone? Thomas Souvellier.",
                "Please help us. We've already tried going to the police, but my father doesn't think they have the evidence to find out who did this.",
                "Please find whoever did this. Please."
            ],
            options: [
                { label: "I'll do my best.", action: "exit" }
            ]
        }
    ],

    nursery: [
        {
            speaker: "Beatrix Lémur (Nanny)",
            lines: [
                "Could you please turn off the lights when leaving?",
                "Taking care of mademoiselle Camille is difficult enough already without strangers trying to find their way around the house...",
                "Now if you'll excuse me, I have some things to take care of."
            ],
            options: [
                { label: "Of course.", action: "exit" }
            ]
        }
    ],

    crime_scene: [],

    nannys_room: [],

    // --- Interactive Objects (Item-specific triggers) ---
    // These keys match the ID of the clickable-object divs in the HTML
    interactions: {
        mirror: {
            speaker: "Det. Louis Dekoning",
            lines: ["Maybe I should've shaved. This case is already taking its toll on me."],
            options: [{ label: "Close", action: "exit" }]
        },
        clock: {
            speaker: "Det. Louis Dekoning",
            lines: ["An old Howard Millar grandfather clock. Still ticking perfectly.", "It's one of the few things in this house that doesn't feel like it's hiding something."],
            options: [{ label: "Close", action: "exit" }]
        },
        piano: {
            speaker: "Det. Louis Dekoning",
            lines: ["I shouldn't waste any time playing a tune. There is a murderer on the loose."],
            options: [{ label: "Close", action: "exit" }]
        },
        door_nanny: {
            speaker: "Det. Louis Dekoning",
            lines: ["Locked. Typical.", "Best to ask the butler for a key later."],
            options: [{ label: "Close", action: "exit" }]
        },
        cradle: {
            speaker: "Det. Louis Dekoning",
            lines: ["The cradles are empty. Better not to wake up the atmosphere here... it's already heavy enough."],
            options: [{ label: "Close", action: "exit" }]
        },
        family_picture: {
            speaker: "Det. Louis Dekoning",
            lines: ["The Dégrasse family. They seem... close. At least in this frame.", "Wait, is that the Nanny in the corner with the buggy?"],
            options: [{ label: "Close", action: "exit" }]
        }
    }
};
