import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Provider setup
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/gmail.send');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  // Load token from local storage if available (temporary cache, but memory preferred per guidelines. Let's store in localStorage with safety check)
  const savedToken = localStorage.getItem('google_access_token');
  if (savedToken) {
    cachedAccessToken = savedToken;
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      // Clear if signed out
      if (!user) {
        cachedAccessToken = null;
        localStorage.removeItem('google_access_token');
      }
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google OAuth payload');
    }

    cachedAccessToken = credential.accessToken;
    localStorage.setItem('google_access_token', cachedAccessToken);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Get active token
export const getAccessToken = (): string | null => {
  return cachedAccessToken || localStorage.getItem('google_access_token');
};

// Sign out
export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  localStorage.removeItem('google_access_token');
};

/**
 * Creates a brand new Google Spreadsheet named "Founder-Being Sync Spreadsheet"
 * setup with the necessary column headers.
 */
export const createSyncSpreadsheet = async (accessToken: string): Promise<string> => {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: 'Founder-Being Wellbeing Database - 2026'
      },
      sheets: [
        {
          properties: {
            title: 'Submissions'
          },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: [
                    { userEnteredValue: { stringValue: 'Submission Type' } },
                    { userEnteredValue: { stringValue: 'Timestamp' } },
                    { userEnteredValue: { stringValue: 'Name' } },
                    { userEnteredValue: { stringValue: 'Email' } },
                    { userEnteredValue: { stringValue: 'Company / Stage' } },
                    { userEnteredValue: { stringValue: 'Primary Details / Reason' } },
                    { userEnteredValue: { stringValue: 'Challenges / Notes' } }
                  ]
                }
              ]
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Failed to create spreadsheet');
  }

  const data = await response.json();
  return data.spreadsheetId;
};

/**
 * Appends a submission row to the specified Spreadsheet.
 */
export const appendSubmissionToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  payload: {
    type: 'RSVP' | 'Waitlist' | 'Invitation';
    name: string;
    email: string;
    meta1: string; // Company OR Stage
    meta2: string; // Dietary OR Reason OR Stage Option
    details: string; // Challenges OR Extra info
  }
): Promise<void> => {
  const timestamp = new Date().toLocaleString();
  const values = [
    [
      payload.type,
      timestamp,
      payload.name,
      payload.email,
      payload.meta1,
      payload.meta2,
      payload.details
    ]
  ];

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Submissions!A:G:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values
      })
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Failed to append to spreadsheet');
  }
};

/**
 * Sends an email notification using the Gmail API.
 */
export const sendEmailNotification = async (
  accessToken: string,
  toEmail: string,
  subject: string,
  bodyHtml: string
): Promise<void> => {
  const emailContent = [
    `To: ${toEmail}`,
    `Subject: ${subject}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    bodyHtml
  ].join('\r\n');

  // Base64URL-encode the MIME email string
  const base64Safe = btoa(unescape(encodeURIComponent(emailContent)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      raw: base64Safe
    })
  });

  if (!response.ok) {
    const err = await response.json();
    console.error('Gmail API error:', err);
    throw new Error(err.error?.message || 'Failed to send email notification');
  }
};

/**
 * Sends a Slack Webhook notification payload to the specified webhook URL.
 */
export const sendSlackNotification = async (
  webhookUrl: string,
  message: string
): Promise<void> => {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: message
    }),
    mode: 'no-cors' // Slack Webhook does not authorize browser CORS, no-cors forces send without reading response
  });
};
