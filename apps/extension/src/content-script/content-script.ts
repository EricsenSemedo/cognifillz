/**
 * CogniFillz Content Script
 * Detects and fills form fields on job application pages
 */

import browser from 'webextension-polyfill';

// Field type definitions
interface FieldMapping {
  type: string;
  keywords: string[];
  priority: number;
}

// Common field patterns with fuzzy matching keywords
const FIELD_MAPPINGS: FieldMapping[] = [
  {
    type: 'firstName',
    keywords: ['first name', 'given name', 'firstname', 'fname', 'forename'],
    priority: 1
  },
  {
    type: 'lastName',
    keywords: ['last name', 'surname', 'lastname', 'lname', 'family name'],
    priority: 1
  },
  {
    type: 'email',
    keywords: ['email', 'e-mail', 'mail'],
    priority: 1
  },
  {
    type: 'phone',
    keywords: ['phone', 'telephone', 'mobile', 'cell'],
    priority: 1
  },
  {
    type: 'linkedin',
    keywords: ['linkedin', 'linked in', 'linkedin url', 'linkedin profile'],
    priority: 2
  },
  {
    type: 'github',
    keywords: ['github', 'git hub', 'github url', 'github profile'],
    priority: 2
  },
  {
    type: 'portfolio',
    keywords: ['portfolio', 'website', 'personal site', 'web site'],
    priority: 2
  },
  {
    type: 'location',
    keywords: ['location', 'city', 'address', 'where are you based'],
    priority: 2
  },
  {
    type: 'summary',
    keywords: ['summary', 'about', 'bio', 'cover letter', 'introduction'],
    priority: 3
  }
];

// Detected field interface
interface DetectedField {
  element: HTMLInputElement | HTMLTextAreaElement;
  type: string;
  label: string;
  confidence: number;
}

/**
 * Fuzzy match a string against keywords
 */
function fuzzyMatch(text: string, keywords: string[]): number {
  const normalized = text.toLowerCase().trim();
  
  for (const keyword of keywords) {
    if (normalized.includes(keyword)) {
      // Exact substring match
      if (normalized === keyword) return 1.0;
      // Contains keyword
      return 0.8;
    }
  }
  
  // Check for partial matches (at least 50% of characters)
  for (const keyword of keywords) {
    let matches = 0;
    for (const char of keyword) {
      if (normalized.includes(char)) matches++;
    }
    if (matches / keyword.length >= 0.5) {
      return 0.5;
    }
  }
  
  return 0;
}

/**
 * Get all text associated with an input field
 */
function getFieldContext(element: HTMLInputElement | HTMLTextAreaElement): string {
  const contexts: string[] = [];
  
  // Check the element's attributes
  if (element.name) contexts.push(element.name);
  if (element.id) contexts.push(element.id);
  if (element.placeholder) contexts.push(element.placeholder);
  if (element.getAttribute('aria-label')) contexts.push(element.getAttribute('aria-label')!);
  
  // Check for associated label
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) contexts.push(label.textContent || '');
  }
  
  // Check parent/sibling elements for label text
  const parent = element.parentElement;
  if (parent) {
    const label = parent.querySelector('label');
    if (label) contexts.push(label.textContent || '');
    
    // Sometimes labels are in sibling divs
    const prevSibling = parent.previousElementSibling;
    if (prevSibling) contexts.push(prevSibling.textContent || '');
  }
  
  return contexts.join(' ');
}

/**
 * Detect the type of a form field
 */
function detectFieldType(element: HTMLInputElement | HTMLTextAreaElement): DetectedField | null {
  const context = getFieldContext(element);
  
  let bestMatch: DetectedField | null = null;
  let highestScore = 0;
  
  for (const mapping of FIELD_MAPPINGS) {
    const score = fuzzyMatch(context, mapping.keywords);
    
    // Prioritize by both match confidence and field priority
    const weightedScore = score * (1 / mapping.priority);
    
    if (score > 0.5 && weightedScore > highestScore) {
      highestScore = weightedScore;
      bestMatch = {
        element,
        type: mapping.type,
        label: context.substring(0, 50), // Truncate for display
        confidence: score
      };
    }
  }
  
  return bestMatch;
}

/**
 * Find all form fields on the page (including iframes)
 */
function detectAllFields(): DetectedField[] {
  const detectedFields: DetectedField[] = [];
  
  // Function to scan a document
  const scanDocument = (doc: Document) => {
    const inputs = doc.querySelectorAll('input, textarea');
    
    inputs.forEach((input) => {
      // Skip hidden, submit, and button inputs
      const element = input as HTMLInputElement | HTMLTextAreaElement;
      if (
        element.type === 'hidden' ||
        element.type === 'submit' ||
        element.type === 'button'
      ) {
        return;
      }
      
      const detected = detectFieldType(element);
      if (detected) {
        detectedFields.push(detected);
      }
    });
  };
  
  // Scan main document
  scanDocument(document);
  
  // Scan iframes (common in Workday)
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach((iframe) => {
    try {
      if (iframe.contentDocument) {
        scanDocument(iframe.contentDocument);
      }
    } catch (e) {
      // Cross-origin iframe, can't access
      console.log('CogniFillz: Cannot access iframe due to cross-origin policy');
    }
  });
  
  return detectedFields;
}

/**
 * Highlight detected fields on the page
 */
function highlightFields(fields: DetectedField[]) {
  fields.forEach((field) => {
    field.element.style.outline = '2px solid #4CAF50';
    field.element.style.outlineOffset = '2px';
    
    // Add a small badge showing the field type
    const badge = document.createElement('div');
    badge.textContent = field.type;
    badge.style.cssText = `
      position: absolute;
      background: #4CAF50;
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 10px;
      font-family: monospace;
      z-index: 10000;
      pointer-events: none;
    `;
    
    const rect = field.element.getBoundingClientRect();
    badge.style.top = `${rect.top + window.scrollY - 20}px`;
    badge.style.left = `${rect.left + window.scrollX}px`;
    
    document.body.appendChild(badge);
  });
}

/**
 * Fill a field with data
 */
function fillField(field: DetectedField, value: string) {
  const element = field.element;
  
  // Set the value
  element.value = value;
  
  // Trigger events to ensure the site recognizes the change
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
}

/**
 * Main initialization
 */
function init() {
  console.log('🧠 CogniFillz: Content script loaded');
  
  // Detect fields when page is loaded
  const detectedFields = detectAllFields();
  
  console.log(`🧠 CogniFillz: Detected ${detectedFields.length} fields:`);
  detectedFields.forEach((field) => {
    console.log(`  - ${field.type} (${(field.confidence * 100).toFixed(0)}% confidence): ${field.label}`);
  });
  
  // Highlight fields for debugging (remove this in production)
  highlightFields(detectedFields);
  
  // Listen for messages from popup/background
  browser.runtime.onMessage.addListener((message: any, sender: any) => {
    if (message.action === 'getDetectedFields') {
      return Promise.resolve({
        fields: detectedFields.map(f => ({
          type: f.type,
          label: f.label,
          confidence: f.confidence
        }))
      });
    }
    
    if (message.action === 'fillFields') {
      const { profileData } = message;
      
      detectedFields.forEach((field) => {
        const value = profileData[field.type];
        if (value) {
          fillField(field, value);
        }
      });
      
      return Promise.resolve({ success: true, filledCount: detectedFields.length });
    }
    
    return Promise.resolve({ error: 'Unknown action' });
  });
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Re-scan when page content changes (for SPAs)
const observer = new MutationObserver(() => {
  // Debounce re-scanning
  setTimeout(() => {
    const newFields = detectAllFields();
    if (newFields.length > 0) {
      console.log(`🧠 CogniFillz: Detected ${newFields.length} new fields`);
    }
  }, 1000);
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
