// Blacklink Analytics v3.9
// Client-side analytics tracking for user interactions and preferences

import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

let db = null;
let currentUser = null;
let sessionId = null;

// Initialize analytics
export function initAnalytics(firebaseDb, user) {
  db = firebaseDb;
  currentUser = user;
  sessionId = generateSessionId();
}

// Generate unique session ID
function generateSessionId() {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Track analytics event
export async function trackEvent(eventName, properties = {}) {
  if (!db) {
    console.warn('Analytics not initialized');
    return;
  }

  try {
    const eventData = {
      event: eventName,
      timestamp: new Date().toISOString(),
      sessionId: sessionId,
      user: currentUser ? {
        uid: currentUser.uid,
        userId: currentUser.uid,
        email: currentUser.email || null
      } : null,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        sessionId: sessionId,
        version: '3.9'
      }
    };

    // Write to Firestore analytics collection
    await addDoc(collection(db, 'analytics'), eventData);

    console.log('📊 Analytics event tracked:', eventName, properties);
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
}

// Track visual preference updates
export async function trackVisualPreference(preference, value, source = 'settings', app = 'dashboard') {
  await trackEvent('visual_preference_updated', {
    app,
    preference,
    value,
    source
  });
}

// Track theme changes
export async function trackThemeChange(theme, source = 'settings') {
  await trackVisualPreference('theme', theme, source);
}

// Track accent color changes
export async function trackAccentColorChange(color, source = 'accent') {
  await trackVisualPreference('accentColor', color, source);
}

// Track page views
export async function trackPageView(pageName, additionalData = {}) {
  await trackEvent('page_view', {
    page: pageName,
    url: window.location.href,
    referrer: document.referrer,
    ...additionalData
  });
}

// Track button clicks
export async function trackButtonClick(buttonName, location, additionalData = {}) {
  await trackEvent('button_click', {
    button: buttonName,
    location,
    ...additionalData
  });
}

// Track feature usage
export async function trackFeatureUsage(featureName, action, additionalData = {}) {
  await trackEvent('feature_usage', {
    feature: featureName,
    action,
    ...additionalData
  });
}

// Track subscription events
export async function trackSubscription(action, tier, additionalData = {}) {
  await trackEvent('subscription_event', {
    action, // 'upgrade', 'downgrade', 'cancel', 'renew'
    tier,
    ...additionalData
  });
}

// Track organization events
export async function trackOrganization(action, orgId, additionalData = {}) {
  await trackEvent('organization_event', {
    action, // 'create', 'join', 'leave', 'invite'
    orgId,
    ...additionalData
  });
}

// Track accessibility changes
export async function trackAccessibility(setting, value, additionalData = {}) {
  await trackEvent('accessibility_change', {
    setting,
    value,
    ...additionalData
  });
}

// Track errors
export async function trackError(errorType, errorMessage, additionalData = {}) {
  await trackEvent('error', {
    errorType,
    errorMessage,
    stack: additionalData.stack || null,
    ...additionalData
  });
}

// Track user preferences
export async function trackPreference(category, setting, value, additionalData = {}) {
  await trackEvent('preference_updated', {
    category,
    setting,
    value,
    ...additionalData
  });
}

// Track SSO events
export async function trackSSO(action, provider, additionalData = {}) {
  await trackEvent('sso_event', {
    action, // 'link', 'unlink', 'login'
    provider,
    ...additionalData
  });
}

// Track AeroAI usage
export async function trackAeroAI(action, tokensUsed = 0, additionalData = {}) {
  await trackEvent('aeroai_usage', {
    action,
    tokensUsed,
    ...additionalData
  });
}

// Track ClassLink events
export async function trackClassLink(action, additionalData = {}) {
  await trackEvent('classlink_event', {
    action,
    ...additionalData
  });
}

// Batch event tracking (for performance)
let eventQueue = [];
let flushTimeout = null;

export async function trackEventBatched(eventName, properties = {}) {
  eventQueue.push({ eventName, properties });

  // Auto-flush after 5 seconds or 10 events
  if (eventQueue.length >= 10) {
    await flushEventQueue();
  } else if (!flushTimeout) {
    flushTimeout = setTimeout(flushEventQueue, 5000);
  }
}

async function flushEventQueue() {
  if (eventQueue.length === 0) return;

  const eventsToFlush = [...eventQueue];
  eventQueue = [];

  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }

  // Track all events
  for (const { eventName, properties } of eventsToFlush) {
    await trackEvent(eventName, properties);
  }
}

// Flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (eventQueue.length > 0) {
      flushEventQueue();
    }
  });
}

export default {
  initAnalytics,
  trackEvent,
  trackVisualPreference,
  trackThemeChange,
  trackAccentColorChange,
  trackPageView,
  trackButtonClick,
  trackFeatureUsage,
  trackSubscription,
  trackOrganization,
  trackAccessibility,
  trackError,
  trackPreference,
  trackSSO,
  trackAeroAI,
  trackClassLink,
  trackEventBatched
};
