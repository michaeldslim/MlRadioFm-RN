import { en } from '../locales/en';
import { ko } from '../locales/ko';

describe('localization', () => {
  it('ko has the same keys as en', () => {
    const enKeys = Object.keys(en);
    const koKeys = Object.keys(ko);

    // Same number of keys
    expect(koKeys.length).toBe(enKeys.length);

    // Every EN key exists in KO
    for (const key of enKeys) {
      expect(ko).toHaveProperty(key);
    }
  });

  it('has expected example translations', () => {
    // English
    expect(en.appTitle).toBe('ML Radio FM');
    expect(en.language).toBe('Language');
    expect(en.korean).toBe('한국어');

    // Korean
    expect(ko.appTitle).toBe('ML 라디오 FM');
    expect(ko.language).toBe('언어');
    expect(ko.korean).toBe('한국어');
  });
});
