// Same-origin JSON client for the local viewer server. A body makes the request a POST.
export async function api(path, input) {
  const r = await fetch(
    path,
    input === undefined
      ? {}
      : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        },
  );
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Request unavailable');
  return data;
}
