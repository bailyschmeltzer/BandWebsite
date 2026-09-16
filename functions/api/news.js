export async function onRequestGet({ env }) {
  try {
    const raw = await env.NEON_KV.get("news");
    const news = raw ? JSON.parse(raw) : [];
    return Response.json(news);
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
    const raw = await env.NEON_KV.get("news");
    let news = raw ? JSON.parse(raw) : [];

    const newPost = {
      id: "news-" + Date.now(),
      title: data.title,
      date: data.date,
      body: data.body,
      createdAt: Date.now()
    };

    news.unshift(newPost);
    await env.NEON_KV.put("news", JSON.stringify(news));

    return Response.json({ success: true, post: newPost });
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
    const raw = await env.NEON_KV.get("news");
    let news = raw ? JSON.parse(raw) : [];

    news = news.filter(p => p.id !== id);
    await env.NEON_KV.put("news", JSON.stringify(news));

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}