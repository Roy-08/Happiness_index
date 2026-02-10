"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type AnswerMap = Record<string, number>;

interface Country {
  code: string;
  name: string;
  flag: string;
}

const questions = [
  {
    page: 1,
    questions: [
      {
        id: 'q1',
        textTa: 'கே1/20: நான் என் வாழ்க்கையைப் பார்க்கும்போது, அது இப்படி உணர்கிறது...',
        textEn: 'Q1/20: When I look at my life, it feels like...',
        options: [
          { emoji: '🚀', textTa: 'சரியான திசையில் நகரும் ஒரு கதை', textEn: 'A story moving in the right direction', points: 4 },
          { emoji: '🧩', textTa: 'அதன் கதைக்களத்தை இழந்துகொண்டே இருக்கும் ஒரு கதை', textEn: 'A story that keeps losing its plot', points: 2 },
          { emoji: '📝', textTa: 'பல திருத்தங்கள் நிலுவையில் உள்ள ஒரு கரடு வரைவு', textEn: 'A rough draft with many edits pending', points: 1 },
          { emoji: '🎬', textTa: 'பெரும்பாலும் பாதையில் இருக்கும் ஒரு ஸ்கிரிப்ட்', textEn: 'A script that is mostly on track', points: 3 },
          { emoji: '📖', textTa: 'இருக்க வேண்டிய விதத்தில் விரிவடையும் ஒரு கதை', textEn: 'A narrative unfolding the way it should', points: 5 },
        ],
      },
      {
        id: 'q2',
        textTa: 'கே2/20: வெளிப்புற சூழ்நிலைகளைப் பொருட்படுத்தாமல் என் உள் உலகம் அமைதியாகவும் நிலையாகவும் உணர்கிறது.',
        textEn: 'Q2/20: My inner world feels calm and settled irrespective of outer situations.',
        options: [
          { emoji: '🥤', textTa: 'குலுக்கப்பட்ட சோடா கேன் போல', textEn: 'Like a shaken soda can', points: 0 },
          { emoji: '🏠', textTa: 'குழப்பமடைந்து பின்னர் மீட்டமைக்கப்படும் ஒரு அறை போல', textEn: 'Like a room that gets messy and then reset', points: 1 },
          { emoji: '💧', textTa: 'அரிதான அலைகளுடன் கூடிய குளம் போல', textEn: 'Like a pond with rare ripples', points: 2 },
          { emoji: '🌊', textTa: 'ஆழமான ஏரி போல, உள்ளே பெரும்பாலும் அமைதியானது', textEn: 'Like a deep lake, mostly still inside', points: 3 },
        ],
      },
    ],
  },
  {
    page: 2,
    questions: [
      {
        id: 'q3',
        textTa: 'கே3/20: முன்னால் உள்ள நாளுக்கான திசை உணர்வுடன் நான் எழுகிறேன்.',
        textEn: 'Q3/20: I wake up with a sense of direction for the day ahead.',
        options: [
          { emoji: '🤖', textTa: 'தானியங்கி பயன்முறையில், வெறும் இயக்கங்களை கடந்து செல்கிறேன்', textEn: 'On autopilot, just going through motions', points: 0 },
          { emoji: '🌫️', textTa: 'என்ன செய்ய வேண்டும் என்பதைப் பற்றிய தெளிவற்ற யோசனையுடன்', textEn: 'With a vague idea of what to do', points: 1 },
          { emoji: '🗺️', textTa: 'மனதில் ஒரு தளர்வான விளையாட்டுத் திட்டத்துடன்', textEn: 'With a loose game plan in mind', points: 3 },
          { emoji: '🧭', textTa: 'நாளுக்கான தெளிவான உள் திசைகாட்டியுடன்', textEn: 'With a clear inner compass for the day', points: 4 },
        ],
      },
      {
        id: 'q4',
        textTa: 'கே4/20: என் தற்போதைய வாழ்க்கை நான் ஒருமுறை விரும்பிய வாழ்க்கையை ஒத்திருக்கிறது.',
        textEn: 'Q4/20: My present life resembles the life I once wished for.',
        options: [
          { emoji: '🏚️', textTa: 'நான் ஒருபோதும் தேர்ந்தெடுக்காத வீட்டில் வாழ்வது போல', textEn: 'Like living in a house I never chose', points: 0 },
          { emoji: '🏠', textTa: 'சில சரியான அறைகள் கொண்ட வீடு போல', textEn: 'Like a house with a few right rooms', points: 2 },
          { emoji: '🏡', textTa: 'நான் தோராயமாக கற்பனை செய்த வீடு போல', textEn: 'Like the home I had roughly imagined', points: 1 },
          { emoji: '🖼️', textTa: 'நான் ஒருமுறை காகிதத்தில் வரைந்த வாழ்க்கைக்குள் நடப்பது போல', textEn: 'Like walking inside the life I once drew on paper', points: 3 },
        ],
      },
    ],
  },
  {
    page: 3,
    questions: [
      {
        id: 'q5',
        textTa: 'கே5/20: என் எண்ணங்கள் என்னை வடிகட்டுவதை விட அதிகமாக அதிகாரம் அளிக்கின்றன.',
        textEn: 'Q5/20: My thoughts empower me more than they drain me.',
        options: [
          { emoji: '📢', textTa: 'பெரும்பாலும் பின்னணி விமர்சனம் போல', textEn: 'Mostly like background criticism', points: 0 },
          { emoji: '⚖️', textTa: 'சந்தேகங்கள் மற்றும் சிறிய ஊக்க உரைகளின் கலவை', textEn: 'A mix of doubts and small pep talks', points: 1 },
          { emoji: '🧠', textTa: 'பெரும்பாலும் ஆதரவான உள் பயிற்சியாளர் போல', textEn: 'Often like a supportive inner coach', points: 3 },
          { emoji: '📣', textTa: 'பெரும்பாலும் நிலையான உள் உற்சாக அணி போல', textEn: 'Largely like a steady inner cheer squad', points: 4 },
        ],
      },
      {
        id: 'q6',
        textTa: 'கே6/20: நான் உத்வேகம் பெறுகிறேன்...',
        textEn: 'Q6/20: I feel inspired…',
        options: [
          { emoji: '☁️', textTa: 'கிட்டத்தட்ட ஒருபோதும் இல்லை, பெரும்பாலான நாட்கள் சமமாக உணர்கின்றன', textEn: 'Almost never, most days feel flat', points: 0 },
          { emoji: '⚡', textTa: 'சிறிய தீப்பொறிகள் எப்போதாவது தோன்றும்', textEn: 'Small sparks show up once in a while', points: 1 },
          { emoji: '🕯️', textTa: 'பல நாட்களில் மென்மையான பிரகாசம் உள்ளது', textEn: 'A gentle glow is present on many days', points: 2 },
          { emoji: '🔥', textTa: 'என்னை செயல்பட தூண்டும் அடிக்கடி வெடிப்புகள்', textEn: 'Frequent bursts that move me to act', points: 3 },
          { emoji: '☀️', textTa: 'என்னை உருவாக்கிக் கொண்டிருக்கும் நிலையான உள் நெருப்பு', textEn: 'A steady inner fire that keeps me creating', points: 4 },
        ],
      },
    ],
  },
  {
    page: 4,
    questions: [
      {
        id: 'q7',
        textTa: 'கே7/20: திட்டங்கள் மாறும்போது அல்லது உடையும்போது, என் அமைதி உணர்வு பாதிக்கப்படுகிறது',
        textEn: 'Q7/20: When plans shift or break, my sense of calm is affected',
        options: [
          { emoji: '💥', textTa: 'திட்டங்கள் மாறும்போது நான் உணர்ச்சிவசப்பட்டு விழுகிறேன்', textEn: 'I crash emotionally when plans change', points: 0 },
          { emoji: '😰', textTa: 'நான் மோசமாக அதிர்ந்து மன உளைச்சலில் இருக்கிறேன்', textEn: 'I get badly shaken and stay upset', points: 1 },
          { emoji: '🌀', textTa: 'நான் தள்ளாடுகிறேன் ஆனால் சமநிலையை மீண்டும் பெறுகிறேன்', textEn: 'I wobble but regain balance', points: 3 },
          { emoji: '🧘', textTa: 'லேசான அசௌகரியத்துடன் நான் சரிசெய்கிறேன்', textEn: 'I adjust with mild discomfort', points: 2 },
          { emoji: '🎯', textTa: 'நான் மையமாக இருக்கிறேன் மற்றும் வெறுமனே மறுபாதையை அமைக்கிறேன்', textEn: 'I stay centred and simply re-route', points: 4 },
        ],
      },
      {
        id: 'q8',
        textTa: 'கே8/20: நான் செய்வதில் மனரீதியாக இருப்பதாகவும் உள்வாங்கப்பட்டதாகவும் உணர்கிறேன்.',
        textEn: 'Q8/20: I feel mentally present and absorbed in what I do.',
        options: [
          { emoji: '🔇', textTa: 'பெரும்பாலும் ஒலியடக்கத்தில், மனம் வேறு இடத்தில் உள்ளது', textEn: 'Mostly on mute, mind is elsewhere', points: 0 },
          { emoji: '↔️', textTa: 'பாதி இங்கே, பாதி அடுத்த விஷயத்தில்', textEn: 'Half here, half on the next thing', points: 1 },
          { emoji: '👁️', textTa: 'பொதுவாக சில தவறுகளுடன் இருக்கிறேன்', textEn: 'Generally present with a few slips', points: 2 },
          { emoji: '⏰', textTa: 'நேரத்தின் தடத்தை இழக்கும் அளவுக்கு மூழ்கியிருக்கிறேன்', textEn: 'Immersed enough to lose track of time', points: 3 },
          { emoji: '✨', textTa: 'ஆழமாக உள்வாங்கப்பட்டுள்ளேன், வாழ்க்கை தெளிவாக உணர்கிறது', textEn: 'Deeply absorbed, life feels vivid', points: 4 },
        ],
      },
    ],
  },
  {
    page: 5,
    questions: [
      {
        id: 'q9',
        textTa: 'கே9/20: என் எதிர்காலம் தோன்றுகிறது...',
        textEn: 'Q9/20: My future appears as…',
        options: [
          { emoji: '🌑', textTa: 'விளக்குகள் அணைக்கப்பட்ட ஒரு நடைபாதை போல', textEn: 'A corridor with lights switched off', points: 0 },
          { emoji: '🌫️', textTa: 'மங்கலான வெளிப்புறங்களுடன் மூடுபனி நிறைந்த பாதை போல', textEn: 'A foggy lane with faint outlines', points: 1 },
          { emoji: '🛣️', textTa: 'இடைவெளியில் விளக்குகள் கொண்ட வளைந்த சாலை போல', textEn: 'A winding road with lamps at intervals', points: 2 },
          { emoji: '🛤️', textTa: 'தெளிவான பலகைகள் கொண்ட திறந்த நெடுஞ்சாலை போல', textEn: 'An open highway with clear signboards', points: 3 },
          { emoji: '🌅', textTa: 'பல பிரகாசமான பாதைகள் கொண்ட பரந்த அடிவானம் போல', textEn: 'A wide horizon with many bright paths', points: 4 },
        ],
      },
      {
        id: 'q10',
        textTa: 'கே10/20: என் வாழ்க்கை எனக்கு உணர்ச்சி வருமானத்தை தருகிறது — மகிழ்ச்சி, பெருமை, நிறைவு.',
        textEn: 'Q10/20: My life gives me emotional returns — joy, pride, fulfilment.',
        options: [
          { emoji: '📉', textTa: 'பெரும்பாலும் உணர்ச்சி இழப்புகள் அல்லது வடிகால்கள்', textEn: 'Mostly emotional losses or drains', points: 0 },
          { emoji: '💫', textTa: 'திரும்பப் பெறுவதற்கான சில சிதறிய தருணங்கள்', textEn: 'A few scattered moments of return', points: 2 },
          { emoji: '⚖️', textTa: 'மகிழ்ச்சி மற்றும் நிறைவின் நியாயமான பங்கு', textEn: 'A fair share of joy and fulfilment', points: 1 },
          { emoji: '📈', textTa: 'முயற்சிக்கு மதிப்புள்ளதாக உணரும் நிலையான வருமானம்', textEn: 'Consistent returns that feel worth the effort', points: 3 },
          { emoji: '💎', textTa: 'பெரும்பாலான பகுதிகளில் வளமான உணர்ச்சி ஈவுத்தொகை', textEn: 'Rich emotional dividends in most areas', points: 4 },
        ],
      },
    ],
  },
  {
    page: 6,
    questions: [
      {
        id: 'q11',
        textTa: 'கே11/20: காலப்போக்கில் நான் ஒரு நபராக வளர்கிறேன்.',
        textEn: 'Q11/20: I grow as a person with time.',
        options: [
          { emoji: '🔄', textTa: 'நான் மீண்டும் மீண்டும் சிக்கியிருப்பதாக உணர்கிறேன்', textEn: 'I feel stuck on repeat', points: 0 },
          { emoji: '📊', textTa: 'நான் சிறிய, அரிதான தாவல்களில் மட்டுமே வளர்கிறேன்', textEn: 'I grow only in small, rare jumps', points: 1 },
          { emoji: '🌱', textTa: 'நிலையான உள் வளர்ச்சியை என்னால் உணர முடிகிறது', textEn: 'I can sense steady inner growth', points: 3 },
          { emoji: '🌳', textTa: 'நான் குறிப்பிடத்தக்க வழிகளில் தொடர்ந்து வளர்கிறேன்', textEn: 'I keep evolving in noticeable ways', points: 4 },
        ],
      },
      {
        id: 'q12',
        textTa: 'கே12/20: அர்த்தமும் நோக்கமும் என் முடிவுகளை வழிநடத்துகின்றன.',
        textEn: 'Q12/20: Meaning and purpose guide my decisions.',
        options: [
          { emoji: '🚨', textTa: 'பெரும்பாலும் உயிர்வாழ்வு மற்றும் அவசரம் என்னை இயக்குகிறது', textEn: 'Mostly survival and urgency drive me', points: 0 },
          { emoji: '🤔', textTa: 'சில நேரங்களில் இது உண்மையில் முக்கியமா என்று சரிபார்க்கிறேன்', textEn: 'Sometimes I check if it truly matters', points: 2 },
          { emoji: '🧭', textTa: 'பெரும்பாலும் என் "ஏன்" உடன் சீரமைப்பை சரிபார்க்கிறேன்', textEn: 'Often I check alignment with my why', points: 1 },
          { emoji: '⭐', textTa: 'பெரும்பாலும் என் தேர்வுகள் தெளிவான உள் நோக்கத்தை பின்பற்றுகின்றன', textEn: 'Largely my choices follow a clear inner purpose', points: 3 },
        ],
      },
    ],
  },
  {
    page: 7,
    questions: [
      {
        id: 'q13',
        textTa: 'கே13/20: நானாக இருப்பது வசதியாக உணர்கிறது.',
        textEn: 'Q13/20: Being myself feels comfortable.',
        options: [
          { emoji: '🎭', textTa: 'நான் அடிக்கடி கடந்து செல்ல முகமூடிகளை அணிகிறேன்', textEn: 'I often wear masks to get through', points: 0 },
          { emoji: '👥', textTa: 'நான் சில நபர்களுடன் மட்டுமே நானாக இருக்க முடியும்', textEn: 'I can be myself only with a few people', points: 1 },
          { emoji: '😊', textTa: 'நான் பெரும்பாலான இடங்களில் பெரும்பாலும் நானாக இருக்கிறேன்', textEn: 'I am mostly myself in most spaces', points: 3 },
          { emoji: '💯', textTa: 'கிட்டத்தட்ட எல்லா இடங்களிலும் என் சொந்த தோலில் வீட்டில் இருப்பது போல உணர்கிறேன்', textEn: 'I feel at home in my own skin almost everywhere', points: 4 },
        ],
      },
      {
        id: 'q14',
        textTa: 'கே14/20: நான் என் சொந்த நிறுவனத்தை ரசிக்கிறேன்.',
        textEn: 'Q14/20: I enjoy my own company.',
        options: [
          { emoji: '🚫', textTa: 'என்னுடன் தனியாக இருப்பதை நான் தவிர்க்கிறேன்', textEn: 'I avoid being alone with myself', points: 0 },
          { emoji: '⏱️', textTa: 'சிறிய அளவுகளில் என் சொந்த நிறுவனத்தை பொறுத்துக்கொள்கிறேன்', textEn: 'I tolerate my own company in small doses', points: 1 },
          { emoji: '👍', textTa: 'பொதுவாக என்னுடன் நேரத்தை செலவிட விரும்புகிறேன்', textEn: 'I generally like spending time with myself', points: 2 },
          { emoji: '💖', textTa: 'நான் உண்மையாக என் தனி நேரத்தை எதிர்நோக்குகிறேன்', textEn: 'I genuinely look forward to my alone time', points: 3 },
        ],
      },
    ],
  },
  {
    page: 8,
    questions: [
      {
        id: 'q15',
        textTa: 'கே15/20: மக்கள் என்னைச் சுற்றி உணர்ச்சி ரீதியாக பாதுகாப்பாக உணர்கிறார்கள்.',
        textEn: 'Q15/20: People feel emotionally safe around me.',
        options: [
          { emoji: '🚧', textTa: 'மக்கள் என்னிடம் திறக்க தயங்குகிறார்கள்', textEn: 'People hesitate to open up to me', points: 0 },
          { emoji: '🤐', textTa: 'சிலர் பகிர்ந்துகொள்கிறார்கள், ஆனால் எச்சரிக்கையுடன்', textEn: 'A few share, but cautiously', points: 1 },
          { emoji: '🤗', textTa: 'பல மக்கள் எளிதில் என்னிடம் நம்பிக்கை வைக்கிறார்கள்', textEn: 'Many people confide in me with ease', points: 3 },
          { emoji: '🛡️', textTa: 'நான் அடிக்கடி மக்கள் முதலில் திரும்பும் நபர்', textEn: 'I am often the person people turn to first', points: 4 },
        ],
      },
      {
        id: 'q16',
        textTa: 'கே16/20: சமீபத்திய நாட்களைப் பற்றி நினைக்கும்போது, இனிமையான தருணங்களை நினைவு கூருகிறேன்.',
        textEn: 'Q16/20: When I think of recent days, I recall pleasant moments.',
        options: [
          { emoji: '😶', textTa: 'இனிமையான எதையும் நினைவுபடுத்த நான் போராடுகிறேன்', textEn: 'I struggle to recall anything pleasant', points: 0 },
          { emoji: '🌟', textTa: 'சில சிதறிய நல்ல தருணங்கள் வருகின்றன', textEn: 'A few scattered good moments come up', points: 1 },
          { emoji: '😌', textTa: 'பல சூடான நினைவுகள் எளிதில் மேலே வருகின்றன', textEn: 'Several warm memories surface easily', points: 2 },
          { emoji: '🌈', textTa: 'பல தெளிவான இனிமையான தருணங்கள் ஒரே நேரத்தில் மனதில் வருகின்றன', textEn: 'Many vivid pleasant moments come to mind at once', points: 3 },
        ],
      },
    ],
  },
  {
    page: 9,
    questions: [
      {
        id: 'q17',
        textTa: 'கே17/20: என் தூக்கத்தின் தரம் நன்றாக இருக்கும்போது என் உணர்ச்சி நிலைத்தன்மை சிறப்பாக இருக்கும்.',
        textEn: 'Q17/20: My emotional stability is better when my quality of sleep is good.',
        options: [
          { emoji: '🌪️', textTa: 'தூக்கத்தைப் பொருட்படுத்தாமல் என் மனநிலைகள் நிலையற்றவை', textEn: 'My moods are unstable regardless of sleep', points: 0 },
          { emoji: '🤷', textTa: 'தூக்கம் கொஞ்சம் உதவுகிறது ஆனால் நம்பகமாக இல்லை', textEn: 'Sleep helps a little but not reliably', points: 1 },
          { emoji: '😴', textTa: 'நல்ல தூக்கம் பொதுவாக என்னை நிலையாக வைத்திருக்கிறது', textEn: 'Good sleep usually keeps me steadier', points: 2 },
          { emoji: '⚓', textTa: 'நல்ல தூக்கம் தெளிவாக என் உணர்ச்சி சமநிலையை நங்கூரமிடுகிறது', textEn: 'Good sleep clearly anchors my emotional balance', points: 3 },
        ],
      },
      {
        id: 'q18',
        textTa: 'கே18/20: என் ஆற்றல் நிலைகள் நாள் முழுவதும் நிலையாக இருக்கும்.',
        textEn: 'Q18/20: My energy levels stay steady through the day.',
        options: [
          { emoji: '📉', textTa: 'ஆற்றல் நாள் முழுவதும் கூர்மையாக குறைகிறது', textEn: 'Energy drops sharply through the day', points: 0 },
          { emoji: '📊', textTa: 'என் ஆற்றல் வரைபடம் தொடர்ச்சியான ஜிக்ஜாக் ஆகும்', textEn: 'My energy graph is a continuous zigzag', points: 1 },
          { emoji: '➖', textTa: 'ஆற்றல் லேசான வீழ்ச்சிகளுடன் பெரும்பாலும் நிலையானது', textEn: 'Energy is mostly steady with mild dips', points: 2 },
          { emoji: '🔋', textTa: 'நான் நாளின் பெரும்பகுதியை நிலையான முறையில் ஆற்றல் பெறுகிறேன்', textEn: 'I feel sustainably energised most of the day', points: 3 },
        ],
      },
    ],
  },
  {
    page: 10,
    questions: [
      {
        id: 'q19',
        textTa: 'கே19/20: என் சமீபத்திய தொடர்புகள் என்னை மற்றவர்களுடன் இணைக்கப்பட்டதாக உணர வைத்துள்ளன.',
        textEn: 'Q19/20: My interactions recently have left me feeling connected to others.',
        options: [
          { emoji: '⛓️', textTa: 'பெரும்பாலும் வடிகட்டும் அல்லது துண்டிக்கும் தொடர்புகள்', textEn: 'Mostly draining or disconnecting interactions', points: 0 },
          { emoji: '😐', textTa: 'அதிக உணர்வு இல்லாமல் நடுநிலை பரிமாற்றங்கள்', textEn: 'Neutral exchanges without much feeling', points: 1 },
          { emoji: '🤝', textTa: 'பொதுவாக சூடான மற்றும் இணைக்கும் தருணங்கள்', textEn: 'Generally warm and connecting moments', points: 2 },
          { emoji: '💞', textTa: 'பல தொடர்புகளில் ஆழமான, ஊட்டமளிக்கும் இணைப்புகள்', textEn: 'Deep, nourishing connections in many interactions', points: 3 },
        ],
      },
      {
        id: 'q20',
        textTa: 'கே20/20: வாழ்க்கை நான் ஈடுபட்டிருக்கும் ஒரு அனுபவம் போல அதிகம் உணர்கிறது, நான் வெறுமனே கடந்து செல்லும் ஒன்று அல்ல.',
        textEn: 'Q20/20: Life feels more like an experience I am engaged in, rather than something I simply pass through.',
        options: [
          { emoji: '🖼️', textTa: 'நான் அரிதாகவே கவனிக்கும் பின்னணி வால்பேப்பர் போல', textEn: 'Like background wallpaper I hardly notice', points: 0 },
          { emoji: '🎬', textTa: 'நான் பக்கவாட்டில் இருந்து பார்க்கும் திரைப்படம் போல', textEn: 'Like a movie I watch from the side-lines', points: 1 },
          { emoji: '🎮', textTa: 'நான் அவ்வப்போது சேரும் விளையாட்டு போல', textEn: 'Like a game I join in now and then', points: 3 },
          { emoji: '🎢', textTa: 'நான் முழுமையாக பங்கேற்கும் விரிவடையும் சாகசம் போல', textEn: 'Like an unfolding adventure I am fully part of', points: 4 },
        ],
      },
    ],
  },
];

export default function TamilQuizPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [showAlert, setShowAlert] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  // Form states
  const [countries, setCountries] = useState<Country[]>([]);
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    birthdate: '',
    gender: '',
    country: '',
    occupation: '',
  });

  const [dateError, setDateError] = useState('');

  const totalPages = 10;
  const currentQuestions =
    questions.find(p => p.page === currentPage)?.questions || [];

  // Clear localStorage on mount to start fresh every time
  useEffect(() => {
    localStorage.removeItem('quizAnswersTamil');
    localStorage.removeItem('quizCurrentPageTamil');
    localStorage.removeItem('userFormTamil');
    localStorage.removeItem('totalScoreTamil');
  }, []);

  // Fetch countries
  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=cca2,name,flags')
      .then((res) => res.json())
      .then((data) => {
        const sorted = data
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((c: any) => ({
            code: c.cca2,
            name: c.name.common,
            flag: c.flags?.png || '',
          }))
          .sort((a: Country, b: Country) => a.name.localeCompare(b.name));

        setCountries(sorted);
        setAllCountries(sorted);
      })
      .catch(console.error);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToTop = () => {
    if ('scrollTo' in globalThis) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAnswer = (qid: string, index: number) => {
    setAnswers(prev => ({ ...prev, [qid]: index }));
  };

  const validateAndMove = () => {
    const allAnswered = currentQuestions.every(
      q => answers[q.id] !== undefined
    );

    if (!allAnswered) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2500);
      return;
    }

    if (currentPage < totalPages) {
      setCurrentPage(p => p + 1);
      scrollToTop();
    } else {
      setShowForm(true);
      scrollToTop();
    }
  };

  const movePrevious = () => {
    if (currentPage === 1) {
      router.push('/');
    } else {
      setCurrentPage(p => p - 1);
      scrollToTop();
    }
  };

  const validateBirthdate = (date: string): boolean => {
    if (!date) {
      setDateError('');
      return true;
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate >= today) {
      setDateError('Birthdate cannot be today or in the future');
      return false;
    }

    const age = today.getFullYear() - selectedDate.getFullYear();
    const monthDiff = today.getMonth() - selectedDate.getMonth();
    const dayDiff = today.getDate() - selectedDate.getDate();
    
    let actualAge = age;
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      actualAge--;
    }

    if (actualAge < 7) {
      setDateError('You must be at least 7 years old to take this quiz');
      return false;
    }

    setDateError('');
    return true;
  };

  const validateMobile = (mobile: string): boolean => {
    const mobileRegex = /^\+?[0-9]{10,15}$/;
    return mobileRegex.test(mobile.replace(/[\s-]/g, ''));
  };

  const calculateTotalScore = (): number => {
    let totalScore = 0;
    let maxPossibleScore = 0;
    
    questions.forEach(page => {
      page.questions.forEach(question => {
        const answerIndex = answers[question.id];
        if (answerIndex !== undefined) {
          const selectedOption = question.options[answerIndex];
          totalScore += selectedOption.points || 0;
        }
        
        const maxPoints = Math.max(...question.options.map(opt => opt.points || 0));
        maxPossibleScore += maxPoints;
      });
    });
    
    if (maxPossibleScore === 0) return 0;
    const percentageScore = Math.round((totalScore / maxPossibleScore) * 100);
    return percentageScore;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.birthdate && !validateBirthdate(form.birthdate)) {
      return;
    }

    if (!validateMobile(form.mobile)) {
      alert('Please enter a valid mobile number (10-15 digits)');
      return;
    }

    setShowForm(false);
    setShowThankYou(true);
    scrollToTop();

    const totalScore = calculateTotalScore();
    
    fetch('/api/submit-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        dob: form.birthdate || null,
        gender: form.gender,
        country: form.country,
        occupation: form.occupation || null,
        totalScore: totalScore,
        answers: answers,
        language: 'tamil',
      }),
    })
    .then(res => res.json())
    .then(data => {
      console.log('Quiz submitted successfully:', data);
    })
    .catch(error => {
      console.error('Background submission error:', error);
    });
  };

  const handleBackToHome = () => {
    setAnswers({});
    setCurrentPage(1);
    setShowForm(false);
    setShowThankYou(false);
    setForm({
      name: '',
      email: '',
      mobile: '',
      birthdate: '',
      gender: '',
      country: '',
      occupation: '',
    });
    setSelectedCountry(null);
    
    router.push('/');
  };

  const progress = (currentPage / totalPages) * 100;

  // Thank You Page
  if (showThankYou) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-pink-200/40 to-red-200/40 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-rose-200/40 to-orange-200/40 rounded-full blur-3xl opacity-60"></div>
        </div>

        <div className="relative w-full max-w-lg">
          <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl md:rounded-[3rem] shadow-2xl border border-white/60 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-red-500 to-rose-500"></div>
            
            <div className="p-6 md:p-12 text-center">
              <div className="flex justify-center mb-6 md:mb-10">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-red-500 rounded-full blur-xl md:blur-2xl opacity-40"></div>
                  
                  <div className="relative w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-[#de0f3f] via-[#ff4466] to-[#ff6b6b] rounded-full shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform duration-500">
                    <div className="absolute inset-2 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                    
                    <div className="relative z-10">
                      <img 
                        src="https://cdn-icons-png.flaticon.com/512/945/945467.png"
                        alt="Email Icon"
                        className="w-12 h-12 md:w-16 md:h-16 drop-shadow-lg"
                        style={{ filter: 'brightness(0) invert(1)' }}
                      />
                    </div>
                    
                    <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-4 h-4 md:w-6 md:h-6 text-yellow-300">
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
                      </svg>
                    </div>
                    <div className="absolute -bottom-2 -left-2 md:-bottom-3 md:-left-3 w-3 h-3 md:w-5 md:h-5 text-yellow-300">
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl font-black mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#de0f3f] via-[#ff4466] to-[#ff6b6b]">
                Thank You
              </h1>

              <div className="mb-6 md:mb-8 space-y-2">
                <p className="text-lg md:text-xl text-gray-800 font-semibold px-2">
                  Your Happiness Report is on its way! 🎉
                </p>
                <p className="text-base md:text-lg text-gray-600 px-2">
                  We&apos;ve sent your personalized insights to
                </p>
              </div>

              <div className="mb-6 md:mb-10 px-2">
                <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-pink-50 to-red-50 rounded-xl md:rounded-2xl border-2 border-pink-200 shadow-lg max-w-full">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-[#de0f3f] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm md:text-lg font-bold text-[#de0f3f] break-all">
                    {form.email}
                  </span>
                </div>
              </div>

              <div className="mb-6 md:mb-8">
                <p className="text-sm md:text-base text-gray-700 font-medium mb-2 px-2">
                  📧 Check your email for your detailed report and certificate
                </p>
                <p className="text-xs md:text-sm text-gray-500 italic px-2">
                  (Don&apos;t forget to check your spam folder)
                </p>
              </div>

              <div className="flex items-center justify-center mb-6 md:mb-10 px-4">
                <div className="h-0.5 md:h-1 w-20 md:w-32 bg-gradient-to-r from-transparent via-pink-300 to-transparent rounded-full"></div>
                <div className="mx-3 md:mx-4 w-2 h-2 md:w-3 md:h-3 bg-gradient-to-br from-pink-400 to-red-500 rounded-full"></div>
                <div className="h-0.5 md:h-1 w-20 md:w-32 bg-gradient-to-r from-transparent via-red-300 to-transparent rounded-full"></div>
              </div>

              <button
                onClick={() => {
                  const name = encodeURIComponent(form.name);
                  const date = encodeURIComponent(new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }));
                  router.push(`/certificate?name=${name}&date=${date}`);
                }}
                className="group relative inline-flex items-center gap-2 md:gap-3 px-8 md:px-10 py-4 md:py-5 bg-gradient-to-r from-[#de0f3f] via-[#ff4466] to-[#ff6b6b] text-white font-bold text-base md:text-lg rounded-full shadow-2xl hover:shadow-[#de0f3f]/50 transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                
                <svg className="w-5 h-5 md:w-6 md:h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="relative z-10">Download Certificate</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form Page
  if (showForm) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-red-50 to-orange-50">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-red-300 rounded-full mix-blend-multiply filter blur-xl"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl"></div>
          </div>
        </div>

        <div className="relative min-h-screen flex items-center justify-center p-4 py-8">
          <div className="w-full max-w-2xl">
            <div className="bg-white/80 backdrop-blur-lg p-5 md:p-10 rounded-2xl md:rounded-3xl shadow-2xl border border-white/50">
              <div className="text-center mb-6 md:mb-8">
                <div className="inline-block p-3 md:p-4 bg-gradient-to-br from-[#de0f3f] to-[#ff6b6b] rounded-full mb-3 md:mb-4">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-[#de0f3f] mb-2 md:mb-3">
                  Almost There!
                </h1>
                <p className="text-gray-600 text-sm md:text-base px-2">
                  Just a few details to unlock your personalized happiness insights
                </p>
              </div>

              <form className="space-y-4 md:space-y-5" onSubmit={handleFormSubmit}>
                <div className="group">
                  <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5">
                    Full Name <span className="text-[#de0f3f]">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2 italic">
                     This name will appear on your certificate
                  </p>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-0 py-2 md:py-2.5 bg-transparent border-b-2 border-gray-300 focus:border-[#de0f3f] focus:outline-none transition-all duration-300 text-gray-800 text-sm md:text-base placeholder-gray-400"
                    required
                  />
                </div>

                <div className="group">
                  <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5">
                    Email Address <span className="text-[#de0f3f]">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-0 py-2 md:py-2.5 bg-transparent border-b-2 border-gray-300 focus:border-[#de0f3f] focus:outline-none transition-all duration-300 text-gray-800 text-sm md:text-base placeholder-gray-400"
                    required
                  />
                </div>

                <div className="group">
                  <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5">
                    Mobile Number <span className="text-[#de0f3f]">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+1234567890"
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    className="w-full px-0 py-2 md:py-2.5 bg-transparent border-b-2 border-gray-300 focus:border-[#de0f3f] focus:outline-none transition-all duration-300 text-gray-800 text-sm md:text-base placeholder-gray-400"
                    required
                  />
                </div>

                <div className="group">
                  <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5">
                    Date of Birth <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    value={form.birthdate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      setForm({ ...form, birthdate: e.target.value });
                      validateBirthdate(e.target.value);
                    }}
                    className="w-full px-0 py-2 md:py-2.5 bg-transparent border-b-2 border-gray-300 focus:border-[#de0f3f] focus:outline-none transition-all duration-300 text-gray-800 text-sm md:text-base h-10 md:h-11"
                  />
                  {dateError && (
                    <p className="mt-1.5 text-xs md:text-sm text-red-600 font-medium">{dateError}</p>
                  )}
                </div>

                <div className="group">
                  <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5">
                    Gender <span className="text-[#de0f3f]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="w-full px-0 py-2 md:py-2.5 bg-transparent border-b-2 border-gray-300 focus:border-[#de0f3f] focus:outline-none transition-all duration-300 text-gray-800 text-sm md:text-base cursor-pointer appearance-none"
                      style={{ color: form.gender ? '#1f2937' : '#9ca3af' }}
                      required
                    >
                      <option value="" disabled>Select your gender</option>
                      <option value="Male" style={{ color: '#1f2937' }}>Male</option>
                      <option value="Female" style={{ color: '#1f2937' }}>Female</option>
                      <option value="Other" style={{ color: '#1f2937' }}>Other</option>
                    </select>
                    <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="group" ref={dropdownRef}>
                  <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5">
                    Country <span className="text-[#de0f3f]">*</span>
                  </label>
                  <div className="relative">
                    <div className="flex items-center w-full px-0 py-2 md:py-2.5 border-b-2 border-gray-300 focus-within:border-[#de0f3f] transition-all duration-300 cursor-pointer">
                      {selectedCountry && (
                        <img
                          src={selectedCountry.flag}
                          alt={selectedCountry.name}
                          className="w-6 h-4 md:w-7 md:h-5 object-cover mr-2 md:mr-3 rounded shadow-sm"
                        />
                      )}
                      <input
                        type="text"
                        placeholder="Select your country"
                        value={selectedCountry?.name || form.country}
                        onClick={() => setDropdownOpen(true)}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm({ ...form, country: val });
                          setDropdownOpen(true);
                          setSelectedCountry(null);
                          const filtered = allCountries.filter((c) =>
                            c.name.toLowerCase().includes(val.toLowerCase())
                          );
                          setCountries(filtered);
                        }}
                        className="flex-1 focus:outline-none text-gray-800 text-sm md:text-base bg-transparent placeholder-gray-400"
                        required
                      />
                    </div>

                    {dropdownOpen && (
                      <div className="absolute z-20 w-full bg-white border-2 border-gray-200 mt-2 max-h-48 md:max-h-60 overflow-y-auto rounded-xl md:rounded-2xl shadow-xl">
                        {countries.map((c) => (
                          <div
                            key={c.code}
                            className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 cursor-pointer hover:bg-gradient-to-r hover:from-[#ffe6e6] hover:to-[#fff0f0] transition-all duration-200 text-gray-800 text-sm md:text-base"
                            onClick={() => {
                              setSelectedCountry(c);
                              setForm({ ...form, country: c.name });
                              setDropdownOpen(false);
                            }}
                          >
                            <img
                              src={c.flag}
                              alt={c.name}
                              className="w-6 h-4 md:w-7 md:h-5 object-cover rounded shadow-sm"
                            />
                            <span className="font-medium">{c.name}</span>
                          </div>
                        ))}
                        {countries.length === 0 && (
                          <div className="px-4 py-3 text-gray-500 text-center text-sm">
                            No country found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5">
                    Occupation <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.occupation}
                      onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                      className="w-full px-0 py-2 md:py-2.5 bg-transparent border-b-2 border-gray-300 focus:border-[#de0f3f] focus:outline-none transition-all duration-300 text-gray-800 text-sm md:text-base cursor-pointer appearance-none"
                      style={{ color: form.occupation ? '#1f2937' : '#9ca3af' }}
                    >
                      <option value="" style={{ color: '#9ca3af' }}>Select your occupation (optional)</option>
                      <option value="Student" style={{ color: '#1f2937' }}>Student</option>
                      <option value="Working Professional" style={{ color: '#1f2937' }}>Working Professional</option>
                      <option value="Self-Employed / Business" style={{ color: '#1f2937' }}>Self-Employed / Business</option>
                      <option value="Homemaker" style={{ color: '#1f2937' }}>Homemaker</option>
                      <option value="Retired" style={{ color: '#1f2937' }}>Retired</option>
                      <option value="Currently Not Working" style={{ color: '#1f2937' }}>Currently Not Working</option>
                    </select>
                    <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 md:py-5 rounded-xl md:rounded-2xl font-bold text-base md:text-lg text-white transition-all duration-300 transform relative overflow-hidden group mt-6 md:mt-8 bg-gradient-to-r from-[#de0f3f] to-[#ff6b6b] hover:shadow-2xl hover:shadow-[#de0f3f]/50 hover:-translate-y-1 active:translate-y-0"
                >
                  <span className="relative z-10">
                    <div className="flex items-center justify-center gap-2 cursor-pointer">
                      <span>Submit</span>
                      <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </span>
                </button>
              </form>

              <div className="mt-5 md:mt-6 text-center">
                <button
                  onClick={() => setShowForm(false)}
                  className="inline-flex cursor-pointer items-center gap-1.5 md:gap-2 text-[#de0f3f] hover:text-[#c00d37] font-semibold transition-colors group text-sm md:text-base"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5 cursor-pointer group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                  <span>Back to Questions</span>
                </button>
              </div>

              <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200 flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-500">
                <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Your information is secure and confidential</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz questions view
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div
        className={`fixed top-5 px-8 py-4 rounded-full bg-white shadow-xl border transition-all duration-500 z-50 ${
          showAlert ? 'right-5' : '-right-96'
        }`}
        style={{ color: '#de0f3f' }}
      >
        தொடர அனைத்து கேள்விகளுக்கும் பதிலளிக்கவும்
      </div>

      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-[0.2em] text-[#de0f3f]">
            HAPPINESS INDEX
          </h1>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#de0f3f] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <main className="flex-1 px-6 pb-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-5">
          {currentQuestions.map(q => (
            <div
              key={q.id}
              className="flex-1 bg-[#f8f8f8] p-6 rounded-3xl"
            >
              <div className="mb-5">
                <h2 className="font-bold text-gray-900 text-base mb-1">{q.textTa}</h2>
                <p className="text-gray-500 text-xs">{q.textEn}</p>
              </div>
              <div className="flex flex-col gap-3">
                {q.options.map((opt, idx) => {
                  const selected = answers[q.id] === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleAnswer(q.id, idx)}
                      className="cursor-pointer px-4 py-2.5 rounded-2xl border flex gap-3 items-start transition-all hover:shadow-md"
                      style={{
                        backgroundColor: selected ? '#de0f3f' : '#fff',
                        color: selected ? '#fff' : '#333',
                        borderColor: selected ? '#de0f3f' : '#ddd',
                      }}
                    >
                      <span className="text-lg mt-0.5">{opt.emoji}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{opt.textTa}</div>
                        <div className={`text-xs mt-0.5 ${selected ? 'text-white/80' : 'text-gray-500'}`}>
                          {opt.textEn}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="sticky bottom-0 left-0 right-0 bg-white border-t px-6 py-4 flex gap-3 mt-6">
        <button
          onClick={movePrevious}
          className="flex-1 py-3 rounded-full text-black font-semibold text-base hover:bg-gray-200 transition-colors"
        >
          பின்னால்
        </button>
        <button
          onClick={validateAndMove}
          className="flex-1 py-3 rounded-full text-white font-semibold text-base bg-[#de0f3f] hover:bg-[#c00d37] transition-colors"
        >
          {currentPage === totalPages ? 'அடுத்த படி' : 'அடுத்த படி'}
        </button>
      </footer>
    </div>
  );
}