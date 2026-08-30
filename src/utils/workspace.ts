import { AttendanceRecord } from '../types';

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string; expires_in?: number }) => void;
            error_callback?: (err: unknown) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

// Default Google OAuth scopes requested during setup
export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/forms.responses.readonly'
].join(' ');

export interface SyncResult {
  success: boolean;
  message: string;
  eventId?: string;
  formId?: string;
  formUrl?: string;
}

export async function createGoogleCalendarAttendanceEvent(
  record: AttendanceRecord,
  token: string,
  userName: string = 'User'
): Promise<SyncResult> {
  try {
    const summary = `Attendance: ${record.status} (${userName})`;
    let description = `Attendance status for ${record.date}: ${record.status}`;
    if (record.checkIn || record.checkOut) {
      description += `\nCheck-in: ${record.checkIn || 'N/A'}\nCheck-out: ${record.checkOut || 'N/A'}`;
    }
    if (record.workingHours) {
      description += `\nTotal Hours: ${record.workingHours}h`;
    }
    if (record.notes) {
      description += `\nNotes: ${record.notes}`;
    }

    let startObj: { date?: string; dateTime?: string; timeZone?: string };
    let endObj: { date?: string; dateTime?: string; timeZone?: string };

    if (record.checkIn && record.checkOut) {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const startDateTime = `${record.date}T${record.checkIn}:00`;
      const endDateTime = `${record.date}T${record.checkOut}:00`;
      startObj = { dateTime: new Date(startDateTime).toISOString(), timeZone };
      endObj = { dateTime: new Date(endDateTime).toISOString(), timeZone };
    } else {
      startObj = { date: record.date };
      endObj = { date: record.date };
    }

    // Color ID: 10 = Green (Present), 11 = Red (Absent), 5 = Yellow (Half day)
    let colorId = '10';
    if (record.status === 'ABSENT') colorId = '11';
    if (record.status === 'HALF_DAY') colorId = '5';
    if (record.status === 'HOLIDAY') colorId = '7';

    const eventPayload = {
      summary,
      description,
      start: startObj,
      end: endObj,
      colorId,
      reminders: {
        useDefault: false,
        overrides: [{ method: 'popup', minutes: 30 }]
      }
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventPayload)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Calendar API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      message: `Successfully synced event to Google Calendar for ${record.date}`,
      eventId: data.id
    };
  } catch (error: any) {
    console.error('Error creating Google Calendar event:', error);
    return {
      success: false,
      message: error.message || 'Failed to sync to Google Calendar.'
    };
  }
}

export async function createGoogleAttendanceForm(
  token: string,
  formTitle: string = 'Daily Attendance Check-in'
): Promise<SyncResult> {
  try {
    // 1. Create the blank form
    const createResp = await fetch('https://forms.googleapis.com/v1/forms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        info: {
          title: formTitle,
          documentTitle: formTitle
        }
      })
    });

    if (!createResp.ok) {
      const err = await createResp.json().catch(() => ({}));
      throw new Error(err.error?.message || `Forms API error: ${createResp.statusText}`);
    }

    const formData = await createResp.json();
    const formId = formData.formId;
    const formUrl = formData.responderUri || `https://docs.google.com/forms/d/${formId}/viewform`;

    // 2. Add question items (Date, Attendance Status, Check-in Time, Check-out Time, Remarks)
    const batchUpdateResp = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            createItem: {
              item: {
                title: 'Attendance Date',
                description: 'Select the date for this record',
                questionItem: {
                  question: {
                    required: true,
                    dateQuestion: {
                      includeYear: true,
                      includeTime: false
                    }
                  }
                }
              },
              location: { index: 0 }
            }
          },
          {
            createItem: {
              item: {
                title: 'Attendance Status',
                questionItem: {
                  question: {
                    required: true,
                    choiceQuestion: {
                      type: 'RADIO',
                      options: [
                        { value: 'Present' },
                        { value: 'Absent' },
                        { value: 'Half Day' },
                        { value: 'Holiday' }
                      ],
                      shuffle: false
                    }
                  }
                }
              },
              location: { index: 1 }
            }
          },
          {
            createItem: {
              item: {
                title: 'Check-in Time',
                questionItem: {
                  question: {
                    required: false,
                    timeQuestion: {
                      duration: false
                    }
                  }
                }
              },
              location: { index: 2 }
            }
          },
          {
            createItem: {
              item: {
                title: 'Check-out Time',
                questionItem: {
                  question: {
                    required: false,
                    timeQuestion: {
                      duration: false
                    }
                  }
                }
              },
              location: { index: 3 }
            }
          },
          {
            createItem: {
              item: {
                title: 'Daily Notes / Remarks',
                questionItem: {
                  question: {
                    required: false,
                    textQuestion: {
                      paragraph: true
                    }
                  }
                }
              },
              location: { index: 4 }
            }
          }
        ]
      })
    });

    if (!batchUpdateResp.ok) {
      console.warn('Form created but batch update had warnings');
    }

    return {
      success: true,
      message: 'Google Attendance Check-in Form created successfully!',
      formId,
      formUrl
    };
  } catch (error: any) {
    console.error('Error creating Google Form:', error);
    return {
      success: false,
      message: error.message || 'Failed to create Google Form.'
    };
  }
}
