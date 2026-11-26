import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getExtensionFromDataUri, downloadOriginalImage } from '../src/routes/Patient/routes/ImagingViewer/ImagingViewer';

describe('ImagingViewer original image download', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('detects common image and DICOM extensions from data URIs', () => {
    expect(getExtensionFromDataUri('data:image/jpeg;base64,/9j/4AAQ')).toBe('jpg');
    expect(getExtensionFromDataUri('data:image/png;base64,iVBORw0K')).toBe('png');
    expect(getExtensionFromDataUri('data:application/dicom;base64,AAAA')).toBe('dcm');

    const dicomBytes = new Uint8Array(133);
    dicomBytes[128] = 0x44; // D
    dicomBytes[129] = 0x49; // I
    dicomBytes[130] = 0x43; // C
    dicomBytes[131] = 0x4d; // M
    expect(getExtensionFromDataUri('data:application/octet-stream;base64,AAAA', dicomBytes)).toBe('dcm');
  });

  it('downloads a base64 data URI in its original format', async () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const clickSpy = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = originalCreateElement(tagName);
      if (tagName === 'a') {
        el.click = clickSpy;
      }
      return el;
    });

    await downloadOriginalImage('data:image/png;base64,iVBORw0KGgo=', 'Chest X-Ray');

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });
});
