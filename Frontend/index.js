// --- Constants ---
const VOICES = {
  English: { Male: "Matthew", Female: "Alicia" },
  Hindi: { Male: "Aman", Female: "Namrita" },
  Tamil: { Male: "Murali", Female: "Iniya" },
  Telugu: { Male: "Zion", Female: "Josie" }
};

const LOCALES = {
  English: "en-US",
  Hindi: "hi-IN",
  Tamil: "ta-IN",
  Telugu: "te-IN"
};


// --- State ---
const state = {
  place: '',
  image: '',
  length: 'Summary',
  voice: 'Male'
};


// --- DOM Elements ---
const cardsContainer = document.querySelector('.cards');
const experiencePanel = document.getElementById('experience');
const previewTitle = document.getElementById('previewTitle');
const audioSection = document.getElementById('audioSection');
const audioPlayer = document.getElementById('audioPlayer');
const transcriptText = document.getElementById('scriptText');
const generateButton = document.getElementById('generateBtn');
const languageSelect = document.getElementById('selectLanguage');
const closeButton = document.getElementById('closeExperience');

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchBtn');

const searchPreviewCard = document.getElementById('searchPreviewCard');
const searchPreviewImage = document.getElementById('searchPreviewImage');
const searchPreviewTitle = document.getElementById('searchPreviewTitle');

const transcriptToggle = document.getElementById('transcriptToggle');
const transcriptContent = document.getElementById('transcriptContent');
const transcriptArrow = document.getElementById('transcriptArrow');


// --- Helper Function ---

function formatPlaceName(place) {
  return place
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => {
      if (!word) return word;

      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}


// --- Destination Selection ---

function selectDestination(place, image, clickedCard = null) {

  state.place = place;
  state.image = image;

  // Update experience title
  previewTitle.textContent = place;

  cardsContainer.classList.add('faded');

  // Reset active cards
  document
    .querySelectorAll('.place-card')
    .forEach(card => card.classList.remove('active'));

  // Hide search result initially
  searchPreviewCard.classList.add('hidden');


  // Handle normal card or searched destination
  if (clickedCard) {

    clickedCard.classList.add('active');

  } else {

    // Set searched destination image
    searchPreviewImage.src = image;
    searchPreviewImage.alt = `${place} tourist destination`;

    // Set searched destination title
    searchPreviewTitle.textContent = place;

    // Show search result
    searchPreviewCard.classList.remove('hidden');
    searchPreviewCard.classList.add('active');
  }


  // Reset audio section
  audioSection.classList.add('hidden');

  audioPlayer.src = '';

  transcriptText.textContent = '';

  generateButton.textContent = 'Generate Audio Guide';

  generateButton.disabled = false;


  // Show experience panel
  experiencePanel.classList.remove('hidden');

  setTimeout(() => {
    experiencePanel.classList.add('visible');
  }, 10);
}


// --- Deselect Destination ---

function deselectDestination() {

  experiencePanel.classList.remove('visible');

  setTimeout(() => {

    experiencePanel.classList.add('hidden');

    cardsContainer.classList.remove('faded');

    searchPreviewCard.classList.add('hidden');

    document
      .querySelectorAll('.place-card')
      .forEach(card => card.classList.remove('active'));

  }, 300);
}


// --- Close Button ---

closeButton.addEventListener('click', deselectDestination);


// --- Existing Destination Cards ---

document
  .querySelectorAll('.place-card:not(.search-preview-card)')
  .forEach(card => {

    card.addEventListener('click', () => {

      selectDestination(
        card.dataset.place,
        card.dataset.image,
        card
      );

    });

  });


// =====================================================
// SEARCH DESTINATION
// =====================================================

searchButton.addEventListener('click', async () => {

  const rawPlace = searchInput.value.trim();

  // Empty search
  if (!rawPlace) {

    alert('Please enter a destination.');

    searchInput.focus();

    return;
  }


  // Format destination name
  const place = formatPlaceName(rawPlace);


  // Loading state
  searchButton.disabled = true;

  searchButton.textContent = 'Searching...';


  try {

    // Wikipedia API
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(place)}&gsrnamespace=0&gsrlimit=1&prop=pageimages|info&piprop=thumbnail&pithumbsize=1000&inprop=url&format=json&origin=*`
    );


    if (!response.ok) {

      throw new Error('Wikipedia request failed');

    }


    const data = await response.json();

    const pages = data.query?.pages;

    const page = pages
      ? Object.values(pages)[0]
      : null;


    // Get image
    let image = '';

    if (page?.thumbnail?.source) {

      image = page.thumbnail.source;

    }


    // Better fallback
    if (!image) {

      image =
        `https://placehold.co/1000x650/f5f5f5/555555?text=${encodeURIComponent(place)}`;

    }


    // Open destination
    selectDestination(place, image);


  } catch (error) {

    console.error('Search error:', error);

    alert(
      'Unable to find this destination. Please check the spelling and try again.'
    );

  } finally {

    searchButton.disabled = false;

    searchButton.textContent = 'Explore';

  }

});


// =====================================================
// SEARCH USING ENTER KEY
// =====================================================

searchInput.addEventListener('keydown', (event) => {

  if (event.key === 'Enter') {

    event.preventDefault();

    searchButton.click();

  }

});


// =====================================================
// LENGTH / HISTORY TYPE
// =====================================================

const lengthButtons =
  document.querySelectorAll('[data-group="length"] button');

lengthButtons.forEach(btn => {

  btn.addEventListener('click', () => {

    lengthButtons.forEach(b =>
      b.classList.remove('active')
    );

    btn.classList.add('active');

    state.length = btn.dataset.value;

  });

});


// =====================================================
// VOICE GENDER
// =====================================================

const voiceButtons =
  document.querySelectorAll('[data-group="voice"] button');

voiceButtons.forEach(btn => {

  btn.addEventListener('click', () => {

    voiceButtons.forEach(b =>
      b.classList.remove('active')
    );

    btn.classList.add('active');

    state.voice = btn.dataset.value;

  });

});


// =====================================================
// GENERATE AUDIO GUIDE
// =====================================================

const GENERATE_AUDIO_GUIDE_API_URL =
  "https://ai-travel-guide-cra3.onrender.com/generate-audio-guide";


generateButton.addEventListener('click', async () => {

  generateButton.disabled = true;

  generateButton.textContent =
    '⏳ Generating Audio...';


  try {

    const selectedLanguage =
      languageSelect.value;

    const selectedVoice =
      state.voice;


    const response = await fetch(
      GENERATE_AUDIO_GUIDE_API_URL,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({

          place: state.place,

          answerType: state.length,

          language: selectedLanguage,

          voiceId:
            VOICES[selectedLanguage][selectedVoice],

          locale:
            LOCALES[selectedLanguage]

        })
      }
    );


    if (!response.ok) {

      throw new Error(
        `Generation failed: ${response.status}`
      );

    }


    const data = await response.json();


    // Display transcript
    transcriptText.textContent =
      data.description || 'No description available.';


    audioSection.classList.remove('hidden');


    // Display audio
    if (data.audioBase64) {

      audioPlayer.src =
        `data:audio/mp3;base64,${data.audioBase64}`;

      audioPlayer.load();

      audioPlayer.classList.remove('hidden');

      generateButton.textContent =
        'Listen to Audio';

    } else {

      audioPlayer.classList.add('hidden');

      generateButton.textContent =
        'Audio Not Available';

    }


  } catch (err) {

    console.error('Audio generation error:', err);

    alert(
      'Audio generation failed. Please try again.'
    );

    generateButton.textContent =
      'Generate Audio Guide';

    generateButton.disabled = false;

  }

});


// =====================================================
// TRANSCRIPT TOGGLE
// =====================================================

transcriptToggle.addEventListener('click', () => {

  transcriptContent.classList.toggle('hidden');

  transcriptArrow.classList.toggle('rotate-180');

});