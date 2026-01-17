import { http, HttpResponse } from 'msw';

const API_URL = '/api';

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
  date: '2026-01-15',
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
  http.get(`${API_URL}/times`, () => {
    return HttpResponse.json({
      times: [mockTime],
      total: 1,
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
      standards: [],
    });
  }),

  // Comparisons
  http.get(`${API_URL}/comparisons`, () => {
    return HttpResponse.json({
      standard: { id: 'std-1', name: 'Test Standard', course_type: '25m' },
      course_type: '25m',
      age_group: '13-14',
      comparisons: [],
      summary: { achieved: 0, close: 0, not_achieved: 0, no_time: 17 },
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
