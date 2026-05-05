import os
path = r'src\js\data\dialogs.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

butler_target = """                        options: [
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
                            "Are you ready to go to the crime scene now? Mr. Souvellier is in the living room with the police files."
                        ],
                        options: [
                            { label: "Please.",  action: "setFlag:crime_scene_unlocked|showBtn:btn-top|exit" },
                            { label: "Later.",   action: "exit" }
                        ]
                    }
                ]
            },"""

butler_replacement = """                        options: [
                            { label: "Later.",   action: "setFlag:talked_to_leduc|exit" }
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
            },"""

thomas_target = """        // ── Thomas Souvellier — 3 conditional states ──
        thomas: [
            {
                // [AI - ANTIGRAVITY] - NEW STATE: Giving the Physical Ledger
                condition: "!Inventory.hasItem('police_ledger')",
                speaker: "Thomas Souvellier",
                lines: [
                    "Detective, I'm glad you're here. The local police... they've been so sloppy.",
                    "They left these physical registries behind. They said the search logs are a mess and they couldn't even digitize them properly.",
                    "Please, take these files. If you can import them into your tablet and fix their data, maybe you can find what they missed."
                ],
                options: [
                    { label: "Take Files", action: "addItem:police_ledger|exit" }
                ]
            },
            {
                // STATE 1: Initial meeting (if they already have the files but haven't talked to him fully)
                condition: "!GameState.hasFlag('talked_to_thomas')",
                speaker: "Thomas Souvellier",
                lines: [
                    "Please find whoever did this. We've already tried going to the police, but my father doesn't think they have the evidence.",
                    "Please help us."
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
                    { label: "Leave.", action: "exit" }
                ]
            }"""

thomas_replacement = """        // ── Thomas Souvellier — 2 conditional states ──
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
            }"""

if butler_target in content and thomas_target in content:
    content = content.replace(butler_target, butler_replacement).replace(thomas_target, thomas_replacement)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Replaced successfully")
else:
    print("Target strings not found")
