// Blacklink Analytics v3.9 - Compat Version
// Client-side analytics tracking for user interactions and preferences
// Works with Firebase Compat SDK

(function() {
  'use strict';

  let db = null;
  let currentUser = null;
  let sessionId = null;
  let analyticsDisabled = false;

  // Generate unique session ID
  function generateSessionId() {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  // Initialize analytics
  window.BlacklinkAnalytics = {
    init: function(firebaseDb, user) {
      db = firebaseDb;
      currentUser = user;
      sessionId = generateSessionId();
      console.log('📊 Analytics initialized');
    },

    // Track analytics event
    trackEvent: async function(eventName, properties = {}) {
      if (analyticsDisabled) {
        return;
      }

      if (!db || !currentUser) {
        console.warn('Analytics skipped (missing auth/db)', { eventName });
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
        await db.collection('analytics').add(eventData);

        console.log('📊 Event tracked:', eventName, properties);
      } catch (error) {
        console.error('Analytics tracking error:', error);

        if (error && (error.code === 'permission-denied' || error.code === 'failed-precondition')) {
          analyticsDisabled = true;
          console.warn('Analytics disabled for this session due to permissions.');
        }
      }
    },

    // Track visual preference updates
    trackVisualPreference: async function(preference, value, source = 'settings', app = 'dashboard') {
      await this.trackEvent('visual_preference_updated', {
        app,
        preference,
        value,
        source
      });
    },

    // Track theme changes
    trackThemeChange: async function(theme, source = 'settings') {
      await this.trackVisualPreference('theme', theme, source);
    },

    // Track accent color changes
    trackAccentColorChange: async function(color, source = 'accent') {
      await this.trackVisualPreference('accentColor', color, source);
    },

    // Track page views
    trackPageView: async function(pageName, additionalData = {}) {
      await this.trackEvent('page_view', {
        page: pageName,
        url: window.location.href,
        referrer: document.referrer,
        ...additionalData
      });
    },

    // Track button clicks
    trackButtonClick: async function(buttonName, location, additionalData = {}) {
      await this.trackEvent('button_click', {
        button: buttonName,
        location,
        ...additionalData
      });
    },

    // Track feature usage
    trackFeatureUsage: async function(featureName, action, additionalData = {}) {
      await this.trackEvent('feature_usage', {
        feature: featureName,
        action,
        ...additionalData
      });
    },

    // Track subscription events
    trackSubscription: async function(action, tier, additionalData = {}) {
      await this.trackEvent('subscription_event', {
        action, // 'upgrade', 'downgrade', 'cancel', 'renew'
        tier,
        ...additionalData
      });
    },

    // Track organization events
    trackOrganization: async function(action, orgId, additionalData = {}) {
      await this.trackEvent('organization_event', {
        action, // 'create', 'join', 'leave', 'invite'
        orgId,
        ...additionalData
      });
    },

    // Track accessibility changes
    trackAccessibility: async function(setting, value, additionalData = {}) {
      await this.trackEvent('accessibility_change', {
        setting,
        value,
        ...additionalData
      });
    },

    // Track errors
    trackError: async function(errorType, errorMessage, additionalData = {}) {
      await this.trackEvent('error', {
        errorType,
        errorMessage,
        stack: additionalData.stack || null,
        ...additionalData
      });
    },

    // Track user preferences
    trackPreference: async function(category, setting, value, additionalData = {}) {
      await this.trackEvent('preference_updated', {
        category,
        setting,
        value,
        ...additionalData
      });
    },

    // Track SSO events
    trackSSO: async function(action, provider, additionalData = {}) {
      await this.trackEvent('sso_event', {
        action, // 'link', 'unlink', 'login'
        provider,
        ...additionalData
      });
    },

    // Track AeroAI usage
    trackAeroAI: async function(action, tokensUsed = 0, additionalData = {}) {
      await this.trackEvent('aeroai_usage', {
        action,
        tokensUsed,
        ...additionalData
      });
    },

    // Track ClassLink events
    trackClassLink: async function(action, additionalData = {}) {
      await this.trackEvent('classlink_event', {
        action,
        ...additionalData
      });
    }
  };

  console.log('📊 BlacklinkAnalytics loaded (compat mode)');
})();
