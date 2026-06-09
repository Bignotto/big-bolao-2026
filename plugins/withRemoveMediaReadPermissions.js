const { withAndroidManifest } = require('@expo/config-plugins');

const PERMISSIONS_TO_REMOVE = [
  'android.permission.READ_MEDIA_IMAGES',
  'android.permission.READ_MEDIA_VIDEO',
  'android.permission.READ_MEDIA_AUDIO',
  'android.permission.READ_MEDIA_VISUAL_USER_SELECTED',
  'android.permission.READ_EXTERNAL_STORAGE',
];

module.exports = function withRemoveMediaReadPermissions(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const permissions = manifest.manifest['uses-permission'] || [];
    manifest.manifest['uses-permission'] = permissions.filter(
      (p) => !PERMISSIONS_TO_REMOVE.includes(p.$['android:name'])
    );
    return config;
  });
};
