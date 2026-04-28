# EduBytes — Story & Design Bible

This document standardizes the narrative, characters, and investigative mechanics for the *EduBytes* Noir detective game, based on the original design documentation.

---

## 1. Core Narrative & Plot
**The Incident**: Amelia Dégrasse, a wealthy young mother of triplets, has been found dead at her family estate.
**The Client**: Thomas Souvellier, Amelia's partner and a bright young professor, has hired the brilliant Belgian detective **Louis Dekoning** to solve the case.
**The Twist**: Thomas and Amelia were secretly married and planned to flee the estate. Thomas is the son of the Chief of Police, who believes there isn't enough evidence to prosecute.
**The Revelation**: The murderer is **Beatrix Lémur**, the long-time Nanny of the Dégrasse family.

---

## 2. Character Profiles

### Louis Dekoning (Protagonist)
*   **Role**: Lead Detective.
*   **Traits**: Brilliant, Belgian, sharp, and sympathetic. Known for solving world-class mysteries.

### Amelia Dégrasse (Victim)
*   **Role**: The deceased.
*   **Secret**: She was secretly married to Thomas and planned to leave her family wealth behind.

### Thomas Souvellier
*   **Role**: The Client / Amelia’s Partner.
*   **Traits**: Emotional, soft, sensitive soul.
*   **Secret**: Son of the Chief of Police. He hired Louis because he doesn't trust the official police investigation.

### Jeanne-Paul Leduc (The Butler)
*   **Role**: Key Witness / Gatekeeper.
*   **Traits**: Formally polite, overwhelmed by the tragedy. He manages the mansion's day-to-day operations.

### Beatrix Lémur (The Nanny)
*   **Role**: The Antagonist / Killer.
*   **Traits**: Efficient, long-term servant of the Dégrasse family (multiple generations).
*   **Motive**: Revealed in later chapters.

---

## 3. World Building & Settings

| Location | Atmosphere | Key Purpose |
| :--- | :--- | :--- |
| **Outside** | Stormy, Dark, Oppressive | Setting the Noir tone; Arrival. |
| **Hallway** | Old, Rich, Stately | Central hub for character interactions. |
| **Living Room** | Big, Comfortable, Open | Meeting Thomas; Finding the Nanny's Key. |
| **Nursery** | Big, Empty, Eerie | Meeting the Nanny; Seeing the family picture. |
| **Crime Scene** | Cold, Heavy, Forensic | Finding the Police Tablet; Starting the 1NF Puzzle. |
| **Nanny's Room** | Cozy, Personal, Modest | Investigating the Nanny's secret life. |

---

## 4. Chapter Overview

*   **Chapter 1: The Arrival**: Meet the suspects, explore the ground floor, and gain access to the Crime Scene.
*   **Chapter 2: The ponder**: Search through the secrets of the house.
*   **Chapter 3: The Nanny's Secrets**: Use the decrypted logs to find the Nanny's key. Investigate her room and confront her.
*   **Chapter 4: The Professor's Quarters**: Investigate Thomas' room. First escalation of the case.
*   **Chapter 5: Confluence (Dreamspace)**: An imaginative, high-fidelity interrogation sequence where Louis pieces the final clues together.
*   **Chapter 6: Revelation**: The final arrest and the Nanny's confession.

---

## 5. Interaction Standards

### Logic Guards 
*   **Crime Scene**: Locked until the Butler (Leduc) grants permission.
*   **Nanny's Room**: Locked until the 1NF puzzle is solved and the key is recovered from the Piano.
* TBI **Police Tablet**: Says 'no entries' until player finds dongle at the crime scene.
* TBI **Upstairs**: Locked until Thomas Souvellier asks Louis if Louis has checked upstairs. --> Going up triggers titlescreen + credits

### Police Ledger
* TBI **Crime Scene**: Knife ("knife" used as primary key for multiple entrees eg. type, where located in house, age of blood) --> indicator that you should use the ledger.
* TBI **Hallway**: Nothing.
* TBI **Living room**: Current edit
* TBI **Nursery**: Meerdere tabellen in één kolom (eg. 3 babies in kolom mensen)
* TBI **Outside**: Nothing.

### Educational Mechanic (1NF)
*   **Problem**: Multiple entries (rooms) in single database cells.
*   **Action**: Player must split cells to achieve **Atomicity**.
*   **Payoff**: Reveals Log #005 (The Nanny Key clue).
