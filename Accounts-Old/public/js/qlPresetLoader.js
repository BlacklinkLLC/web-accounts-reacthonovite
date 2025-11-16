/**
 * Blacklink QuickLaunch Preset Loader
 * Dynamically loads and applies .qlPreset configurations
 */

(function() {
  'use strict';

  const PRESET_DIRECTORY = 'js/presets/';

  const AVAILABLE_PRESETS = {
    'student': {
      id: 'student-essentials',
      name: 'Student Essentials',
      description: 'Curated for K-12 and college students',
      icon: '🎓',
      file: 'student.qlPreset',
      targetAudience: ['student']
    },
    'teacher': {
      id: 'teacher-workspace',
      name: 'Teacher Workspace',
      description: 'Professional tools for educators',
      icon: '👩‍🏫',
      file: 'teacher.qlPreset',
      targetAudience: ['teacher', 'educator', 'instructor']
    },
    'admin': {
      id: 'district-admin',
      name: 'District Administration',
      description: 'Administrative and management tools',
      icon: '🏛️',
      file: 'admin.qlPreset',
      targetAudience: ['admin', 'administrator', 'it'],
      requiresAdmin: true
    },
    'developer': {
      id: 'developer-tools',
      name: 'Developer Tools',
      description: 'APIs, docs, and development resources',
      icon: '👨‍💻',
      file: 'developer.qlPreset',
      targetAudience: ['developer', 'engineer']
    }
  };

  window.QuickLaunchPresets = {
    /**
     * Get list of available presets
     * @param {boolean} includeAdmin - Include admin-only presets
     * @returns {Array} Array of preset metadata
     */
    getAvailablePresets: function(includeAdmin = false) {
      return Object.values(AVAILABLE_PRESETS).filter(preset => {
        if (!includeAdmin && preset.requiresAdmin) {
          return false;
        }
        return true;
      });
    },

    /**
     * Load a preset by ID
     * @param {string} presetId - Preset identifier
     * @returns {Promise<Object>} Preset configuration
     */
    loadPreset: async function(presetId) {
      const preset = AVAILABLE_PRESETS[presetId];
      if (!preset) {
        throw new Error(`Preset '${presetId}' not found`);
      }

      try {
        const response = await fetch(`${PRESET_DIRECTORY}${preset.file}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`✅ Loaded preset: ${data.name}`);
        return data;
      } catch (error) {
        console.error(`Failed to load preset '${presetId}':`, error);
        throw error;
      }
    },

    /**
     * Apply a preset to the dashboard
     * @param {Object} presetData - Preset configuration object
     * @param {Object} options - Application options
     * @returns {Object} Applied configuration
     */
    applyPreset: function(presetData, options = {}) {
      const {
        mergeWithExisting = false,
        filterByTier = null,
        filterByAdmin = false
      } = options;

      // Filter apps based on tier and admin requirements
      let apps = presetData.apps || [];

      if (filterByTier) {
        apps = apps.filter(app => {
          if (app.tier === 'free') return true;
          if (app.tier === 'ultra' && filterByTier !== 'FREE') return true;
          if (app.tier === 'admin' && filterByAdmin) return true;
          return false;
        });
      }

      // Filter apps requiring admin access
      if (!filterByAdmin) {
        apps = apps.filter(app => !app.requiresAdmin);
      }

      const config = {
        apps: apps,
        categories: presetData.categories || {},
        quickActions: presetData.quickActions || [],
        recommendations: presetData.recommendations || [],
        metadata: {
          presetId: presetData.presetId,
          name: presetData.name,
          version: presetData.version,
          appliedAt: new Date().toISOString()
        }
      };

      console.log(`📦 Applied preset: ${presetData.name}`);
      console.log(`   Apps: ${config.apps.length}`);
      console.log(`   Categories: ${Object.keys(config.categories).length}`);

      return config;
    },

    /**
     * Recommend presets based on user profile
     * @param {Object} userProfile - User profile data
     * @returns {Array} Recommended preset IDs
     */
    recommendPresets: function(userProfile) {
      const recommendations = [];
      const {
        role,
        tier,
        isAdmin,
        email
      } = userProfile;

      // Check each preset's target audience
      for (const [presetId, preset] of Object.entries(AVAILABLE_PRESETS)) {
        // Skip admin presets if user is not admin
        if (preset.requiresAdmin && !isAdmin) {
          continue;
        }

        // Check if user role matches target audience
        if (role && preset.targetAudience.includes(role.toLowerCase())) {
          recommendations.push({
            presetId,
            preset,
            matchReason: 'role',
            priority: 1
          });
          continue;
        }

        // Check for developer role
        if (email && email.endsWith('@blacklink.net') && presetId === 'developer') {
          recommendations.push({
            presetId,
            preset,
            matchReason: 'staff',
            priority: 1
          });
        }

        // Default recommendation for students (if no role specified)
        if (!role && presetId === 'student') {
          recommendations.push({
            presetId,
            preset,
            matchReason: 'default',
            priority: 2
          });
        }
      }

      // Sort by priority
      recommendations.sort((a, b) => a.priority - b.priority);

      return recommendations;
    },

    /**
     * Save user's preset preference
     * @param {string} presetId - Selected preset ID
     * @param {Object} firestore - Firestore instance
     * @param {string} userId - User ID
     */
    savePresetPreference: async function(presetId, firestore, userId) {
      if (!firestore || !userId) {
        throw new Error('Firestore and userId are required');
      }

      try {
        await firestore.collection('users').doc(userId).update({
          'preferences.quickLaunchPreset': presetId,
          'preferences.presetAppliedAt': new Date()
        });

        console.log(`💾 Saved preset preference: ${presetId}`);

        // Track analytics
        if (window.BlacklinkAnalytics) {
          BlacklinkAnalytics.trackEvent('preset_selected', {
            presetId: presetId,
            source: 'quicklaunch'
          });
        }
      } catch (error) {
        console.error('Failed to save preset preference:', error);
        throw error;
      }
    },

    /**
     * Load user's saved preset
     * @param {Object} firestore - Firestore instance
     * @param {string} userId - User ID
     * @returns {Promise<string|null>} Saved preset ID or null
     */
    getSavedPreset: async function(firestore, userId) {
      if (!firestore || !userId) {
        return null;
      }

      try {
        const userDoc = await firestore.collection('users').doc(userId).get();
        const userData = userDoc.data();
        return userData?.preferences?.quickLaunchPreset || null;
      } catch (error) {
        console.error('Failed to load saved preset:', error);
        return null;
      }
    },

    /**
     * Merge multiple presets
     * @param {Array<Object>} presets - Array of preset data objects
     * @returns {Object} Merged configuration
     */
    mergePresets: function(presets) {
      const merged = {
        apps: [],
        categories: {},
        quickActions: [],
        recommendations: []
      };

      // Track seen app IDs to avoid duplicates
      const seenAppIds = new Set();

      for (const preset of presets) {
        // Merge apps (avoid duplicates)
        for (const app of preset.apps || []) {
          if (!seenAppIds.has(app.id)) {
            merged.apps.push(app);
            seenAppIds.add(app.id);
          }
        }

        // Merge categories
        Object.assign(merged.categories, preset.categories || {});

        // Merge quick actions
        merged.quickActions.push(...(preset.quickActions || []));

        // Merge recommendations
        merged.recommendations.push(...(preset.recommendations || []));
      }

      console.log(`🔗 Merged ${presets.length} presets`);
      console.log(`   Total apps: ${merged.apps.length}`);

      return merged;
    },

    /**
     * Create custom preset from current configuration
     * @param {Array} apps - Current apps
     * @param {Object} categories - Current categories
     * @param {Object} metadata - Preset metadata
     * @returns {Object} Custom preset object
     */
    createCustomPreset: function(apps, categories, metadata = {}) {
      return {
        presetId: metadata.id || 'custom-' + Date.now(),
        name: metadata.name || 'Custom Preset',
        description: metadata.description || 'User-created preset',
        version: '1.0.0',
        targetAudience: metadata.audience || ['custom'],
        icon: metadata.icon || '⭐',
        color: metadata.color || '#6366f1',
        apps: apps,
        categories: categories,
        createdAt: new Date().toISOString(),
        isCustom: true
      };
    },

    /**
     * Export preset as downloadable JSON
     * @param {Object} presetData - Preset to export
     * @param {string} filename - Export filename
     */
    exportPreset: function(presetData, filename) {
      const json = JSON.stringify(presetData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `${presetData.presetId}.qlPreset`;
      a.click();

      URL.revokeObjectURL(url);
      console.log(`📤 Exported preset: ${presetData.name}`);
    },

    /**
     * Import preset from file
     * @param {File} file - .qlPreset file
     * @returns {Promise<Object>} Imported preset data
     */
    importPreset: async function(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);
            console.log(`📥 Imported preset: ${data.name}`);
            resolve(data);
          } catch (error) {
            reject(new Error('Invalid preset file format'));
          }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });
    }
  };

  console.log('📦 QuickLaunch Preset Loader ready');
  console.log(`   Available presets: ${Object.keys(AVAILABLE_PRESETS).length}`);
})();
