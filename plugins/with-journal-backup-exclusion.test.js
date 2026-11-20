const {
  addIosBackupExclusion,
  ANDROID_DATA_EXTRACTION_RULES,
  ANDROID_FULL_BACKUP_RULES,
} = require('./with-journal-backup-exclusion');

const appDelegate = `public override func application(
  _ application: UIApplication,
  didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
) -> Bool {
  return true
}`;

describe('journal backup exclusion config plugin', () => {
  it('excludes the SQLite directory during iOS app launch', () => {
    const updated = addIosBackupExclusion(appDelegate);
    expect(updated).toContain('.appendingPathComponent("SQLite", isDirectory: true)');
    expect(updated).toContain('backupValues.isExcludedFromBackup = true');
    expect(updated).toContain('try journalDatabaseDirectory.setResourceValues(backupValues)');
  });

  it('does not inject the exclusion more than once', () => {
    const updated = addIosBackupExclusion(appDelegate);
    expect(addIosBackupExclusion(updated)).toBe(updated);
  });

  it('fails clearly when the iOS launch method is not found', () => {
    expect(() => addIosBackupExclusion('class AppDelegate {}')).toThrow(
      'Could not locate the iOS app launch method',
    );
  });

  it('excludes Android database storage from cloud and device-transfer backups', () => {
    expect(ANDROID_FULL_BACKUP_RULES).toContain('<exclude domain="database" path="." />');
    expect(ANDROID_DATA_EXTRACTION_RULES).toMatch(
      /<cloud-backup>[\s\S]*<exclude domain="database" path="\." \/>[\s\S]*<\/cloud-backup>/,
    );
    expect(ANDROID_DATA_EXTRACTION_RULES).toMatch(
      /<device-transfer>[\s\S]*<exclude domain="database" path="\." \/>[\s\S]*<\/device-transfer>/,
    );
  });
});
