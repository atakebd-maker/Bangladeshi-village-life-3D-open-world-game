import { DialogueChoice } from '../types/game';

export interface DialogueEntry {
  speaker: string;
  greeting: string;
  choices: DialogueChoice[];
}

export const VILLAGE_DIALOGUES: Record<string, DialogueEntry> = {
  karim_farmer: {
    speaker: 'Karim Chacha (Farmer)',
    greeting: 'Assalamu Alaikum, baba! Working the Aman paddy fields since sunrise.',
    choices: [
      {
        label: 'How is the rice harvest?',
        reply: 'Alhamdulillah, this season’s rain made the stalks tall and golden. We harvest next week!',
      },
      {
        label: 'Here is hot Dudh Cha for you!',
        reply: 'Ah, Rahim’s ginger tea! Nothing tastes better on the paddy bund. Bless you, my boy!',
        completeMissionId: 'mission-tea',
      },
      {
        label: 'Any danger in the village?',
        reply: 'Careful crossing the paved highway — buses and cargo trucks speed down from Dhaka!',
      },
    ],
  },
  rahim_tea: {
    speaker: 'Rahim Mia (Cha Stall)',
    greeting: 'Welcome to Rahim Cha Stall! Sit on the bench anytime for hot tea.',
    choices: [
      {
        label: 'Give me a cup of Dudh Cha',
        reply: 'Here is steaming hot Dudh Cha! Take an extra cup for Karim Chacha in the paddy field.',
        giftItem: 'Hot Dudh Cha',
      },
      {
        label: 'What is the bazaar news?',
        reply: 'The cricket match is heating up on the southern field, and fresh Hilsa arrived from Padma!',
      },
      {
        label: 'How is business today?',
        reply: 'Alhamdulillah! Rickshaw pullers and travelers from the bus stand keep my kettle busy.',
      },
    ],
  },
  salma_homemaker: {
    speaker: 'Salma Begum',
    greeting: 'Good morning! Have you seen the water lilies blooming in our village pond?',
    choices: [
      {
        label: 'Can I go inside the house?',
        reply: 'Of course! Walk up to our tin-roof house door and tap Open Door to rest inside.',
      },
      {
        label: 'Any ripe mangoes today?',
        reply: 'Take these sweet Himsagar mangoes from our courtyard tree!',
        giftItem: 'Ripe Himsagar Mango',
      },
      {
        label: 'Where are the ducks?',
        reply: 'They are swimming around the pond ghat right beside the water lilies.',
      },
    ],
  },
  tariq_cricket: {
    speaker: 'Tariq (Cricket Captain)',
    greeting: 'Hey champ! Shonargaon Tigers need a hard-hitting batsman right now!',
    choices: [
      {
        label: 'Hand me a cricket bat!',
        reply: 'Here is our best Kashmir willow bat! Step onto the crease to face the first ball.',
        giftItem: 'Willow Cricket Bat',
      },
      {
        label: 'How do I hit a six?',
        reply: 'Watch the bowler’s delivery and swing right when the timing bar hits the green zone!',
      },
      {
        label: 'Who are we playing?',
        reply: 'Padma Strikers from across the canal — let’s defend our village ground!',
      },
    ],
  },
  rafiq_mechanic: {
    speaker: 'Ustad Rafiq (Garage)',
    greeting: 'Salam! Welcome to Rahman Motor Repair Garage.',
    choices: [
      {
        label: 'Which bike is the fastest?',
        reply: 'The blue 150cc Sports Bike out front flies on the paved highway. Try it out!',
      },
      {
        label: 'Are the highway vehicles safe?',
        reply: 'Watch out when crossing the highway — moving buses and trucks won’t stop easily!',
      },
      {
        label: 'Can you repair a CNG?',
        reply: 'CNG, easy bike, tractor, or bus — bring anything here and we fix it in minutes.',
      },
    ],
  },
  imam_mosque: {
    speaker: 'Hafez Yunus (Mosque)',
    greeting: 'Assalamu Alaikum wa Rahmatullah. Peace be upon you, young traveler.',
    choices: [
      {
        label: 'May I pray inside the Mosque?',
        reply: 'Yes, the mosque doors are open to everyone. Peace and kindness build our village.',
      },
      {
        label: 'Tell me about Shonargaon',
        reply: 'Our village sits beside the great river, surrounded by green paddy and honest folk.',
      },
      {
        label: 'Pray for our village',
        reply: 'May Allah keep every farmer, student, and traveler safe from harm.',
      },
    ],
  },
  teacher_school: {
    speaker: 'Master Anisur (School)',
    greeting: 'Good morning! Welcome to Shonargaon High School.',
    choices: [
      {
        label: 'Did you see the Bamboo Bridge?',
        reply: 'Crossing the shako bridge safely takes balance! Our students cross it every day.',
        completeMissionId: 'mission-bridge',
      },
      {
        label: 'What are students studying?',
        reply: 'Today’s lesson is about the rivers, agriculture, and heritage of rural Bangladesh.',
      },
      {
        label: 'Is sports allowed after class?',
        reply: 'Yes! Both the cricket pitch and football ground are open every afternoon.',
      },
    ],
  },
  fisherman_river: {
    speaker: 'Jele Monir (Fisherman)',
    greeting: 'Fresh catch from the Padma River! Look at the wooden boats bobbing on the shore.',
    choices: [
      {
        label: 'What did you catch today?',
        reply: 'Silver Hilsa and big river Rui! Take a fresh Rui fish to the bazaar.',
        giftItem: 'Fresh River Rui Fish',
        completeMissionId: 'mission-river',
      },
      {
        label: 'How are the river tides?',
        reply: 'Calm this morning, though monsoon thunderstorms make the waves rise fast.',
      },
      {
        label: 'Can I ride in a Nouka boat?',
        reply: 'Walk along the wooden ghat to enjoy the river breeze anytime!',
      },
    ],
  },
  shopper_general: {
    speaker: 'Village Neighbor',
    greeting: 'Assalamu Alaikum! Beautiful day in Shonargaon Bazaar.',
    choices: [
      {
        label: 'Where can I find a rickshaw?',
        reply: 'Head east toward the Rickshaw Stand — there are cycle rickshaws and green CNGs waiting!',
      },
      {
        label: 'What is good to eat here?',
        reply: 'Bangla Hotel serves hot rice and curry, and Rahim’s stall has the best tea.',
      },
      {
        label: 'See you around!',
        reply: 'Allah Hafez! Stay safe on the busy highway!',
      },
    ],
  },
  police_officer: {
    speaker: 'SI Faruk (Police)',
    greeting: 'Keep the peace in Shonargaon! We patrol the highway and bazaar.',
    choices: [
      {
        label: 'Is the highway busy today?',
        reply: 'Heavy buses and trucks pass through — look both ways before crossing the asphalt road!',
      },
      {
        label: 'Can I drive the Patrol Jeep?',
        reply: 'Only in emergencies, citizen — though there are plenty of motorcycles and CNGs around.',
      },
      {
        label: 'Just checking in!',
        reply: 'Stay respectful with villagers and enjoy exploring our rural heritage.',
      },
    ],
  },
};

export function getDialogueForNpc(key: string | undefined, fallbackName: string): DialogueEntry {
  if (key && VILLAGE_DIALOGUES[key]) {
    return VILLAGE_DIALOGUES[key];
  }
  return {
    speaker: fallbackName,
    greeting: `Assalamu Alaikum! I am ${fallbackName} from Shonargaon.`,
    choices: [
      {
        label: 'How is life in the village?',
        reply: 'Peaceful and lively! Morning birds, fresh air, and friendly neighbors everywhere.',
      },
      {
        label: 'Where should I explore next?',
        reply: 'Try visiting the Padma River bank, the Mosque, or play cricket on the south field!',
      },
      {
        label: 'Take care!',
        reply: 'Khoda Hafez! Have a wonderful time in Bangladesh Village Life 3D.',
      },
    ],
  };
}
