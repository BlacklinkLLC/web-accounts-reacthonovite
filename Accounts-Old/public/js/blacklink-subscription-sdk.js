/**
 * Blacklink Subscription SDK
 * For integration with Aero AI and other Blacklink products
 *
 * Version: 2.0.0 - Firestore Direct (No Cloud Functions Required)
 * Last Updated: January 31, 2025
 */

class BlacklinkSubscription {
  constructor(config) {
    this.auth = config.auth; // Firebase Auth instance
    this.db = config.db || firebase.firestore(); // Firestore instance

    if (!this.auth) {
      throw new Error('Firebase Auth instance is required. Pass auth: firebase.auth() in config.');
    }

    this.cache = {
      subscription: null,
      timestamp: null,
      ttl: 5 * 60 * 1000 // 5 minutes
    };

    this.defaultSubscription = {
      tier: 'FREE',
      status: 'active',
      price: 0,
      features: ['Basic Blacklink Apps', 'Standard Support'],
      aeroTokens: {
        monthly: 0,
        remaining: 0,
        used: 0
      }
    };
  }

  /**
   * Get subscription status for current user (from Firestore)
   * @returns {Promise<Object>} Subscription data
   */
  async getSubscriptionStatus() {
    // Check cache first
    if (this.cache.subscription && this.cache.timestamp) {
      const age = Date.now() - this.cache.timestamp;
      if (age < this.cache.ttl) {
        return this.cache.subscription;
      }
    }

    try {
      const user = this.auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user');
      }

      // Get subscription from Firestore
      const subDoc = await this.db.collection('subscriptions').doc(user.uid).get();

      let subscriptionData;

      if (subDoc.exists) {
        subscriptionData = subDoc.data();
      } else {
        // Create default FREE subscription
        subscriptionData = {
          userId: user.uid,
          email: user.email,
          tier: 'FREE',
          status: 'active',
          price: 0,
          features: ['Basic Blacklink Apps', 'Standard Support'],
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Save to Firestore
        await this.db.collection('subscriptions').doc(user.uid).set(subscriptionData);
      }

      // Get Aero tokens
      const tokensDoc = await this.db.collection('aero_tokens').doc(user.uid).get();
      let aeroTokens = {
        monthly: 0,
        remaining: 0,
        used: 0
      };

      if (tokensDoc.exists) {
        const tokenData = tokensDoc.data();
        aeroTokens = {
          monthly: tokenData.monthlyAllocation || 0,
          remaining: tokenData.remaining || 0,
          used: tokenData.used || 0
        };
      } else if (subscriptionData.tier === 'ULTRA' || subscriptionData.tier === 'ULTRA_PLUS') {
        // Create token allocation based on tier
        const monthlyAllocation = subscriptionData.tier === 'ULTRA' ? 10 : 25;
        aeroTokens = {
          monthly: monthlyAllocation,
          remaining: monthlyAllocation,
          used: 0
        };

        // Save to Firestore
        await this.db.collection('aero_tokens').doc(user.uid).set({
          userId: user.uid,
          tier: subscriptionData.tier,
          monthlyAllocation: monthlyAllocation,
          remaining: monthlyAllocation,
          used: 0,
          lastReset: firebase.firestore.FieldValue.serverTimestamp(),
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }

      // Combine subscription and token data
      const result = {
        ...subscriptionData,
        aeroTokens: aeroTokens
      };

      // Cache the result
      this.cache.subscription = result;
      this.cache.timestamp = Date.now();

      return result;
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      // Return default subscription on error
      return this.defaultSubscription;
    }
  }

  /**
   * Check if user has an active ULTRA subscription
   * @returns {Promise<boolean>}
   */
  async hasUltra() {
    try {
      const sub = await this.getSubscriptionStatus();
      return sub.tier === 'ULTRA' || sub.tier === 'ULTRA_PLUS';
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user has ULTRA+ subscription
   * @returns {Promise<boolean>}
   */
  async hasUltraPlus() {
    try {
      const sub = await this.getSubscriptionStatus();
      return sub.tier === 'ULTRA_PLUS';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get subscription tier
   * @returns {Promise<string>} 'FREE', 'ULTRA', or 'ULTRA_PLUS'
   */
  async getTier() {
    try {
      const sub = await this.getSubscriptionStatus();
      return sub.tier || 'FREE';
    } catch (error) {
      return 'FREE';
    }
  }

  /**
   * Get Aero AI token balance
   * @returns {Promise<Object>} { monthly, remaining, used }
   */
  async getAeroTokens() {
    try {
      const sub = await this.getSubscriptionStatus();
      return sub.aeroTokens || { monthly: 0, remaining: 0, used: 0 };
    } catch (error) {
      return { monthly: 0, remaining: 0, used: 0 };
    }
  }

  /**
   * Check if user has sufficient Aero AI tokens
   * @param {number} amount - Amount of tokens required
   * @returns {Promise<boolean>}
   */
  async hasAeroTokens(amount) {
    try {
      const tokens = await this.getAeroTokens();
      return tokens.remaining >= amount;
    } catch (error) {
      return false;
    }
  }

  /**
   * Use Aero AI tokens (update Firestore directly)
   * @param {number} amount - Amount of tokens to use
   * @returns {Promise<Object>} { success, tokensUsed, remaining }
   */
  async useAeroTokens(amount) {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user');
      }

      // Get current token balance
      const tokensRef = this.db.collection('aero_tokens').doc(user.uid);
      const tokensDoc = await tokensRef.get();

      if (!tokensDoc.exists) {
        throw new Error('No token allocation found. Subscribe to ULTRA to get AI credits.');
      }

      const tokenData = tokensDoc.data();
      const currentRemaining = tokenData.remaining || 0;

      if (currentRemaining < amount) {
        throw new Error(`Insufficient tokens. You have $${currentRemaining} remaining but need $${amount}.`);
      }

      // Deduct tokens
      const newRemaining = currentRemaining - amount;
      const newUsed = (tokenData.used || 0) + amount;

      await tokensRef.update({
        remaining: newRemaining,
        used: newUsed,
        lastUsedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // Invalidate cache
      this.cache.subscription = null;
      this.cache.timestamp = null;

      return {
        success: true,
        tokensUsed: amount,
        remaining: newRemaining,
        used: newUsed
      };
    } catch (error) {
      console.error('Error using Aero tokens:', error);
      throw error;
    }
  }

  /**
   * Get subscription features
   * @returns {Promise<Array<string>>} List of features
   */
  async getFeatures() {
    try {
      const sub = await this.getSubscriptionStatus();
      return sub.features || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Check if user has a specific feature
   * @param {string} feature - Feature name
   * @returns {Promise<boolean>}
   */
  async hasFeature(feature) {
    try {
      const features = await this.getFeatures();
      return features.includes(feature);
    } catch (error) {
      return false;
    }
  }

  /**
   * Refresh subscription status (bypass cache)
   * @returns {Promise<Object>} Fresh subscription data
   */
  async refresh() {
    this.cache.subscription = null;
    this.cache.timestamp = null;
    return await this.getSubscriptionStatus();
  }

  /**
   * Listen to subscription changes (real-time updates)
   * @param {Function} callback - Called when subscription changes
   * @returns {Function} Unsubscribe function
   */
  onSubscriptionChange(callback) {
    const db = firebase.firestore();
    const user = this.auth.currentUser;

    if (!user) {
      console.error('No authenticated user');
      return () => {};
    }

    const unsubscribe = db.collection('subscriptions').doc(user.uid)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const subData = doc.data();

          // Invalidate cache
          this.cache.subscription = null;
          this.cache.timestamp = null;

          callback(subData);
        }
      }, (error) => {
        console.error('Error listening to subscription changes:', error);
      });

    return unsubscribe;
  }

  /**
   * Get subscription URL for upgrade
   * @param {string} tier - 'ULTRA' or 'ULTRA_PLUS'
   * @returns {string} Buy Me a Coffee URL
   */
  getSubscribeURL(tier = 'ULTRA') {
    const baseURL = 'https://coff.ee/blacklink';
    if (tier === 'ULTRA_PLUS') {
      return `${baseURL}?plan=ultra-plus`;
    }
    return `${baseURL}?plan=ultra`;
  }

  /**
   * Get manage subscription URL
   * @returns {string} Buy Me a Coffee manage URL
   */
  getManageURL() {
    return 'https://coff.ee/blacklink';
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BlacklinkSubscription;
} else if (typeof define === 'function' && define.amd) {
  define([], function() {
    return BlacklinkSubscription;
  });
} else {
  window.BlacklinkSubscription = BlacklinkSubscription;
}
