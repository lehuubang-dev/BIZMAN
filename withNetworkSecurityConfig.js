const { withAndroidManifest, withDangerousMod, AndroidConfig } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const networkSecurityConfigContent = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">api.eduhubvn.com</domain>
        <domain includeSubdomains="true">demoportal.ccvi.com.vn</domain>
        <domain includeSubdomains="true">192.168.5.113</domain>
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
    </domain-config>
</network-security-config>`;

const withNetworkSecurityConfig = (config) => {
  // Add network security config to AndroidManifest
  config = withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    if (androidManifest.application && androidManifest.application[0]) {
      androidManifest.application[0].$['android:networkSecurityConfig'] = 
        '@xml/network_security_config';
      androidManifest.application[0].$['android:usesCleartextTraffic'] = 'true';
    }

    return config;
  });

  // Create the network_security_config.xml file
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const platformProjectRoot = config.modRequest.platformProjectRoot;
      
      const xmlDir = path.join(platformProjectRoot, 'app', 'src', 'main', 'res', 'xml');
      const xmlFilePath = path.join(xmlDir, 'network_security_config.xml');

      // Create xml directory if it doesn't exist
      if (!fs.existsSync(xmlDir)) {
        fs.mkdirSync(xmlDir, { recursive: true });
      }

      // Write the network security config file
      fs.writeFileSync(xmlFilePath, networkSecurityConfigContent);

      return config;
    },
  ]);

  return config;
};

module.exports = withNetworkSecurityConfig;
