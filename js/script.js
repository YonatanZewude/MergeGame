const itemDataObj = {
  "🥥": ["🫐", "🍓", "🍏", "🍌", "🥭", "🍍", "🍉", "🍈", "🍹"],
};

const scoreValues = {
  "🫐": 1,
  "🍓": 2,
  "🍏": 3,
  "🍌": 4,
  "🥭": 5,
  "🍍": 6,
  "🍉": 7,
  "🍈": 8,
  "🍹": 9,
};

const emojiSequence = itemDataObj["🥥"];
const totalCells = 25;
const maxMoves = 14;

let board = document.getElementById("board");
let score = 0;
let moves = maxMoves;
let draggedElement = null;
let originalContent = "";
let originalCell = null;
let currentSequenceIndex = 0;
let touchStartX, touchStartY, touchElement, placeholder;

//skapa brädet med 25 celler
function createBoard() {
  board.innerHTML = "";
  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.setAttribute("draggable", true);
    cell.textContent = emojiSequence[i % emojiSequence.length];

    cell.addEventListener("dragstart", handleDragStart);
    cell.addEventListener("dragover", handleDragOver);
    cell.addEventListener("drop", handleDrop);
    cell.addEventListener("dragend", handleDragEnd);

    cell.addEventListener("touchstart", handleTouchStart);
    cell.addEventListener("touchmove", handleTouchMove);
    cell.addEventListener("touchend", handleTouchEnd);

    board.appendChild(cell);
  }
}

// kontrollera om spelet är över
function checkGameOver() {
  console.log(`Checking game over: Score = ${score}, Moves = ${moves}`); // Felsökning: Visa aktuell poäng och antal drag
  if (score >= 100) {
    console.log("Game won, showing modal");
    showModal("You Win!");
  } else if (moves <= 0) {
    console.log("Game lost");
    showModal("Game Over!  Try again");
  }
}

// Visa modal med ett meddelande
function showModal(message) {
  console.log("Showing modal with message:", message);
  const modal = document.getElementById("gameModal");
  const modalMessage = document.getElementById("modalMessage");
  modalMessage.textContent = message;
  modal.style.display = "block";
}

function hideModal() {
  console.log("Hiding modal and reloading page");
  const modal = document.getElementById("gameModal");
  modal.style.display = "none";
  location.reload();
}

// Startar drag-eventet
function handleDragStart(event) {
  if (event.target.classList.contains("locked")) return;
  draggedElement = event.target;
  originalContent = draggedElement.textContent;
  originalCell = draggedElement;
  event.dataTransfer.setData("text/plain", draggedElement.textContent);
  draggedElement.classList.add("dragging");
}

// Förhindra standardbeteende för att tillåta drop
function handleDragOver(event) {
  event.preventDefault();
}

function handleDrop(event) {
  event.preventDefault();
  const draggedEmoji = event.dataTransfer.getData("text/plain");
  const targetEmoji = event.target.textContent;

  // Kontrollera matchar och inte är samma cell
  if (draggedEmoji === targetEmoji && draggedElement !== event.target) {
    incrementScore(draggedEmoji);

    moves--;
    document.getElementById("moves").textContent = moves;

    // Kontrollera om matchningen är den sista emojin "🍹"
    if (draggedEmoji === "🍹") {
      const randomEmojis = getRandomTwoEmojis();
      originalCell.textContent = randomEmojis[0];
      event.target.textContent = randomEmojis[1];
    } else {
      const nextEmojis = getNextTwoEmojis(draggedEmoji);
      if (nextEmojis) {
        originalCell.textContent = nextEmojis[0];
        event.target.textContent = nextEmojis[1];
      }
    }

    checkGameOver();
  } else {
    returnEmojiToOriginalCell();
  }
}

function handleDragEnd(event) {
  draggedElement.classList.remove("dragging");
  draggedElement = null;
  originalContent = "";
  originalCell = null;
}

// touch-start händelsen
function handleTouchStart(event) {
  if (event.target.classList.contains("locked")) return;
  const touch = event.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  touchElement = event.target;
  originalContent = touchElement.textContent;
  originalCell = touchElement;

  touchElement.style.transform = "scale(1.5)";
  touchElement.style.transition = "transform 0.2s ease";

  // Beräkna storleken på cellen för att kunna centrera frukten korrekt
  const rect = touchElement.getBoundingClientRect();
  const offsetX = rect.width / 2;
  const offsetY = rect.height / 2;

  placeholder = document.createElement("div");
  placeholder.className = "placeholder";
  placeholder.textContent = originalContent;
  placeholder.style.position = "absolute";
  placeholder.style.left = `${touch.clientX - offsetX}px`; // Centrera X
  placeholder.style.top = `${touch.clientY - offsetY}px`; // Centrera Y
  placeholder.style.pointerEvents = "none";
  placeholder.style.fontSize = "3rem";
  document.body.appendChild(placeholder);

  touchElement.classList.add("dragging");
}

// touch-move händelsen
function handleTouchMove(event) {
  event.preventDefault();
  if (!touchElement) return;
  const touch = event.touches[0];

  // Använd offset för att centrera frukten under fingret
  const rect = touchElement.getBoundingClientRect();
  const offsetX = rect.width / 2;
  const offsetY = rect.height / 2;

  placeholder.style.left = `${touch.clientX - offsetX}px`; // Centrera X
  placeholder.style.top = `${touch.clientY - offsetY}px`; // Centrera Y
}

//touch-end händelsen
function handleTouchEnd(event) {
  if (!touchElement) return;
  const touch = event.changedTouches[0];
  const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

  if (
    dropTarget &&
    dropTarget.classList.contains("cell") &&
    dropTarget !== touchElement
  ) {
    const draggedEmoji = touchElement.textContent;
    const targetEmoji = dropTarget.textContent;

    if (draggedEmoji === targetEmoji) {
      incrementScore(draggedEmoji);
      moves--;
      document.getElementById("moves").textContent = moves;

      if (draggedEmoji === "🍹") {
        const randomEmojis = getRandomTwoEmojis();
        originalCell.textContent = randomEmojis[0];
        dropTarget.textContent = randomEmojis[1];
      } else {
        const nextEmojis = getNextTwoEmojis(draggedEmoji);
        if (nextEmojis) {
          originalCell.textContent = nextEmojis[0];
          dropTarget.textContent = nextEmojis[1];
        }
      }
      checkGameOver();
    } else {
      returnEmojiToOriginalCell();
    }
  } else {
    returnEmojiToOriginalCell();
  }

  touchElement.style.transform = "scale(1)";
  touchElement.style.transition = "transform 0.2s ease";

  touchElement.classList.remove("dragging");
  touchElement = null;

  document.body.removeChild(placeholder);
}

// Återställ emoji om det inte är en matchning
function returnEmojiToOriginalCell() {
  originalCell.textContent = originalContent;
}

function getNextTwoEmojis(matchedEmoji) {
  const matchedIndex = emojiSequence.indexOf(matchedEmoji);
  const nextEmoji1 = emojiSequence[(matchedIndex + 1) % emojiSequence.length];
  const nextEmoji2 = emojiSequence[(matchedIndex + 2) % emojiSequence.length];
  return [nextEmoji1, nextEmoji2];
}

// Hämta två slumpmässiga emojis från sekvensen
function getRandomTwoEmojis() {
  const randomIndex1 = Math.floor(Math.random() * emojiSequence.length);
  let randomIndex2;
  do {
    randomIndex2 = Math.floor(Math.random() * emojiSequence.length);
  } while (randomIndex2 === randomIndex1);
  return [emojiSequence[randomIndex1], emojiSequence[randomIndex2]];
}

// Öka poängen baserat på vilken emoji som matchades
function incrementScore(matchedEmoji) {
  score += scoreValues[matchedEmoji];
  document.getElementById("score").textContent = score;
  const progressBar = document.getElementById("progress-bar");
  let progress = (score / 100) * 100;
  progressBar.style.width = progress + "%";

  console.log(`Score updated: ${score}`);

  if (score >= 100) {
    console.log("Player won, showing modal...");
    showModal("You Win!");
    return;
  }
}

function resetGame() {
  hideModal();
  score = 0;
  moves = maxMoves;
  document.getElementById("score").textContent = score;
  document.getElementById("moves").textContent = moves;
  document.getElementById("progress-bar").style.width = "0%";
  createBoard();
}

document.getElementById("resetButton").addEventListener("click", resetGame);
createBoard();
document.getElementById("modalButton").addEventListener("click", hideModal);
document.querySelector(".modal .close").addEventListener("click", hideModal);
window.addEventListener("click", function (event) {
  const modal = document.getElementById("gameModal");
  if (event.target === modal) {
    hideModal();
  }
});
