var sendButton = document.getElementById('send');
var userInputField = document.getElementById('userInput');
var chatbox = document.getElementById('chatbox');
// Rather fetch this from history.json in the same
var chatHistory; // Declare chatHistory without initializing

// Immediately fetch the chat history from history.json and store it in chatHistory
(async function fetchChatHistory() {
  try {
    const response = await fetch('history.json');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    chatHistory = await response.json(); // This will now contain the data from history.json
  } catch (error) {
    console.error('Error loading chat history:', error);
  }
})();

// Function to handle sending messages
function sendMessage() {
  var userInput = userInputField.value.trim();
  if (userInput === '') return;

  // Create and display the user message immediately
  var userMessage = document.createElement('div');
  userMessage.textContent = userInput;
  userMessage.classList.add('message', 'userMessage');
  chatbox.appendChild(userMessage);
  chatbox.scrollTop = chatbox.scrollHeight; // Auto-scroll to the latest message

  // Clear input field after message is sent
  userInputField.value = '';
  adjustHeight();

  // Update chat history with user message
  chatHistory.push({
    "role": "user",
    "content": userInput
  });

  // Send the updated chat history to the assistant
  var data = JSON.stringify({
    "model": "gpt-3.5-turbo",
    "messages": chatHistory,
    "temperature": 1,
    "max_tokens": 4096,
    "top_p": 1,
    "frequency_penalty": 2,
    "presence_penalty": 0
  });
  const base64ApiKey = 'c2stZ3k3YXh0Q2lPcXJtQVhBcjYxSXhUM0JsYmtGSnlsWmxjU09DclNpdE9udGlwY1FD';

  // Function to decode Base64 encoded API Key
  const decodeApiKey = (base64Str) => atob(base64Str);
  const apiKey = decodeApiKey(base64ApiKey);
  console.log("calling model: ", data.model);
  fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      // Using the decoded API key securely
      'Authorization': `Bearer ${apiKey}`, // Correctly use template literals here
      'Content-Type': 'application/json'
    },
    body: data
  })
    .then(response => response.json())
    .then(data => {
      // Assuming the response includes the assistant's message in a similar format
      var assistantMessageContent = data.choices[0].message.content;

      // Create bot message bubble
      var botMessage = document.createElement('div');
      botMessage.textContent = assistantMessageContent;
      botMessage.classList.add('message', 'botMessage');
      chatbox.appendChild(botMessage);

      // Update chat history with bot message
      chatHistory.push({
        "role": "assistant",
        "content": assistantMessageContent,
      });

      // Auto-scroll to the latest message
      chatbox.scrollTop = chatbox.scrollHeight;
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

// Send message on button click
sendButton.addEventListener('click', sendMessage);

// Send message on Enter key
userInputField.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

var sidePanel = document.getElementById('sidePanel');
var togglePanelBtn = document.getElementById('togglePanelBtn');

togglePanelBtn.addEventListener('click', function () {
  var panelIsVisible = sidePanel.style.left === '0px';
  var chatContainer = document.getElementById('chatContainer'); // Ensure this is the correct ID for your chat container

  if (panelIsVisible) {
    // If the panel is visible, hide it and reset the chat container's margin
    sidePanel.style.left = '-250px';
    chatContainer.style.marginLeft = '0';
  } else {
    // If the panel is hidden, show it and move the chat container to the left
    sidePanel.style.left = '0px';
    chatContainer.style.marginLeft = '250px'; // Adjust this value to match the width of your side panel
  }

  // Toggle the 'open' class on the button for styling
  togglePanelBtn.classList.toggle('open', !panelIsVisible);
});

const userInput = document.getElementById('userInput');

// Function to adjust the height of textarea
function adjustHeight() {
  const singleLineHeight = 10; // This should be the line height of one line of text in the textarea
  userInput.style.height = 'auto'; // Temporarily make height auto to calculate the scroll height
  const currentScrollHeight = userInput.scrollHeight;

  if (currentScrollHeight > singleLineHeight) {
    userInput.style.height = `${currentScrollHeight}px`;
  } else {
    userInput.style.height = `${singleLineHeight}px`;
  }
}

// Event listener for input
userInput.addEventListener('input', adjustHeight);

// Set initial size to fit one line
userInput.style.height = '20px'; // This should be the line height of one line of text in the textarea

// Call adjustHeight to check if the content is already too much when the page loads
adjustHeight();

userInput.addEventListener('keyup', function (e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    // Prevent default Enter behavior (new line) if not holding Shift
    e.preventDefault();
    // Trigger send message logic here
  }
});
