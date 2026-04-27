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
            speaker: "Narrator",
            lines: [
                "You arrive at the Souvellier estate. The iron gate creaks open.",
                "A cold breeze sweeps across the gravel path leading to the front door.",
                "Time to begin the investigation."
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
                "Time to look for anything the police might have missed."
            ],
            options: [
                { label: "Investigate", action: "setFlag:crime_scene_visited|exit" }
            ]
        }
    ],

    nannys_room: [],

    // ────────────────────────────────────────────────
    // INTERACTIVE OBJECT INTERACTIONS
    // Exact text from Chapter 1 — Interacties met dingen.docx
    // Exact dialogue from Chapter 1 — Interacties met personen.docx
    // ────────────────────────────────────────────────
    interactions: {

        // ── Jeanne-Paul Leduc — 4 conditional states ──
        // Source: Chapter 1 — Interacties met personen.docx
        leduc: [
            {
                // STATE 1: First interaction ever
                condition: "!GameState.hasFlag('talked_to_leduc')",
                // Multi-step: "In the flesh." → then "Shall I take you?"
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
                            "Shall I take you to the crime scene? Or would you rather talk to the people present first?"
                        ],
                        options: [
                            { label: "Please.",  action: "setFlag:talked_to_leduc|setFlag:crime_scene_unlocked|showBtn:btn-top|exit" },
                            { label: "Later.",   action: "setFlag:talked_to_leduc|exit" }
                        ]
                    }
                ]
            },
            {
                // STATE 2: Returned after saying "Later." — crime scene not yet unlocked
                condition: "GameState.hasFlag('talked_to_leduc') && !GameState.hasFlag('crime_scene_unlocked') && !GameState.hasFlag('crime_scene_visited')",
                steps: [
                    {
                        speaker: "Jeanne-Paul Leduc (Butler)",
                        lines: [
                            "Are you ready to go to the crime scene now?"
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
                    "Forgive everyone for being completely taken aback. It is a really unusual situation.",
                    "The crime scene is just up ahead."
                ],
                options: [
                    { label: "Thanks.", action: "exit" }
                ]
            },
            {
                // STATE 4: Crime scene visited — no further action specified in background doc
                // (Nursery key is not mentioned for the butler; leave a neutral line)
                condition: "GameState.hasFlag('crime_scene_visited')",
                speaker: "Jeanne-Paul Leduc (Butler)",
                lines: [
                    "Thank you for your diligence, detective. Please do let me know if you need anything."
                ],
                options: [
                    { label: "Of course.", action: "exit" }
                ]
            }
        ],

        // ── Beatrix Lémur — 2 conditional states ──
        // Source: Chapter 1 — Interacties met personen.docx
        beatrix: [
            {
                // STATE 1: First interaction (condition per doc: talked to butler + not visited crime scene)
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
                        // This step only reached via "And you are?" (Leave uses "close" to skip)
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

        // ── Thomas Souvellier — 2 conditional states ──
        // Source: Chapter 1 — Interacties met personen.docx
        thomas: [
            {
                // STATE 1: First interaction
                condition: "!GameState.hasFlag('talked_to_thomas')",
                speaker: "Thomas Souvellier",
                lines: [
                    "You must be detective Dekoning. We... spoke on the phone? Thomas Souvellier.",
                    "Please help us. We've already tried going to the police, but my father doesn't think they have the evidence to find out who did this.",
                    "Please find whoever did this. Please."
                ],
                options: [
                    { label: "I'll do my best.", action: "setFlag:talked_to_thomas|exit" }
                ]
            },
            {
                // STATE 2: Subsequent interactions
                condition: "GameState.hasFlag('talked_to_thomas')",
                speaker: "Thomas Souvellier",
                lines: [
                    "Please find whoever did this. Please."
                ],
                options: [
                    { label: "I'll do my best.", action: "exit" }
                ]
            }
        ],

        // ── Interactable Objects ──
        // Source: Chapter 1 — Interacties met dingen.docx

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

        piano: {
            speaker: "Det. Louis Dekoning",
            lines: ["I shouldn't waste any time playing a tune. There is a murderer on the loose."],
            options: [{ label: "Close", action: "exit" }]
        },

        // Door in Living Room — leads to Nanny's Room
        door_nannys_room: {
            speaker: "Det. Louis Dekoning",
            lines: ["Locked. Best to ask for a key later."],
            options: [{ label: "Close", action: "exit" }]
        },
        door_nannys_room_unlocked: {
            speaker: "Det. Louis Dekoning",
            lines: ["The Nanny's room. I have the key.", "The door is now open."],
            options: [
                { label: "Enter", action: "setFlag:nannys_room_unlocked|goTo:nannys_room.html" },
                { label: "Stay",  action: "setFlag:nannys_room_unlocked|setBackground:../../assets/rooms/living_room_open.png|showBtn:btn-top|hideObj:obj-door|playSound:door|exit" }
            ]
        },

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

        // Crime Scene objects (forensic investigation — implied by crime_scene room)
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
        }
    }
};
