import { http, HttpResponse } from 'msw';

const API_URL = '/api/v1';

/**
 * Mock data for testing.
 */
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  access_level: 'full' as const,
};

export const mockSwimmer = {
  id: 'swimmer-1',
  name: 'Test Swimmer',
  birth_date: '2012-06-15',
  gender: 'female' as const,
  current_age: 13,
  current_age_group: '13-14' as const,
};

export const mockMeet = {
  id: 'meet-1',
  name: 'Test Championship',
  city: 'Toronto',
  country: 'Canada',
  start_date: '2026-01-15',
  end_date: '2026-01-15',  // Single-day meet for tests
  course_type: '25m' as const,
  time_count: 5,
};

export const mockTime = {
  id: 'time-1',
  meet_id: 'meet-1',
  event: '100FR' as const,
  time_ms: 65320,
  time_formatted: '1:05.32',
  notes: 'Heat 3',
  is_pb: true,
};

export const mockStandard = {
  id: 'standard-1',
  name: 'Test Standard',
  description: 'A test time standard',
  course_type: '25m' as const,
  gender: 'female' as const,
  is_preloaded: false,
};

export const mockStandardWithTimes = {
  ...mockStandard,
  times: [
    { event: '50FR', age_group: '13-14' as const, time_ms: 28500, time_formatted: '28.50' },
    { event: '100FR', age_group: '13-14' as const, time_ms: 62000, time_formatted: '1:02.00' },
  ],
};

/**
 * MSW handlers for mocking API endpoints.
 */
export const handlers = [
  // Health check
  http.get(`${API_URL}/health`, () => {
    return HttpResponse.json({ status: 'ok', version: '0.1.0' });
  }),

  // Auth
  http.get(`${API_URL}/auth/me`, () => {
    return HttpResponse.json(mockUser);
  }),

  // Swimmer
  http.get(`${API_URL}/swimmer`, () => {
    return HttpResponse.json(mockSwimmer);
  }),

  http.put(`${API_URL}/swimmer`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ ...mockSwimmer, ...(body as object) });
  }),

  // Meets
  http.get(`${API_URL}/meets`, ({ request }) => {
    const url = new URL(request.url);
    const courseType = url.searchParams.get('course_type');
    
    const meets = [mockMeet].filter(
      (m) => !courseType || m.course_type === courseType
    );
    
    return HttpResponse.json({
      meets,
      total: meets.length,
    });
  }),

  http.post(`${API_URL}/meets`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { id: 'new-meet-id', ...(body as object) },
      { status: 201 }
    );
  }),

  http.get(`${API_URL}/meets/:id`, ({ params }) => {
    const { id } = params;
    if (id === mockMeet.id) {
      return HttpResponse.json(mockMeet);
    }
    return HttpResponse.json({ error: 'not found' }, { status: 404 });
  }),

  http.put(`${API_URL}/meets/:id`, async ({ params, request }) => {
    const { id } = params;
    if (id === mockMeet.id) {
      const body = await request.json();
      return HttpResponse.json({ ...mockMeet, ...(body as object) });
    }
    return HttpResponse.json({ error: 'not found' }, { status: 404 });
  }),

  http.delete(`${API_URL}/meets/:id`, ({ params }) => {
    const { id } = params;
    if (id === mockMeet.id) {
      return new HttpResponse(null, { status: 204 });
    }
    return HttpResponse.json({ error: 'not found' }, { status: 404 });
  }),

  // Times
  http.get(`${API_URL}/times`, ({ request }) => {
    const url = new URL(request.url);
    const meetId = url.searchParams.get('meet_id');
    
    // Return empty list for unknown meet IDs
    if (meetId === 'no-times-meet') {
      return HttpResponse.json({
        times: [],
        total: 0,
      });
    }
    
    // Filter times by meet_id if provided
    const times = meetId && meetId !== mockTime.meet_id 
      ? [] 
      : [{
          ...mockTime,
          meet: {
            id: mockMeet.id,
            name: mockMeet.name,
            city: mockMeet.city,
            country: mockMeet.country,
            start_date: mockMeet.start_date,
            end_date: mockMeet.end_date,
            course_type: mockMeet.course_type,
          },
        }];
    
    return HttpResponse.json({
      times,
      total: times.length,
    });
  }),

  http.post(`${API_URL}/times`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { id: 'new-time-id', ...(body as object), time_formatted: '1:05.32' },
      { status: 201 }
    );
  }),

  http.post(`${API_URL}/times/batch`, async ({ request }) => {
    const body = (await request.json()) as { times: unknown[] };
    const times = (body.times || []).map((t: unknown, i: number) => ({
      id: `batch-time-${i}`,
      ...(t as object),
      time_formatted: '1:05.32',
    }));
    return HttpResponse.json(
      { times, new_pbs: ['100FR'] },
      { status: 201 }
    );
  }),

  http.delete(`${API_URL}/times/:id`, ({ params }) => {
    const { id } = params;
    if (id === mockTime.id || (id as string).startsWith('batch-time-')) {
      return new HttpResponse(null, { status: 204 });
    }
    return HttpResponse.json({ error: 'not found' }, { status: 404 });
  }),

  // Personal Bests
  http.get(`${API_URL}/personal-bests`, () => {
    return HttpResponse.json({
      course_type: '25m',
      personal_bests: [
        {
          event: '100FR',
          time_ms: 65320,
          time_formatted: '1:05.32',
          time_id: 'time-1',
          meet: 'Test Championship',
          date: '2026-01-15',
        },
      ],
    });
  }),

  // Standards
  http.get(`${API_URL}/standards`, () => {
    return HttpResponse.json({
      standards: [mockStandard],
    });
  }),

  http.get(`${API_URL}/standards/:id`, ({ params }) => {
    const { id } = params;
    if (id === mockStandard.id) {
      return HttpResponse.json(mockStandardWithTimes);
    }
    return HttpResponse.json({ error: 'not found' }, { status: 404 });
  }),

  http.post(`${API_URL}/standards`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { id: 'new-standard-id', is_preloaded: false, ...(body as object) },
      { status: 201 }
    );
  }),

  http.put(`${API_URL}/standards/:id`, async ({ params, request }) => {
    const { id } = params;
    if (id === mockStandard.id) {
      const body = await request.json();
      return HttpResponse.json({ ...mockStandard, ...(body as object) });
    }
    return HttpResponse.json({ error: 'not found' }, { status: 404 });
  }),

  http.delete(`${API_URL}/standards/:id`, ({ params }) => {
    const { id } = params;
    if (id === mockStandard.id) {
      return new HttpResponse(null, { status: 204 });
    }
    return HttpResponse.json({ error: 'not found' }, { status: 404 });
  }),

  http.put(`${API_URL}/standards/:id/times`, async ({ params, request }) => {
    const { id } = params;
    if (id === mockStandard.id) {
      const body = (await request.json()) as { times: unknown[] };
      const times = (body.times || []).map((t: unknown) => ({
        ...(t as object),
        time_formatted: '1:00.00',
      }));
      return HttpResponse.json({ ...mockStandard, times });
    }
    return HttpResponse.json({ error: 'not found' }, { status: 404 });
  }),

  http.post(`${API_URL}/standards/import`, async ({ request }) => {
    const body = (await request.json()) as { times: unknown[] };
    const times = (body.times || []).map((t: unknown) => ({
      ...(t as object),
      time_formatted: '1:00.00',
    }));
    return HttpResponse.json(
      { id: 'imported-standard-id', is_preloaded: false, ...(body as object), times },
      { status: 201 }
    );
  }),

  // Comparisons
  http.get(`${API_URL}/comparisons`, ({ request }) => {
    const url = new URL(request.url);
    const standardId = url.searchParams.get('standard_id');
    
    if (!standardId) {
      return HttpResponse.json({ error: 'standard_id is required' }, { status: 400 });
    }
    
    return HttpResponse.json({
      standard_id: standardId,
      standard_name: 'Test Standard',
      course_type: '25m',
      swimmer_name: 'Test Swimmer',
      swimmer_age_group: '13-14',
      threshold_percent: 3.0,
      comparisons: [
        {
          event: '50FR',
          status: 'achieved',
          swimmer_time_ms: 28000,
          swimmer_time_formatted: '28.00',
          standard_time_ms: 28500,
          standard_time_formatted: '28.50',
          difference_ms: -500,
          difference_formatted: '-0.50',
          difference_percent: -1.75,
          age_group: '13-14',
          meet_name: 'Test Championship',
          date: '2026-01-15',
        },
        {
          event: '100FR',
          status: 'almost',
          swimmer_time_ms: 63500,
          swimmer_time_formatted: '1:03.50',
          standard_time_ms: 62000,
          standard_time_formatted: '1:02.00',
          difference_ms: 1500,
          difference_formatted: '+1.50',
          difference_percent: 2.4,
          age_group: '13-14',
          meet_name: 'Test Championship',
          date: '2026-01-15',
        },
        {
          event: '200FR',
          status: 'not_achieved',
          swimmer_time_ms: 145000,
          swimmer_time_formatted: '2:25.00',
          standard_time_ms: 130000,
          standard_time_formatted: '2:10.00',
          difference_ms: 15000,
          difference_formatted: '+15.00',
          difference_percent: 11.5,
          age_group: '13-14',
          meet_name: 'Test Championship',
          date: '2026-01-15',
        },
        {
          event: '50BK',
          status: 'no_time',
          swimmer_time_ms: null,
          swimmer_time_formatted: null,
          standard_time_ms: 32000,
          standard_time_formatted: '32.00',
          difference_ms: null,
          difference_formatted: null,
          difference_percent: null,
          age_group: '13-14',
          meet_name: null,
          date: null,
        },
      ],
      summary: {
        total_events: 17,
        achieved: 1,
        almost: 1,
        not_achieved: 1,
        no_time: 14,
      },
    });
  }),

  // Progress
  http.get(`${API_URL}/progress/:event`, () => {
    return HttpResponse.json({
      event: '100FR',
      course_type: '25m',
      data_points: [],
    });
  }),

  // Data export/import
  http.get(`${API_URL}/data/export`, () => {
    return HttpResponse.json({
      version: '1.0',
      exported_at: new Date().toISOString(),
      swimmer: mockSwimmer,
      meets: [mockMeet],
      times: [mockTime],
      standards: [],
    });
  }),

  http.post(`${API_URL}/data/import`, () => {
    return HttpResponse.json({
      imported: { meets: 1, times: 1, standards: 0 },
    });
  }),
];

export default handlers;
