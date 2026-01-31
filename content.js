// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'insertPrompt') {
    insertPromptIntoComfyUI(request.positivePrompt, request.negativePrompt);
    sendResponse({ success: true });
  }
  return true;
});

// Insert prompt into ComfyUI fields
function insertPromptIntoComfyUI(positivePrompt, negativePrompt) {
  // Find prompt fields in ComfyUI
  const fields = findPromptFields();

  if (fields.positive) {
    setFieldValue(fields.positive, positivePrompt);
    console.log('ComfyUI Prompt Generator: Inserted positive prompt');
  } else {
    console.warn('ComfyUI Prompt Generator: Could not find positive prompt field');
    showNotification('Could not find positive prompt field. Please insert manually.', 'warning');
    return;
  }

  if (fields.negative && negativePrompt) {
    setFieldValue(fields.negative, negativePrompt);
    console.log('ComfyUI Prompt Generator: Inserted negative prompt');
  } else if (negativePrompt) {
    console.warn('ComfyUI Prompt Generator: Could not find negative prompt field');
  }

  showNotification('Prompts inserted successfully!', 'success');
}

// Find prompt fields in the page
function findPromptFields() {
  const fields = {
    positive: null,
    negative: null
  };

  // Strategy 1: Look for textareas with specific labels or names
  const textareas = document.querySelectorAll('textarea');

  textareas.forEach(textarea => {
    const label = findLabelForField(textarea);
    const placeholder = textarea.placeholder?.toLowerCase() || '';
    const name = textarea.name?.toLowerCase() || '';
    const id = textarea.id?.toLowerCase() || '';
    const ariaLabel = textarea.getAttribute('aria-label')?.toLowerCase() || '';

    const fieldText = `${label} ${placeholder} ${name} ${id} ${ariaLabel}`.toLowerCase();

    // Check for positive prompt field
    if (!fields.positive) {
      if (
        fieldText.includes('positive') ||
        fieldText.includes('prompt') && !fieldText.includes('negative') ||
        fieldText.includes('text') && fieldText.includes('positive')
      ) {
        fields.positive = textarea;
      }
    }

    // Check for negative prompt field
    if (!fields.negative) {
      if (
        fieldText.includes('negative') ||
        fieldText.includes('negative prompt')
      ) {
        fields.negative = textarea;
      }
    }
  });

  // Strategy 2: Look for input fields if textareas not found
  if (!fields.positive) {
    const inputs = document.querySelectorAll('input[type="text"]');

    inputs.forEach(input => {
      const label = findLabelForField(input);
      const placeholder = input.placeholder?.toLowerCase() || '';
      const name = input.name?.toLowerCase() || '';
      const id = input.id?.toLowerCase() || '';
      const ariaLabel = input.getAttribute('aria-label')?.toLowerCase() || '';

      const fieldText = `${label} ${placeholder} ${name} ${id} ${ariaLabel}`.toLowerCase();

      if (!fields.positive) {
        if (
          fieldText.includes('positive') ||
          fieldText.includes('prompt') && !fieldText.includes('negative')
        ) {
          fields.positive = input;
        }
      }

      if (!fields.negative) {
        if (fieldText.includes('negative')) {
          fields.negative = input;
        }
      }
    });
  }

  // Strategy 3: ComfyUI specific - look for widgets in the workflow
  if (!fields.positive || !fields.negative) {
    const comfyFields = findComfyUIPromptFields();
    if (comfyFields.positive) fields.positive = comfyFields.positive;
    if (comfyFields.negative) fields.negative = comfyFields.negative;
  }

  return fields;
}

// Find ComfyUI specific prompt fields
function findComfyUIPromptFields() {
  const fields = {
    positive: null,
    negative: null
  };

  // ComfyUI uses a canvas-based interface, but also has widget inputs
  // Look for textareas that are part of the ComfyUI widget system
  const allTextareas = document.querySelectorAll('textarea');

  // Try to find fields by their position and context
  allTextareas.forEach((textarea, index) => {
    // Check parent elements for clues
    let parent = textarea.parentElement;
    let depth = 0;
    let context = '';

    while (parent && depth < 5) {
      const className = parent.className || '';
      const textContent = parent.textContent?.toLowerCase() || '';

      context += ` ${className} ${textContent}`;
      parent = parent.parentElement;
      depth++;
    }

    context = context.toLowerCase();

    if (!fields.positive && (
      context.includes('positive') ||
      index === 0 && allTextareas.length >= 2
    )) {
      fields.positive = textarea;
    }

    if (!fields.negative && (
      context.includes('negative') ||
      index === 1 && allTextareas.length >= 2
    )) {
      fields.negative = textarea;
    }
  });

  return fields;
}

// Find label for a field
function findLabelForField(field) {
  // Try to find associated label
  if (field.id) {
    const label = document.querySelector(`label[for="${field.id}"]`);
    if (label) return label.textContent.toLowerCase();
  }

  // Look for parent label
  let parent = field.parentElement;
  let depth = 0;

  while (parent && depth < 3) {
    if (parent.tagName === 'LABEL') {
      return parent.textContent.toLowerCase();
    }

    const label = parent.querySelector('label');
    if (label) {
      return label.textContent.toLowerCase();
    }

    parent = parent.parentElement;
    depth++;
  }

  // Look for nearby text
  const previousSibling = field.previousElementSibling;
  if (previousSibling) {
    return previousSibling.textContent?.toLowerCase() || '';
  }

  return '';
}

// Set field value and trigger events
function setFieldValue(field, value) {
  if (!field) return;

  // Set the value
  field.value = value;
  field.textContent = value;

  // Trigger events to notify the application of the change
  const events = [
    new Event('input', { bubbles: true }),
    new Event('change', { bubbles: true }),
    new Event('blur', { bubbles: true }),
    new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }),
    new KeyboardEvent('keyup', { bubbles: true, key: 'Enter' })
  ];

  events.forEach(event => field.dispatchEvent(event));

  // Focus and blur to ensure the field is updated
  field.focus();
  setTimeout(() => field.blur(), 100);
}

// Show notification to user
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: white;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease-out;
  `;

  // Set color based on type
  if (type === 'success') {
    notification.style.backgroundColor = '#4CAF50';
  } else if (type === 'warning') {
    notification.style.backgroundColor = '#ff9800';
  } else if (type === 'error') {
    notification.style.backgroundColor = '#f44336';
  } else {
    notification.style.backgroundColor = '#2196F3';
  }

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Add to page
  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 300);
  }, 3000);
}

// Log that content script is loaded
console.log('ComfyUI Prompt Generator: Content script loaded');
