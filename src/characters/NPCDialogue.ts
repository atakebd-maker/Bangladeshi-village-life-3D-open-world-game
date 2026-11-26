export interface DialogueEntry {
  speaker: string;
  lines: string[];
  giftItem?: string;
}

export const VILLAGE_DIALOGUES: Record<string, DialogueEntry> = {
  karim_farmer: {
    speaker: 'Karim Chacha (Farmer)',
    lines: [
      'Assalamu Alaikum, baba! The Aman paddy crop is lush and green after yesterday’s rain.',
      'If you pass by Rahim’s Tea Stall, bring me a cup of hot Dudh Cha!',
    ],
  },
  rahim_tea: {
    speaker: 'Rahim Mia (Tea Stall)',
    lines: [
      'Welcome to my Cha Stall! Have a seat on the wooden bench and enjoy fresh ginger tea.',
      'Take this cup of Hot Dudh Cha for Karim Chacha in the paddy field!',
    ],
    giftItem: 'Hot Dudh Cha',
  },
  salma_homemaker: {
    speaker: 'Salma Begum',
    lines: [
      'The pond water lilies are blooming beautifully this morning.',
      'Watch out for the ducks near the ghat and take some sweet mangoes from the basket!',
    ],
    giftItem: 'Ripe Himsagar Mango',
  },
  tariq_cricket: {
    speaker: 'Tariq (Village Captain)',
    lines: [
      'We are short one batsman for the Shonargaon Eleven match! Grab the bat and hit a six!',
      'Step onto the batting crease anytime to start our village cricket match.',
    ],
    giftItem: 'Willow Cricket Bat',
  },
  rafiq_mechanic: {
    speaker: 'Ustad Rafiq (Garage)',
    lines: [
      'I just tuned up the red 125cc motorcycle and the blue sports bike out front.',
      'You can ride any vehicle parked around the garage or bazaar whenever you want!',
    ],
  },
  imam_mosque: {
    speaker: 'Hafez Yunus (Mosque)',
    lines: [
      'Peace be upon you, young traveler. Our village thrives when neighbors look out for one another.',
    ],
  },
  teacher_school: {
    speaker: 'Master Anisur (School)',
    lines: [
      'Good morning! The students are learning about the rivers and history of Bangladesh today.',
    ],
  },
  fisherman_river: {
    speaker: 'Jele Monir (Fisherman)',
    lines: [
      'Caught fresh Hilsa and Rui from the river at dawn! Take one to the bazaar.',
    ],
    giftItem: 'Fresh River Rui Fish',
  },
};
