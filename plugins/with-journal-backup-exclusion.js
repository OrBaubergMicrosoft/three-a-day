const fs = require('node:fs/promises');
const path = require('node:path');
const { withAppDelegate, withAndroidManifest, withDangerousMod } = require('expo/config-plugins');

const MARKER = '// Exclude the journal database from device backups.';
const ANDROID_FULL_BACKUP_RULES = `<?xml version="1.0" encoding="utf-8"?>
<full-backup-content>
  <exclude domain="database" path="." />
</full-backup-content>
`;
const ANDROID_DATA_EXTRACTION_RULES = `<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
  <cloud-backup>
    <exclude domain="database" path="." />
  </cloud-backup>
  <device-transfer>
    <exclude domain="database" path="." />
  </device-transfer>
</data-extraction-rules>
`;

function addIosBackupExclusion(contents) {
  if (contents.includes(MARKER)) return contents;

  const applicationMethod =
    /((?:public\s+)?override\s+func\s+application\s*\([\s\S]*?\)\s*->\s*Bool\s*\{)/;
  if (!applicationMethod.test(contents)) {
    throw new Error('Could not locate the iOS app launch method for journal backup exclusion.');
  }

  return contents.replace(
    applicationMethod,
    `$1
    ${MARKER}
    let journalDatabaseDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
      .appendingPathComponent("SQLite", isDirectory: true)
    do {
      try FileManager.default.createDirectory(at: journalDatabaseDirectory, withIntermediateDirectories: true)
      var backupValues = URLResourceValues()
      backupValues.isExcludedFromBackup = true
      try journalDatabaseDirectory.setResourceValues(backupValues)
    } catch {
      NSLog("Unable to exclude journal database from device backups: %@", error.localizedDescription)
      return false
    }`,
  );
}

module.exports = function withJournalBackupExclusion(config) {
  config = withAppDelegate(config, (config) => {
    if (config.modResults.language !== 'swift') {
      throw new Error('Journal backup exclusion currently requires a Swift AppDelegate.');
    }
    config.modResults.contents = addIosBackupExclusion(config.modResults.contents);
    return config;
  });

  config = withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];
    if (!application) throw new Error('Could not locate the Android application manifest entry.');
    application.$['android:allowBackup'] = 'true';
    application.$['android:fullBackupContent'] = '@xml/backup_rules';
    application.$['android:dataExtractionRules'] = '@xml/data_extraction_rules';
    return config;
  });

  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const xmlDirectory = path.join(config.modRequest.platformProjectRoot, 'app', 'src', 'main', 'res', 'xml');
      await fs.mkdir(xmlDirectory, { recursive: true });
      await Promise.all([
        fs.writeFile(path.join(xmlDirectory, 'backup_rules.xml'), ANDROID_FULL_BACKUP_RULES),
        fs.writeFile(path.join(xmlDirectory, 'data_extraction_rules.xml'), ANDROID_DATA_EXTRACTION_RULES),
      ]);
      return config;
    },
  ]);
  return config;
};

module.exports.addIosBackupExclusion = addIosBackupExclusion;
module.exports.ANDROID_FULL_BACKUP_RULES = ANDROID_FULL_BACKUP_RULES;
module.exports.ANDROID_DATA_EXTRACTION_RULES = ANDROID_DATA_EXTRACTION_RULES;
