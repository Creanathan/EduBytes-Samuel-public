/**
 * Dialog Data Store - Chapter 1
 *
 * EXACT content from background documents:
 *   - Chapter 1 — Interacties met dingen.docx
 *   - Chapter 1 — Interacties met locaties.docx
 *   - Chapter 1 — Interacties met personen.docx
 *
 * Rules:
 *   - Room entry arrays auto-play on arrival (outside & crime_scene only — per design).
 *   - Character interactions are click-triggered via showInteraction().
 *   - Conditional arrays: engine picks first variant whose `condition` evaluates true.
 *   - Multi-step arrays: object with `steps:[]` property — engine queues all steps.
 *   - Actions are pipe-separated: "setFlag:X|showBtn:btn-top|exit"
 *   - "exit"  → advance to next step (or close if no more steps)
 *   - "close" → immediately close, skip remaining steps
 */

const DIALOGS = {

    // ── Outside: scene-setting Narrator monologue ──
    outside: [
        {
            // [DESIGNER] - Scenario intro
            speaker: "Narrator",
            lines: [
                "You arrive at the Souvellier estate. The iron gate creaks open.",
                "A cold breeze sweeps across the gravel path leading to the front door.",
                "Time to begin the investigation."
            ],
            options: [
                { label: "Proceed", action: "showBtn:btn-top|exit" }
            ]
        }
    ],

    // ── Hallway: no auto-dialog (Butler is click-triggered) ──
    hallway: [],

    // ── Living Room: no auto-dialog (Thomas is click-triggered) ──
    living_room: [],

    // ── Nursery: no auto-dialog (Beatrix is click-triggered) ──
    nursery: [],

    // ── Crime Scene: detective monologue on entry ──
    crime_scene: [
        {
            speaker: "Det. Louis Dekoning",
            lines: [
                "The air in here is heavy... colder than the rest of the house.",
                "And there she is. Amelia Souvellier. Found earlier this morning by the butler.",
                "I need to be careful. Every misplaced footprint could cost us the case.",
                "The police were here already, but the butler mentioned they were... imprecise. I should search for anything they missed."
            ],
            options: [
                { label: "Investigate", action: "setFlag:crime_scene_visited|exit" }
            ]
        }
    ],

    nannys_room: [],

    // ────────────────────────────────────────────────
    // INTERACTIVE OBJECT INTERACTIONS
    // ────────────────────────────────────────────────
    interactions: {

        // ── Jeanne-Paul Leduc (Butler) ──
        leduc: [
            {
                // STATE 1: First interaction
                condition: "!GameState.hasFlag('talked_to_leduc')",
                steps: [
                    {
                        speaker: "Jeanne-Paul Leduc (Butler)",
                        lines: [
                            "Welcome, good sir. You must be the befamed detective Dekoning?"
                        ],
                        options: [
                            { label: "In the flesh.", action: "exit" }
                        ]
                    },
                    {
                        speaker: "Jeanne-Paul Leduc (Butler)",
                        lines: [
                            "We thank you for coming on such short notice. This is the first time something like this has ever happened at the Degrasse mansion and everyone is completely taken aback.",
                            "Mr. Souvellier is waiting for you in the living room. Please speak to him before we proceed with the investigation."
                        ],
                        options: [
                            { label: "I will.",  action: "setFlag:talked_to_leduc|exit" }
                        ]
                    }
                ]
            },
            {
                // STATE 2: Returned after talking, but not yet referred to crime scene by Thomas
                condition: "GameState.hasFlag('talked_to_leduc') && !GameState.hasFlag('referred_to_crime_scene')",
                speaker: "Jeanne-Paul Leduc (Butler)",
                lines: [
                    "Mr. Souvellier is waiting for you in the living room. It's best if you speak to him first."
                ],
                options: [
                    { label: "Understood.",  action: "exit" }
                ]
            },
            {
                // STATE 2b: Referred by Thomas, Crime scene not unlocked yet
                condition: "GameState.hasFlag('referred_to_crime_scene') && !GameState.hasFlag('crime_scene_unlocked')",
                steps: [
                    {
                        speaker: "Jeanne-Paul Leduc (Butler)",
                        lines: [
                            "I understand Mr. Souvellier has briefed you. The crime scene is locked to preserve evidence, but I can open it for you now."
                        ],
                        options: [
                            { label: "Please.",  action: "setFlag:crime_scene_unlocked|showBtn:btn-top|exit" },
                            { label: "Later.",   action: "exit" }
                        ]
                    }
                ]
            },
            {
                // STATE 3: Crime scene unlocked but not yet visited
                condition: "GameState.hasFlag('crime_scene_unlocked') && !GameState.hasFlag('crime_scene_visited')",
                speaker: "Jeanne-Paul Leduc (Butler)",
                lines: [
                    "The crime scene is just up ahead. I hope that USB stick gives you the answers you need."
                ],
                options: [
                    { label: "Thanks.", action: "exit" }
                ]
            },
            {
                // STATE 4: Crime scene visited
                condition: "GameState.hasFlag('crime_scene_visited')",
                speaker: "Jeanne-Paul Leduc (Butler)",
                lines: [
                    "I hope you found what you were looking for at the scene."
                ],
                options: [
                    { label: "I did.", action: "exit" }
                ]
            }
        ],

        // ── Beatrix Lémur (Nanny) ──
        beatrix: [
            {
                // Confrontation about the alibi contradiction
                condition: "GameState.hasFlag('accusation_filed_beatrix') && !GameState.hasFlag('has_nannys_key')",
                speaker: "Beatrix Lémur",
                lines: [
                    "The police logs? You've... corrected them? How very thorough of you, detective.",
                    "My alibi? I already told you, I was in the Nursery and Laundry all night. Log #002 is quite clear on that.",
                    "Wait... Log #005? A sensor identified me at the Piano? That's... impossible. There must be a glitch in your machine.",
                    "Fine. I was there. I took the key because I didn't trust the police to 'find' it properly. They would only use it to harass me.",
                    "If you want to search my room so badly, here it is. But you won't find anything but the loyalty of a lifelong servant."
                ],
                options: [
                    { label: "Take Key", action: "setFlag:has_nannys_key|addItem:nannys_key|exit" }
                ]
            },
            {
                // Confrontation after searching her room
                condition: "GameState.hasFlag('nannys_room_visited')",
                speaker: "Beatrix Lémur",
                lines: [
                    "You... you were in my room? How dare you! That is my private space!",
                    "The photo? That's none of your business. And the window... it's an old house, detective. Things scratch, things creak.",
                    "Please, just leave me to my work. The triplets need me."
                ],
                options: [
                    { label: "I have more questions.", action: "exit" },
                    { label: "Leave.", action: "close" }
                ]
            },
            {
                // STATE 1: First interaction
                condition: "!GameState.hasFlag('talked_to_beatrix')",
                steps: [
                    {
                        speaker: "Beatrix Lémur",
                        lines: [
                            "Oh, it's truly horrible what happened with sweet little Amelia!",
                            "How could anyone have done something like this to such a warm soul? It's all truly horrendous!"
                        ],
                        options: [
                            { label: "And you are?", action: "exit" },
                            { label: "Leave.",       action: "close" }
                        ]
                    },
                    {
                        speaker: "Beatrix Lémur",
                        lines: [
                            "My name is Beatrix Lémur, the nanny of the triplets.",
                            "Poor things, having to grow up without a mother.",
                            "And poor mister Souvellier! I can't even imagine how he must feel right now. He is such a sensitive soul..."
                        ],
                        options: [
                            { label: "Thank you.", action: "setFlag:talked_to_beatrix|exit" }
                        ]
                    }
                ]
            },
            {
                // STATE 2: Subsequent interactions
                condition: "GameState.hasFlag('talked_to_beatrix')",
                speaker: "Beatrix Lémur",
                lines: [
                    "Please let me know if there is anything I can do to help with the investigation.",
                    "I've been around for quite a while and am probably the person that knows the family the best.",
                    "No one should have the right to be so bad to others..."
                ],
                options: [
                    { label: "Of course.", action: "exit" }
                ]
            }
        ],

        // ── Thomas Souvellier ──
        thomas: [
            {
                // [AI - ANTIGRAVITY] - NEW STATE: Referring to the Crime Scene USB
                condition: "!GameState.hasFlag('referred_to_crime_scene')",
                speaker: "Thomas Souvellier",
                lines: [
                    "Detective, I'm glad you're here. The local police... they've been so sloppy.",
                    "They couldn't even digitize the search logs properly. They left an encrypted USB flash drive on the desk in the Crime Scene Bureau.",
                    "Please, ask Leduc to let you into the crime scene and retrieve that USB. If you can import the data into your tablet and fix it, maybe you can find what they missed."
                ],
                options: [
                    { label: "I'll get it.", action: "setFlag:referred_to_crime_scene|setFlag:talked_to_thomas|exit" }
                ]
            },
            {
                // STATE 2: Subsequent interactions
                condition: "GameState.hasFlag('referred_to_crime_scene')",
                speaker: "Thomas Souvellier",
                lines: [
                    "Please find whoever did this. We've already tried going to the police, but my father doesn't think they have the evidence.",
                    "Did you find the USB stick at the Crime Scene yet? Please help us."
                ],
                options: [
                    { label: "I'm working on it.", action: "exit" }
                ]
            }
        ],

        // ── Interactable Objects ──
        mirror: {
            speaker: "Det. Louis Dekoning",
            lines: ["Maybe I should've shaved."],
            options: [{ label: "Close", action: "exit" }]
        },

        clock: {
            speaker: "Det. Louis Dekoning",
            lines: ["An old Howard Millar grandfather clock."],
            options: [{ label: "Close", action: "exit" }]
        },

        piano: [
            {
                condition: "GameState.hasFlag('database_normalized')",
                speaker: "Det. Louis Dekoning",
                lines: [
                    "The search logs show a direct contradiction. Beatrix (the Nanny) was seen here shortly after the incident.",
                    "Her official alibi in Log #002 says she was in the Nursery, but Log #005 places her right here at the Piano.",
                    "I should go to the Nursery and confront her with this evidence."
                ],
                options: [{ label: "Close", action: "exit" }]
            },
            {
                condition: "true",
                speaker: "Det. Louis Dekoning",
                lines: ["I shouldn't waste any time playing a tune. There is a murderer on the loose."],
                options: [{ label: "Close", action: "exit" }]
            }
        ],

        door_nannys_room: [
            {
                condition: "GameState.hasFlag('has_nannys_key')",
                speaker: "Det. Louis Dekoning",
                lines: ["The Nanny's room. I have the key.", "The door is now open."],
                options: [
                    { label: "Enter", action: "setFlag:nannys_room_unlocked|goTo:nannys_room.html" },
                    { label: "Stay",  action: "setFlag:nannys_room_unlocked|setBackground:../assets/rooms/living_room_open.png|showBtn:btn-top|hideObj:obj-door|playSound:door|exit" }
                ]
            },
            {
                condition: "true",
                speaker: "Det. Louis Dekoning",
                lines: ["Locked. Best to ask for a key later."],
                options: [{ label: "Close", action: "exit" }]
            }
        ],

        cradle: {
            speaker: "Det. Louis Dekoning",
            lines: ["Best not to wake them up..."],
            options: [{ label: "Close", action: "exit" }]
        },

        family_picture: {
            speaker: "Det. Louis Dekoning",
            lines: [
                "The Degrasse family. They seem... close.",
                "Wait, is that the Nanny in the corner with the buggy?"
            ],
            options: [{ label: "Close", action: "exit" }]
        },

        body: {
            speaker: "Det. Louis Dekoning",
            lines: [
                "Amelia Souvellier. Still wearing her evening gown.",
                "There is a strange discoloration around her lips...",
                "This wasn't a natural death."
            ],
            options: [{ label: "Close", action: "exit" }]
        },

        broken_glass: {
            speaker: "Det. Louis Dekoning",
            lines: [
                "A crystal wine glass shard. There's a sticky residue on it.",
                "I should keep this. It might contain traces of whatever was in that drink."
            ],
            options: [{ label: "Close", action: "exit" }]
        },

        locked_safe: {
            speaker: "Det. Louis Dekoning",
            lines: [
                "The safe is empty. Thomas said his mother kept the family database ledgers here.",
                "If someone took those, they were looking for more than just money."
            ],
            options: [{ label: "Close", action: "exit" }]
        },

        window: {
            speaker: "Det. Louis Dekoning",
            lines: [
                "The window overlooks the garden. It's locked from the inside.",
                "Wait, is that a scratch on the sill? Like someone tried to pry it open?"
            ],
            options: [{ label: "Close", action: "exit" }]
        },

        bed: {
            speaker: "Det. Louis Dekoning",
            lines: [
                "A simple, neatly made bed. The nanny clearly values order.",
                "But there's a slight indentation... as if someone sat here recently, clutching their head."
            ],
            options: [{ label: "Close", action: "exit" }]
        },

        dresser: {
            speaker: "Det. Louis Dekoning",
            lines: [
                "A modest dresser. There's a picture of a child on top.",
                "It's not one of the triplets. She has a family of her own somewhere."
            ],
            options: [{ label: "Close", action: "exit" }]
        },

        cabinet: {
            speaker: "Det. Louis Dekoning",
            lines: [
                "A storage cabinet. Mostly cleaning supplies and spare linens.",
                "Nothing out of the ordinary here."
            ],
            options: [{ label: "Close", action: "exit" }]
        }
    }
};
