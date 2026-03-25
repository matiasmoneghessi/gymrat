import { ref } from 'vue';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

interface PickedFile {
  id: string;
  name: string;
  mimeType: string;
}

let gapiLoaded = false;
let gisLoaded = false;
let pickerApiLoaded = false;

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
    (window as any).gapi.load('picker', () => {
      pickerApiLoaded = true;
      resolve();
    });
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
      .setMimeTypes(
        'application/vnd.google-apps.spreadsheet,' +
        'application/vnd.google-apps.document,' +
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,' +
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document,' +
        'text/plain,' +
        'text/csv,' +
        'application/pdf'
      );

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
      .setTitle('Seleccioná el archivo de tu rutina')
      .build();

    picker.setVisible(true);
  });
}

async function downloadFileContent(fileId: string, mimeType: string, oauthToken: string): Promise<string> {
  const headers = { Authorization: `Bearer ${oauthToken}` };

  // Google Docs/Sheets need to be exported as text
  if (mimeType === 'application/vnd.google-apps.spreadsheet') {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/csv`,
      { headers },
    );
    if (!res.ok) throw new Error('Error al descargar el archivo');
    return res.text();
  }

  if (mimeType === 'application/vnd.google-apps.document') {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`,
      { headers },
    );
    if (!res.ok) throw new Error('Error al descargar el archivo');
    return res.text();
  }

  // Binary files (xlsx, docx, pdf) - download and read as text
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers },
  );
  if (!res.ok) throw new Error('Error al descargar el archivo');

  // For CSV/text files, return as text
  if (mimeType === 'text/plain' || mimeType === 'text/csv') {
    return res.text();
  }

  // For xlsx/docx/pdf, we can't easily parse them in the browser.
  // Request as text/csv export if spreadsheet, otherwise get text content
  // For binary formats, read as text (the backend + OpenAI will handle it)
  return res.text();
}

export function useGoogleDrivePicker() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function pickAndDownload(): Promise<{ content: string; fileName: string } | null> {
    loading.value = true;
    error.value = null;

    try {
      await Promise.all([ensureGapiLoaded(), ensureGisLoaded()]);

      const oauthToken = await getOAuthToken();
      const file = await showPicker(oauthToken);

      if (!file) {
        loading.value = false;
        return null; // User cancelled
      }

      const content = await downloadFileContent(file.id, file.mimeType, oauthToken);

      return { content, fileName: file.name };
    } catch (err: any) {
      error.value = err.message || 'Error al acceder a Google Drive';
      return null;
    } finally {
      loading.value = false;
    }
  }

  return { pickAndDownload, loading, error };
}
