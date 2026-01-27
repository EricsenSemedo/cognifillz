/**
 * CogniFillz Background Service Worker
 * Handles communication between popup, content script, and external APIs
 */

import browser from 'webextension-polyfill';

console.log('🧠 CogniFillz: Background service worker loaded');

// Listen for extension installation
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('🧠 CogniFillz: Extension installed');
    
    // Set default settings
    browser.storage.local.set({
      settings: {
        autoFillEnabled: true,
        highlightFields: true,
        localLLMEndpoint: 'http://localhost:1234/v1',
        useLocalLLM: true
      }
    });
  }
});

// Handle messages from content script or popup
browser.runtime.onMessage.addListener((message: any, sender: any) => {
  console.log('🧠 Background received message:', message.action);
  
  if (message.action === 'analyzeJob') {
    return handleJobAnalysis(message.jobDescription);
  }
  
  if (message.action === 'saveProfile') {
    return handleSaveProfile(message.profile);
  }
  
  if (message.action === 'getProfile') {
    return handleGetProfile();
  }
});

/**
 * Handle job analysis request
 */
async function handleJobAnalysis(jobDescription: string): Promise<any> {
  try {
    // Get user profile and settings
    const data = await browser.storage.local.get(['profile', 'settings']);
    const profile = data.profile;
    const settings = data.settings || {};
    
    if (!profile) {
      return { error: 'No profile found. Please create a profile first.' };
    }
    
    // Call local LLM endpoint
    const endpoint = (settings as any).localLLMEndpoint || 'http://localhost:1234/v1';
    
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'local-model',
        messages: [
          {
            role: 'system',
            content: 'You are a resume optimization expert. Analyze the match between a resume and job description.'
          },
          {
            role: 'user',
            content: `Resume: ${JSON.stringify(profile)}\n\nJob Description: ${jobDescription}\n\nProvide a JSON response with: {"score": <0-100>, "missing_keywords": [<array>], "suggestions": [<array>]}`
          }
        ],
        temperature: 0.3
      })
    });
    
    if (!response.ok) {
      throw new Error(`LLM API error: ${response.statusText}`);
    }
    
    const result = await response.json();
    const analysis = JSON.parse(result.choices[0].message.content);
    
    return { success: true, analysis };
  } catch (error) {
    console.error('Job analysis error:', error);
    return { 
      error: error instanceof Error ? error.message : 'Failed to analyze job',
      fallback: true 
    };
  }
}

/**
 * Save user profile
 */
async function handleSaveProfile(profile: any): Promise<any> {
  try {
    await browser.storage.local.set({ profile });
    
    // Sync to Supabase if enabled
    const settings = await browser.storage.local.get(['settings', 'user']);
    const userSettings: any = settings.settings || {};
    const user: any = settings.user;
    
    if (userSettings.supabaseEnabled && user?.id) {
      try {
        const { syncProfileToCloud } = await import('../lib/supabase');
        await syncProfileToCloud(profile, user.id);
        console.log('✅ Profile synced to cloud');
      } catch (error) {
        console.error('Failed to sync to cloud:', error);
        // Continue even if cloud sync fails
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Save profile error:', error);
    return { error: 'Failed to save profile' };
  }
}

/**
 * Get user profile
 */
async function handleGetProfile(): Promise<any> {
  try {
    const data = await browser.storage.local.get(['profile']);
    return { success: true, profile: data.profile || null };
  } catch (error) {
    console.error('Get profile error:', error);
    return { error: 'Failed to get profile' };
  }
}
