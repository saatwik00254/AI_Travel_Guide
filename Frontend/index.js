// ============================================================
// AI TRAVEL GUIDE - FRONTEND JAVASCRIPT
// ============================================================


// =========================
// VOICE CONFIGURATION
// =========================

const VOICES = {
  English: {
    Male: "Matthew",
    Female: "Alicia"
  },

  Hindi: {
    Male: "Aman",
    Female: "Namrita"
  },

  Tamil: {
    Male: "Murali",
    Female: "Iniya"
  },

  Telugu: {
    Male: "Zion",
    Female: "Josie"
  }
};


// =========================
// LANGUAGE CONFIGURATION
// =========================

const LOCALES = {
  English: "en-US",
  Hindi: "hi-IN",
  Tamil: "ta-IN",
  Telugu: "te-IN"
};


// =========================
// APPLICATION STATE
// =========================

const state = {
  place: "",
  image: "",
  length: "Summary",
  voice: "Male"
};


// =========================
// DOM ELEMENTS
// =========================

// Destination cards
const cardsContainer = document.querySelector(".cards");

// Experience section
const experiencePanel = document.getElementById("experience");
const previewTitle = document.getElementById("previewTitle");

// Audio
const audioSection = document.getElementById("audioSection");
const audioPlayer = document.getElementById("audioPlayer");
const transcriptText = document.getElementById("scriptText");

// Generate button
const generateButton = document.getElementById("generateBtn");

// Language
const languageSelect = document.getElementById("selectLanguage");

// Close
const closeButton = document.getElementById("closeExperience");

// Search result card
const searchPreviewCard = document.getElementById("searchPreviewCard");
const searchPreviewImage = document.getElementById("searchPreviewImage");
const searchPreviewTitle = document.getElementById("searchPreviewTitle");

// Transcript
const transcriptToggle = document.getElementById("transcriptToggle");
const transcriptContent = document.getElementById("transcriptContent");
const transcriptArrow = document.getElementById("transcriptArrow");


// Desktop search
const desktopSearchInput = document.getElementById("searchInput");
const desktopSearchButton = document.getElementById("searchBtn");

// Mobile search
const mobileSearchInput = document.getElementById("mobileSearchInput");
const mobileSearchButton = document.getElementById("mobileSearchBtn");


// =========================
// BACKEND API
// =========================

const GENERATE_AUDIO_GUIDE_API_URL =
  "https://ai-travel-guide-cra3.onrender.com/generate-audio-guide";


// ============================================================
// FORMAT DESTINATION NAME
// ============================================================

function formatPlaceName(place) {

  if (!place) {
    return "";
  }

  return place
    .trim()
    .split(/\s+/)
    .map(word => {

      if (word.length === 0) {
        return word;
      }

      return word.charAt(0).toUpperCase() + word.slice(1);

    })
    .join(" ");
}


// ============================================================
// RESET AUDIO SECTION
// ============================================================

function resetAudioSection() {

  audioSection.classList.add("hidden");

  audioPlayer.pause();
  audioPlayer.src = "";
  audioPlayer.load();

  transcriptText.textContent = "";

  transcriptContent.classList.add("hidden");

  transcriptArrow.classList.remove("rotate-180");

  generateButton.textContent = "Generate Audio Guide";
  generateButton.disabled = false;
}


// ============================================================
// SELECT DESTINATION
// ============================================================

function selectDestination(place, image, clickedCard = null) {

  state.place = place;
  state.image = image;

  // Display destination name
  previewTitle.textContent = place;

  // Fade/hide other cards
  cardsContainer.classList.add("faded");


  // Remove active state from every card
  document
    .querySelectorAll(".place-card")
    .forEach(card => {
      card.classList.remove("active");
    });


  // Hide previous search result
  searchPreviewCard.classList.add("hidden");


  // ========================================================
  // NORMAL DESTINATION CARD
  // ========================================================

  if (clickedCard) {

    clickedCard.classList.add("active");

  }


  // ========================================================
  // SEARCH RESULT CARD
  // ========================================================

  else {

    searchPreviewImage.src = image;
    searchPreviewImage.alt = `${place} destination`;

    searchPreviewTitle.textContent = place;

    searchPreviewCard.classList.remove("hidden");
    searchPreviewCard.classList.add("active");
  }


  // Reset previous audio
  resetAudioSection();


  // Show experience panel
  experiencePanel.classList.remove("hidden");

  // Small delay allows CSS animation
  setTimeout(() => {
    experiencePanel.classList.add("visible");
  }, 20);


  // Scroll to experience section on mobile
  setTimeout(() => {

    if (window.innerWidth < 640) {

      experiencePanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    }

  }, 150);
}


// ============================================================
// CLOSE DESTINATION
// ============================================================

function deselectDestination() {

  experiencePanel.classList.remove("visible");

  setTimeout(() => {

    experiencePanel.classList.add("hidden");

    cardsContainer.classList.remove("faded");

    searchPreviewCard.classList.add("hidden");

    document
      .querySelectorAll(".place-card")
      .forEach(card => {
        card.classList.remove("active");
      });

  }, 350);
}


// ============================================================
// DESTINATION CARD CLICK
// ============================================================

document
  .querySelectorAll(".place-card:not(.search-preview-card)")
  .forEach(card => {

    card.addEventListener("click", () => {

      const place = card.dataset.place;
      const image = card.dataset.image;

      selectDestination(place, image, card);

    });

  });


// ============================================================
// SEARCH DESTINATION
// ============================================================

async function searchDestination(inputElement, buttonElement) {

  const rawPlace = inputElement.value.trim();


  // Empty search
  if (!rawPlace) {

    alert("Please enter a destination.");

    inputElement.focus();

    return;
  }


  // Disable button
  buttonElement.disabled = true;

  const originalButtonText = buttonElement.textContent;

  buttonElement.textContent = "Searching...";


  try {

    // Wikipedia API
    const wikipediaURL =
      `https://en.wikipedia.org/w/api.php?` +
      `action=query` +
      `generator=search` +
      `gsrsearch=${encodeURIComponent(rawPlace)}` +
      `gsrnamespace=0` +
      `gsrlimit=1` +
      `prop=pageimages|info` +
      `inprop=url` +
      `piprop=thumbnail` +
      `pithumbsize=1000` +
      `format=json` +
      `origin=*`;


    const response = await fetch(wikipediaURL);


    if (!response.ok) {
      throw new Error("Wikipedia search failed.");
    }


    const data = await response.json();


    const pages = data.query?.pages;


    const page = pages
      ? Object.values(pages)[0]
      : null;


    // ======================================================
    // CHECK IF DESTINATION EXISTS
    // ======================================================

    if (!page) {

      throw new Error(
        "Destination not found. Please try another place."
      );

    }


    // ======================================================
    // GET IMAGE
    // ======================================================

    let image = "";


    if (page.thumbnail?.source) {

      image = page.thumbnail.source;

    }


    // ======================================================
    // FALLBACK IMAGE
    // ======================================================

    if (!image) {

      image =
        `https://placehold.co/1000x650/f5f5f5/555555?text=` +
        encodeURIComponent(rawPlace);

    }


    // ======================================================
    // DESTINATION NAME
    // ======================================================

    let displayPlace = rawPlace;


    if (page.title) {

      displayPlace = page.title;

    }


    displayPlace = formatPlaceName(displayPlace);


    // ======================================================
    // SHOW RESULT
    // ======================================================

    selectDestination(displayPlace, image);


    // Clear both search boxes
    if (desktopSearchInput) {
      desktopSearchInput.value = "";
    }

    if (mobileSearchInput) {
      mobileSearchInput.value = "";
    }


  } catch (error) {

    console.error("Search error:", error);


    alert(
      error.message ||
      "Could not find this destination. Please try again."
    );

  } finally {

    buttonElement.disabled = false;

    buttonElement.textContent = originalButtonText;

  }
}


// ============================================================
// DESKTOP SEARCH BUTTON
// ============================================================

if (desktopSearchButton) {

  desktopSearchButton.addEventListener("click", () => {

    searchDestination(
      desktopSearchInput,
      desktopSearchButton
    );

  });

}


// ============================================================
// MOBILE SEARCH BUTTON
// ============================================================

if (mobileSearchButton) {

  mobileSearchButton.addEventListener("click", () => {

    searchDestination(
      mobileSearchInput,
      mobileSearchButton
    );

  });

}


// ============================================================
// DESKTOP ENTER KEY
// ============================================================

if (desktopSearchInput) {

  desktopSearchInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {

      event.preventDefault();

      desktopSearchButton.click();

    }

  });

}


// ============================================================
// MOBILE ENTER KEY
// ============================================================

if (mobileSearchInput) {

  mobileSearchInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {

      event.preventDefault();

      mobileSearchButton.click();

    }

  });

}


// ============================================================
// DETAIL / LENGTH OPTIONS
// ============================================================

const lengthButtons =
  document.querySelectorAll('[data-group="length"] button');


lengthButtons.forEach(button => {

  button.addEventListener("click", () => {

    // Remove active from all
    lengthButtons.forEach(btn => {
      btn.classList.remove("active");
    });


    // Add active
    button.classList.add("active");


    // Update state
    state.length = button.dataset.value;

  });

});


// ============================================================
// VOICE OPTIONS
// ============================================================

const voiceButtons =
  document.querySelectorAll('[data-group="voice"] button');


voiceButtons.forEach(button => {

  button.addEventListener("click", () => {

    // Remove active
    voiceButtons.forEach(btn => {
      btn.classList.remove("active");
    });


    // Add active
    button.classList.add("active");


    // Update state
    state.voice = button.dataset.value;

  });

});


// ============================================================
// GENERATE AUDIO GUIDE
// ============================================================

generateButton.addEventListener("click", async () => {

  // Disable button
  generateButton.disabled = true;

  generateButton.textContent =
    "⏳ Generating Audio...";


  try {

    // Selected language
    const selectedLanguage =
      languageSelect.value;


    // Selected voice
    const selectedVoice =
      state.voice;


    // ======================================================
    // SEND REQUEST TO YOUR EXISTING BACKEND
    // ======================================================

    const response = await fetch(
      GENERATE_AUDIO_GUIDE_API_URL,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
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


    // Backend error
    if (!response.ok) {

      throw new Error(
        `Server error: ${response.status}`
      );

    }


    const data = await response.json();


    // ======================================================
    // DISPLAY TRANSCRIPT
    // ======================================================

    if (data.description) {

      transcriptText.textContent =
        data.description;

    } else {

      transcriptText.textContent =
        "No transcript was returned.";

    }


    // Show audio section
    audioSection.classList.remove("hidden");


    // ======================================================
    // DISPLAY AUDIO
    // ======================================================

    if (data.audioBase64) {

      audioPlayer.src =
        `data:audio/mp3;base64,${data.audioBase64}`;

      audioPlayer.load();

      audioPlayer.classList.remove("hidden");

      generateButton.textContent =
        "Audio Ready ✓";


    } else {

      audioPlayer.classList.add("hidden");

      generateButton.textContent =
        "Audio Not Available";

    }


    // Scroll to generated result on mobile
    setTimeout(() => {

      if (window.innerWidth < 640) {

        audioSection.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

      }

    }, 200);


  } catch (error) {

    console.error(
      "Audio generation error:",
      error
    );


    alert(
      "Audio generation failed. Please try again."
    );


    generateButton.textContent =
      "Generate Audio Guide";

    generateButton.disabled = false;

  }

});


// ============================================================
// TRANSCRIPT TOGGLE
// ============================================================

if (transcriptToggle) {

  transcriptToggle.addEventListener("click", () => {

    transcriptContent.classList.toggle("hidden");

    transcriptArrow.classList.toggle("rotate-180");

  });

}


// ============================================================
// SEARCH RESULT CARD CLICK
// ============================================================

searchPreviewCard.addEventListener("click", () => {

  if (!state.place) {
    return;
  }


  // Keep the experience panel visible
  experiencePanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

});