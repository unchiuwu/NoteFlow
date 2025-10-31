import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Import the Firebase config from the firebaseconfig.js file
import { firebaseConfig } from './firebaseconfig.js';

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM elements
const noteInput = document.getElementById("noteInput");
const saveBtn = document.getElementById("saveBtn");
const notesList = document.getElementById("notesList");
const themeToggleButton = document.getElementById("themeToggle");

// Reference to notes collection
const notesCollection = collection(db, "notes");
const notesQuery = query(notesCollection, orderBy("timestamp", "desc"));

// Load theme preference from localStorage and apply it
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
}

// Toggle dark/light mode
themeToggleButton.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  
  // Save the theme preference in localStorage
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
});

// Save note
saveBtn.addEventListener("click", async () => {
  const text = noteInput.value.trim();
  if (!text) return;

  try {
    await addDoc(notesCollection, {
      text,
      timestamp: serverTimestamp()
    });
    noteInput.value = "";
  } catch (err) {
    console.error("Error adding note:", err);
  }
});

// Listen for notes updates
onSnapshot(notesQuery, snapshot => {
  notesList.innerHTML = "";

  snapshot.forEach(docSnap => {
    const { text, timestamp } = docSnap.data();

    const li = document.createElement("li");

    const spanText = document.createElement("span");
    spanText.className = "note-text";
    spanText.textContent = text;

    const spanTime = document.createElement("span");
    spanTime.className = "note-timestamp";
    spanTime.textContent = timestamp ? new Date(timestamp.seconds * 1000).toLocaleString() : "";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", async () => {
      await deleteDoc(doc(db, "notes", docSnap.id));
    });

    li.appendChild(spanText);
    li.appendChild(spanTime);
    li.appendChild(deleteBtn);

    notesList.appendChild(li);
  });
});
