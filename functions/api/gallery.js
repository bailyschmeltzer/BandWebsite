export async function onRequestGet({ env }) {
  try {
    const raw = await env.NEON_KV.get("gallery");
    const gallery = raw ? JSON.parse(raw) : [];
    return Response.json(gallery);
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
    const raw = await env.NEON_KV.get("gallery");
    let gallery = raw ? JSON.parse(raw) : [];

    // Sanitize Imgur URLs: turn imgur.com/xyz into i.imgur.com/xyz.png if needed
    let imgUrl = data.url.trim();
    if (imgUrl.includes("imgur.com") && !imgUrl.includes("i.imgur.com") && !imgUrl.endsWith(".png") && !imgUrl.endsWith(".jpg") && !imgUrl.endsWith(".jpeg") && !imgUrl.endsWith(".webp")) {
      const parts = imgUrl.split("/");
      const id = parts[parts.length - 1];
      imgUrl = `https://i.imgur.com/${id}.png`;
    }

    const newPhoto = {
      id: "photo-" + Date.now(),
      url: imgUrl,
      caption: data.caption || "",
      createdAt: Date.now()
    };

    gallery.unshift(newPhoto);
    await env.NEON_KV.put("gallery", JSON.stringify(gallery));

    return Response.json({ success: true, photo: newPhoto });
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
    const raw = await env.NEON_KV.get("gallery");
    let gallery = raw ? JSON.parse(raw) : [];

    const idx = gallery.findIndex(p => p.id === data.id);
    if (idx === -1) {
      return Response.json({ error: "Photo not found" }, { status: 404 });
    }

    let imgUrl = data.url.trim();
    if (imgUrl.includes("imgur.com") && !imgUrl.includes("i.imgur.com") && !imgUrl.endsWith(".png") && !imgUrl.endsWith(".jpg") && !imgUrl.endsWith(".jpeg") && !imgUrl.endsWith(".webp")) {
      const parts = imgUrl.split("/");
      const id = parts[parts.length - 1];
      imgUrl = `https://i.imgur.com/${id}.png`;
    }

    gallery[idx] = {
      ...gallery[idx],
      url: imgUrl,
      caption: data.caption || ""
    };

    await env.NEON_KV.put("gallery", JSON.stringify(gallery));
    return Response.json({ success: true, photo: gallery[idx] });
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
    const raw = await env.NEON_KV.get("gallery");
    let gallery = raw ? JSON.parse(raw) : [];

    gallery = gallery.filter(p => p.id !== id);
    await env.NEON_KV.put("gallery", JSON.stringify(gallery));

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}