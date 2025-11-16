/**
 * Blacklink Accounts v3.9 - Utility Functions
 * Shared JavaScript utilities across all pages
 */

(function() {
  'use strict';

  window.BlacklinkUtils = {
    /**
     * Normalize subscription tier
     * @param {string} tier - Raw tier value
     * @returns {string} Normalized tier (FREE, ULTRA, ULTRA_PLUS)
     */
    normalizeTier: function(tier) {
      if (!tier) return 'FREE';
      const value = String(tier).toUpperCase().replace(/\s+/g, '_');

      // Employee tier gets ULTRA_PLUS access
      if (value.includes('EMPLOYEE')) return 'ULTRA_PLUS';
      if (value === 'ULTRA_PLUS' || value === 'ULTRA+') return 'ULTRA_PLUS';
      if (value === 'ULTRA' || value.includes('DISTRICT')) return 'ULTRA';

      return 'FREE';
    },

    /**
     * Get display name for tier
     * @param {string} tier - Normalized tier
     * @returns {string} Display name
     */
    getTierDisplayName: function(tier) {
      const normalized = this.normalizeTier(tier);
      switch (normalized) {
        case 'ULTRA_PLUS':
          return 'ULTRA+';
        case 'ULTRA':
          return 'ULTRA';
        default:
          return 'FREE';
      }
    },

    /**
     * Check if user has ULTRA or higher
     * @param {string} tier - User's tier
     * @returns {boolean}
     */
    hasUltra: function(tier) {
      const normalized = this.normalizeTier(tier);
      return normalized === 'ULTRA' || normalized === 'ULTRA_PLUS';
    },

    /**
     * Check if user has ULTRA+
     * @param {string} tier - User's tier
     * @returns {boolean}
     */
    hasUltraPlus: function(tier) {
      const normalized = this.normalizeTier(tier);
      return normalized === 'ULTRA_PLUS';
    },

    /**
     * Apply theme to document
     * @param {string} themeId - Theme ID
     */
    applyTheme: function(themeId) {
      if (!themeId) return;
      document.documentElement.setAttribute('data-theme', themeId);
      if (document.body) {
        document.body.setAttribute('data-theme', themeId);
      }
      localStorage.setItem('theme', themeId);
    },

    /**
     * Get current theme
     * @returns {string} Current theme ID
     */
    getCurrentTheme: function() {
      return localStorage.getItem('theme') || 'dark';
    },

    /**
     * Initialize theme from localStorage
     */
    initTheme: function() {
      const savedTheme = this.getCurrentTheme();
      this.applyTheme(savedTheme);
    },

    /**
     * Format date for display
     * @param {Date|string} date - Date object or ISO string
     * @returns {string} Formatted date
     */
    formatDate: function(date) {
      if (!date) return 'N/A';
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    /**
     * Format timestamp for display
     * @param {Date|string} date - Date object or ISO string
     * @returns {string} Formatted timestamp
     */
    formatTimestamp: function(date) {
      if (!date) return 'N/A';
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    /**
     * Get user initials from name or email
     * @param {string} name - User's name
     * @param {string} email - User's email (fallback)
     * @returns {string} User initials (max 2 characters)
     */
    getUserInitials: function(name, email) {
      if (name) {
        return name
          .split(' ')
          .map(n => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();
      }
      if (email) {
        return email.substring(0, 2).toUpperCase();
      }
      return 'U';
    },

    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, warning, danger, info)
     * @param {number} duration - Duration in ms (default 3000)
     */
    showToast: function(message, type = 'info', duration = 3000) {
      let container = document.getElementById('toastContainer');

      if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.innerHTML = `
        <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
        <div class="toast-message">${message}</div>
      `;

      container.appendChild(toast);

      setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    },

    /**
     * Debounce function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    debounce: function(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    /**
     * Throttle function
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in ms
     * @returns {Function} Throttled function
     */
    throttle: function(func, limit) {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success status
     */
    copyToClipboard: async function(text) {
      try {
        await navigator.clipboard.writeText(text);
        this.showToast('Copied to clipboard', 'success');
        return true;
      } catch (err) {
        console.error('Failed to copy:', err);
        this.showToast('Failed to copy', 'danger');
        return false;
      }
    },

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} Is valid
     */
    isValidEmail: function(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },

    /**
     * Generate random ID
     * @param {number} length - ID length
     * @returns {string} Random ID
     */
    generateId: function(length = 16) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    },

    /**
     * Format number with commas
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    formatNumber: function(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    /**
     * Truncate text
     * @param {string} text - Text to truncate
     * @param {number} length - Max length
     * @returns {string} Truncated text
     */
    truncate: function(text, length = 50) {
      if (text.length <= length) return text;
      return text.substring(0, length) + '...';
    },

    /**
     * Parse query parameters from URL
     * @returns {Object} Query parameters
     */
    getQueryParams: function() {
      const params = {};
      const searchParams = new URLSearchParams(window.location.search);
      for (const [key, value] of searchParams) {
        params[key] = value;
      }
      return params;
    },

    /**
     * Update URL query parameter without reload
     * @param {string} key - Parameter key
     * @param {string} value - Parameter value
     */
    updateQueryParam: function(key, value) {
      const url = new URL(window.location);
      url.searchParams.set(key, value);
      window.history.pushState({}, '', url);
    },

    /**
     * Check if user is Blacklink staff
     * @param {string} email - User's email
     * @returns {boolean}
     */
    isBlacklinkStaff: function(email) {
      if (!email) return false;
      return email.toLowerCase().endsWith('@blacklink.net');
    },

    /**
     * Get tier badge color
     * @param {string} tier - User's tier
     * @returns {string} Badge class
     */
    getTierBadgeClass: function(tier) {
      const normalized = this.normalizeTier(tier);
      switch (normalized) {
        case 'ULTRA_PLUS':
          return 'badge-ultra-plus';
        case 'ULTRA':
          return 'badge-ultra';
        default:
          return 'badge-info';
      }
    },

    /**
     * Format Aero AI credits
     * @param {number} credits - Number of credits
     * @returns {string} Formatted credits with icon
     */
    formatAeroCredits: function(credits) {
      return `✨ ${this.formatNumber(credits)} credits`;
    },

    /**
     * Calculate percentage
     * @param {number} value - Current value
     * @param {number} max - Maximum value
     * @returns {number} Percentage (0-100)
     */
    calculatePercentage: function(value, max) {
      if (max === 0) return 0;
      return Math.min(100, Math.round((value / max) * 100));
    },

    /**
     * Sleep function for delays
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise}
     */
    sleep: function(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  };

  // Auto-initialize theme on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.BlacklinkUtils.initTheme();
    });
  } else {
    window.BlacklinkUtils.initTheme();
  }

  console.log('✨ BlacklinkUtils loaded');
})();
