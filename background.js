// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generatePrompt') {
    generatePrompt(request.data)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep the message channel open for async response
  }
});

// Generate prompt using LM Studio API
async function generatePrompt(data) {
  const { lmStudioUrl, model, promptType, promptStyle, userGuidance } = data;

  try {
    // Build the system prompt
    const systemPrompt = buildSystemPrompt(promptStyle);

    // Build the user prompt
    const userPrompt = buildUserPrompt(promptType, promptStyle, userGuidance);

    // Call LM Studio API
    const response = await fetch(`${lmStudioUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`LM Studio API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const generatedText = result.choices[0].message.content.trim();

    // Parse the response to extract positive and negative prompts
    const prompts = parseGeneratedPrompts(generatedText);

    return {
      success: true,
      positivePrompt: prompts.positive,
      negativePrompt: prompts.negative
    };
  } catch (error) {
    console.error('Error generating prompt:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Build system prompt based on style
function buildSystemPrompt(style) {
  return `You are an expert at creating detailed, high-quality prompts for AI image generation in ComfyUI/Stable Diffusion.

Your task is to generate prompts that are:
- Detailed and descriptive
- Well-structured with relevant keywords
- Optimized for ${style} style images
- Including both positive and negative prompts

Format your response as follows:
POSITIVE: [detailed positive prompt here]
NEGATIVE: [negative prompt here to avoid unwanted elements]

Keep prompts concise but descriptive. Use comma-separated keywords and phrases.`;
}

// Build user prompt based on type and guidance
function buildUserPrompt(promptType, style, userGuidance) {
  if (promptType === 'guided' && userGuidance) {
    return `Generate a ${style} style image prompt based on this guidance: "${userGuidance}"

Create a detailed positive prompt and a negative prompt to avoid common issues.`;
  } else {
    // Random prompt
    const randomThemes = {
      realistic: [
        'a stunning portrait photograph',
        'a beautiful landscape scene',
        'an architectural masterpiece',
        'a wildlife photograph',
        'a cityscape at golden hour'
      ],
      artistic: [
        'an abstract composition',
        'a impressionist painting',
        'a surreal artistic scene',
        'a watercolor illustration',
        'a mixed media artwork'
      ],
      anime: [
        'an anime character portrait',
        'a magical anime scene',
        'a dynamic action scene',
        'a slice of life anime moment',
        'a fantasy anime landscape'
      ],
      fantasy: [
        'a magical fantasy realm',
        'a mythical creature',
        'an enchanted forest',
        'a dragon in its lair',
        'a wizard casting spells'
      ],
      scifi: [
        'a futuristic cityscape',
        'a spacecraft in deep space',
        'a cyberpunk street scene',
        'an advanced AI robot',
        'a space station orbiting a planet'
      ],
      portrait: [
        'a professional portrait',
        'an emotional character study',
        'a fashion portrait',
        'a dramatic headshot',
        'a candid portrait moment'
      ],
      landscape: [
        'a breathtaking mountain vista',
        'a serene beach sunset',
        'a misty forest morning',
        'a desert landscape',
        'a dramatic storm scene'
      ]
    };

    const themes = randomThemes[style] || randomThemes.realistic;
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];

    return `Generate a creative ${style} style image prompt featuring ${randomTheme}.

Create a detailed positive prompt and a negative prompt to avoid common issues.`;
  }
}

// Parse generated prompts from LM Studio response
function parseGeneratedPrompts(text) {
  const positiveMatch = text.match(/POSITIVE:\s*(.+?)(?=NEGATIVE:|$)/s);
  const negativeMatch = text.match(/NEGATIVE:\s*(.+)/s);

  let positive = positiveMatch ? positiveMatch[1].trim() : text.trim();
  let negative = negativeMatch ? negativeMatch[1].trim() : 'low quality, blurry, distorted, ugly, bad anatomy, bad proportions';

  // Clean up the prompts
  positive = positive.replace(/^["']|["']$/g, '').trim();
  negative = negative.replace(/^["']|["']$/g, '').trim();

  return { positive, negative };
}
