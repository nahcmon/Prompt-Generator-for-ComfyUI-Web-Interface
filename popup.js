// DOM Elements
const lmStudioUrlInput = document.getElementById('lmStudioUrl');
const modelSelect = document.getElementById('modelSelect');
const refreshModelsBtn = document.getElementById('refreshModels');
const saveConfigBtn = document.getElementById('saveConfig');
const configStatus = document.getElementById('configStatus');
const promptTypeSelect = document.getElementById('promptType');
const guidedSection = document.getElementById('guidedSection');
const userGuidanceInput = document.getElementById('userGuidance');
const promptStyleSelect = document.getElementById('promptStyle');
const generatePromptBtn = document.getElementById('generatePrompt');
const generateStatus = document.getElementById('generateStatus');
const promptPreview = document.getElementById('promptPreview');
const positivePromptDiv = document.getElementById('positivePrompt');
const negativePromptContainer = document.getElementById('negativePromptContainer');
const negativePromptDiv = document.getElementById('negativePrompt');

// Load saved configuration on popup open
document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();
});

// Load configuration from storage
async function loadConfig() {
  try {
    const result = await chrome.storage.sync.get([
      'lmStudioUrl',
      'selectedModel',
      'promptType',
      'promptStyle'
    ]);

    if (result.lmStudioUrl) {
      lmStudioUrlInput.value = result.lmStudioUrl;
      await refreshModels(result.selectedModel);
    } else {
      lmStudioUrlInput.value = 'http://localhost:1234/v1';
    }

    if (result.promptType) {
      promptTypeSelect.value = result.promptType;
      toggleGuidedSection();
    }

    if (result.promptStyle) {
      promptStyleSelect.value = result.promptStyle;
    }
  } catch (error) {
    console.error('Error loading config:', error);
  }
}

// Save configuration
saveConfigBtn.addEventListener('click', async () => {
  const lmStudioUrl = lmStudioUrlInput.value.trim();
  const selectedModel = modelSelect.value;

  if (!lmStudioUrl) {
    showStatus(configStatus, 'Please enter LM Studio URL', 'error');
    return;
  }

  if (!selectedModel) {
    showStatus(configStatus, 'Please select a model', 'error');
    return;
  }

  try {
    await chrome.storage.sync.set({
      lmStudioUrl,
      selectedModel,
      promptType: promptTypeSelect.value,
      promptStyle: promptStyleSelect.value
    });

    showStatus(configStatus, 'Configuration saved successfully!', 'success');
  } catch (error) {
    showStatus(configStatus, 'Error saving configuration: ' + error.message, 'error');
  }
});

// Refresh models list
refreshModelsBtn.addEventListener('click', async () => {
  await refreshModels();
});

async function refreshModels(selectedModelId = null) {
  const lmStudioUrl = lmStudioUrlInput.value.trim();

  if (!lmStudioUrl) {
    showStatus(configStatus, 'Please enter LM Studio URL first', 'error');
    return;
  }

  refreshModelsBtn.disabled = true;
  refreshModelsBtn.textContent = 'Loading...';

  try {
    const response = await fetch(`${lmStudioUrl}/models`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    modelSelect.innerHTML = '<option value="">Select a model...</option>';

    if (data.data && data.data.length > 0) {
      data.data.forEach(model => {
        const option = document.createElement('option');
        option.value = model.id;
        option.textContent = model.id;
        modelSelect.appendChild(option);
      });

      if (selectedModelId) {
        modelSelect.value = selectedModelId;
      }

      showStatus(configStatus, `Found ${data.data.length} model(s)`, 'success');
    } else {
      showStatus(configStatus, 'No models found', 'error');
    }
  } catch (error) {
    showStatus(configStatus, 'Error fetching models: ' + error.message, 'error');
  } finally {
    refreshModelsBtn.disabled = false;
    refreshModelsBtn.textContent = 'Refresh Models';
  }
}

// Toggle guided section visibility
promptTypeSelect.addEventListener('change', toggleGuidedSection);

function toggleGuidedSection() {
  if (promptTypeSelect.value === 'guided') {
    guidedSection.style.display = 'block';
  } else {
    guidedSection.style.display = 'none';
  }
}

// Generate prompt
generatePromptBtn.addEventListener('click', async () => {
  const config = await chrome.storage.sync.get(['lmStudioUrl', 'selectedModel']);

  if (!config.lmStudioUrl || !config.selectedModel) {
    showStatus(generateStatus, 'Please configure LM Studio URL and model first', 'error');
    return;
  }

  generatePromptBtn.disabled = true;
  generatePromptBtn.textContent = 'Generating...';
  showStatus(generateStatus, 'Generating prompt...', 'info');

  try {
    const promptType = promptTypeSelect.value;
    const promptStyle = promptStyleSelect.value;
    const userGuidance = userGuidanceInput.value.trim();

    // Send message to background script to generate prompt
    const response = await chrome.runtime.sendMessage({
      action: 'generatePrompt',
      data: {
        lmStudioUrl: config.lmStudioUrl,
        model: config.selectedModel,
        promptType,
        promptStyle,
        userGuidance
      }
    });

    if (response.success) {
      // Display the generated prompts
      positivePromptDiv.textContent = response.positivePrompt;
      promptPreview.style.display = 'block';

      if (response.negativePrompt) {
        negativePromptDiv.textContent = response.negativePrompt;
        negativePromptContainer.style.display = 'block';
      } else {
        negativePromptContainer.style.display = 'none';
      }

      // Send prompts to content script to insert into ComfyUI
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      await chrome.tabs.sendMessage(tab.id, {
        action: 'insertPrompt',
        positivePrompt: response.positivePrompt,
        negativePrompt: response.negativePrompt
      });

      showStatus(generateStatus, 'Prompt generated and inserted!', 'success');
    } else {
      showStatus(generateStatus, 'Error: ' + response.error, 'error');
    }
  } catch (error) {
    showStatus(generateStatus, 'Error generating prompt: ' + error.message, 'error');
  } finally {
    generatePromptBtn.disabled = false;
    generatePromptBtn.textContent = 'Generate & Insert Prompt';
  }
});

// Helper function to show status messages
function showStatus(element, message, type) {
  element.textContent = message;
  element.className = 'status ' + type;
  element.style.display = 'block';

  if (type === 'success') {
    setTimeout(() => {
      element.style.display = 'none';
    }, 3000);
  }
}
