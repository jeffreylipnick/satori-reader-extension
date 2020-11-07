console.log("Satori Reader Add Kanji Extension loaded.")

// get handle of target element
const tooltipContents = document.getElementsByClassName("tooltip-content");
// naive assumption that only one tooltip is loaded on the page
const tooltipContent = tooltipContents[0]; 

function markKanjiAsKnown() {
    const noteBodies = document.getElementsByClassName("note-body");
    // naive assumption that only one note-body exists on the page
    const noteBody = noteBodies[0];
    
    // Not sure where these class names are coming from
    const words = document.querySelectorAll(".note-body .wp");
    // Assuming that the first element under .node-body is the one we want
    const word = words[0];
    // The api filters out duplicates and kana so we can just
    // add all of the characters
    let newCharacters = "";
    for (var i = 0; i < word.children.length; i++) {
        newCharacters += word.children[i].innerText;
    }
    console.log("Characters to add: " + newCharacters);

    async function getKnownKanji() {
        const response = await fetch("https://www.satorireader.com/api/preferences/known-kanji/all");
        const kanji = await response.json();
        return kanji.result;
    }

    async function saveCustomKanji(characters) {
        console.log("Saving characters " + characters);
        const response = await fetch("https://www.satorireader.com/api/preferences/custom-known-kanji", {
            method: 'PUT',
            body: JSON.stringify({"known": characters}),
            headers: {"Content-Type": "application/json"}
        });
        const result = await response.json();
        return result;
    }
      
    getKnownKanji().then(kanji => {
        const characters = kanji + newCharacters;
        saveCustomKanji(characters).then(result => {
            const buttonText = document.getElementById("mark-kanji-as-known-text");
            const button = document.getElementById("mark-kanji-as-known");
            button.style.transition = "all 0.5s";
            if (result.success) {
                buttonText.textContent = "Saved!";
                button.style.background = "#2BB756";
                button.style.border = "1px solid #2BB756";
            } else {
                buttonText.textContent = "Error :(";
                button.style.background = "#e85845";
                button.style.border = "1px solid #e85845";
            }
        });
    });
};

// callback for mutation observer
const logMutations = function (mutations) {
  mutations.forEach(function (mutation) {
    const noteBodies = document.getElementsByClassName("note-body");
    // naive assumption that only one note-body exists on the page
    const noteBody = noteBodies[0];
    const addKanji = document.createElement("span");
    addKanji.className = "tooltip-button tooltip-button-active";
    addKanji.id = "mark-kanji-as-known";
    addKanji.onclick = markKanjiAsKnown;

    const icon = document.createElement("span");
    icon.className = "tooltip-icon tooltip-icon-add";
    addKanji.appendChild(icon);

    const buttonText = document.createElement("span");
    buttonText.className = "text";
    buttonText.id = "mark-kanji-as-known-text";
    buttonText.textContent = "Mark as known";
    addKanji.appendChild(buttonText);

    noteBody.appendChild(addKanji);
  });
};

// create an observer instance
const observer = new MutationObserver(logMutations);

if (tooltipContent) {
    observer.observe(tooltipContent, { childList: true });
}



