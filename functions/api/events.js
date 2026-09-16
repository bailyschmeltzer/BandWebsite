export async function onRequestGet({ env }) {
  try {
    const raw = await env.NEON_KV.get("events");
    const events = raw ? JSON.parse(raw) : [];
    return Response.json(events);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function onRequestPost({ request, env }) {
  const auth = request.headers.get("Authorization");
  if (!auth || auth !== `Bearer ${env.ADMIN_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const raw = await env.NEON_KV.get("events");
    let events = raw ? JSON.parse(raw) : [];

    const newEvent = {
      id: "ev-" + Date.now(),
      date: data.date,
      venue: data.venue,
      location: data.location,
      link: data.link || '#',
      createdAt: Date.now()
    };

    events.unshift(newEvent);
    await env.NEON_KV.put("events", JSON.stringify(events));

    return Response.json({ success: true, event: newEvent });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function onRequestPut({ request, env }) {
  const auth = request.headers.get("Authorization");
  if (!auth || auth !== `Bearer ${env.ADMIN_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const raw = await env.NEON_KV.get("events");
    let events = raw ? JSON.parse(raw) : [];

    const idx = events.findIndex(ev => ev.id === data.id);
    if (idx === -1) {
      return Response.json({ error: "Event not found" }, { status: 404 });
    }

    events[idx] = {
      ...events[idx],
      date: data.date,
      venue: data.venue,
      location: data.location,
      link: data.link || '#'
    };

    await env.NEON_KV.put("events", JSON.stringify(events));
    return Response.json({ success: true, event: events[idx] });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function onRequestDelete({ request, env }) {
  const auth = request.headers.get("Authorization");
  if (!auth || auth !== `Bearer ${env.ADMIN_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    const raw = await env.NEON_KV.get("events");
    let events = raw ? JSON.parse(raw) : [];

    events = events.filter(ev => ev.id !== id);
    await env.NEON_KV.put("events", JSON.stringify(events));

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}