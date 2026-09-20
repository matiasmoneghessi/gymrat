import { ref } from 'vue';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

const SPREADSHEET_MIME_TYPES =
  'application/vnd.google-apps.spreadsheet,' +
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,' +
  'application/vnd.ms-excel,' +
  'text/csv';

interface PickedFile {
  id: string;
  name: string;
  mimeType: string;
}

export interface DriveFileContent {
  content: string;
  fileName: string;
  encoding: 'text' | 'base64';
  mimeType: string;
}

let gapiLoaded = false;
let gisLoaded = false;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

async function ensureGapiLoaded(): Promise<void> {
  if (gapiLoaded) return;
  await loadScript('https://apis.google.com/js/api.js');
  await new Promise<void>((resolve) => {
    (window as any).gapi.load('picker', () => resolve());
  });
  gapiLoaded = true;
}

async function ensureGisLoaded(): Promise<void> {
  if (gisLoaded) return;
  await loadScript('https://accounts.google.com/gsi/client');
  gisLoaded = true;
}

function getOAuthToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }
        resolve(response.access_token);
      },
    });
    client.requestAccessToken();
  });
}

function showPicker(oauthToken: string): Promise<PickedFile | null> {
  return new Promise((resolve) => {
    const google = (window as any).google;
    const docsView = new google.picker.DocsView()
      .setIncludeFolders(true)
      .setMimeTypes(SPREADSHEET_MIME_TYPES);

    const picker = new google.picker.PickerBuilder()
      .addView(docsView)
      .setOAuthToken(oauthToken)
      .setDeveloperKey(GOOGLE_API_KEY)
      .setCallback((data: any) => {
        if (data.action === google.picker.Action.PICKED) {
          const doc = data.docs[0];
          resolve({
            id: doc.id,
            name: doc.name,
            mimeType: doc.mimeType,
          });
        } else if (data.action === google.picker.Action.CANCEL) {
          resolve(null);
        }
      })
      .setTitle('Seleccioná un CSV o Excel con tu rutina')
      .build();

    picker.setVisible(true);
  });
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function isExcelMimeType(mimeType: string): boolean {
  return (
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimeType === 'application/vnd.ms-excel' ||
    mimeType === 'application/vnd.ms-excel.sheet.macroEnabled.12'
  );
}

async function downloadFileContent(
  fileId: string,
  mimeType: string,
  fileName: string,
  oauthToken: string,
): Promise<DriveFileContent> {
  const headers = { Authorization: `Bearer ${oauthToken}` };

  if (mimeType === 'application/vnd.google-apps.spreadsheet') {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/csv`,
      { headers },
    );
    if (!res.ok) throw new Error('Error al descargar la planilla de Google Sheets');
    const content = await res.text();
    return { content, fileName, encoding: 'text', mimeType: 'text/csv' };
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers,
  });
  if (!res.ok) throw new Error('Error al descargar el archivo');

  if (mimeType === 'text/csv' || fileName.toLowerCase().endsWith('.csv')) {
    return { content: await res.text(), fileName, encoding: 'text', mimeType: 'text/csv' };
  }

  if (isExcelMimeType(mimeType) || /\.xlsx?$/i.test(fileName)) {
    const buffer = await res.arrayBuffer();
    return {
      content: arrayBufferToBase64(buffer),
      fileName,
      encoding: 'base64',
      mimeType,
    };
  }

  throw new Error('Formato no soportado. Usá CSV o Excel (.xlsx, .xls).');
}

export function useGoogleDrivePicker() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function pickAndDownload(): Promise<DriveFileContent | null> {
    loading.value = true;
    error.value = null;

    try {
      if (!GOOGLE_CLIENT_ID || !GOOGLE_API_KEY) {
        throw new Error('Faltan VITE_GOOGLE_CLIENT_ID o VITE_GOOGLE_API_KEY en la configuración.');
      }

      await Promise.all([ensureGapiLoaded(), ensureGisLoaded()]);

      const oauthToken = await getOAuthToken();
      const file = await showPicker(oauthToken);

      if (!file) {
        loading.value = false;
        return null;
      }

      return await downloadFileContent(file.id, file.mimeType, file.name, oauthToken);
    } catch (err: any) {
      error.value = err.message || 'Error al acceder a Google Drive';
      return null;
    } finally {
      loading.value = false;
    }
  }

  return { pickAndDownload, loading, error };
}
