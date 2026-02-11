const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:5000";
const PROMPT =
  process.env.SMOKE_PROMPT ||
  "Product inventory backend for 30 mins with title and metadata";

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const request = async (path, init = {}) => {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, init);
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  return { res, data, url };
};

const pretty = (value) => JSON.stringify(value, null, 2);

const sampleByType = (type, fieldName, step = 1) => {
  if (type === "string") return `${fieldName}-value-${step}`;
  if (type === "number") return step;
  if (type === "boolean") return true;
  return { sample: true, step };
};

const main = async () => {
  console.log(`Smoke test target: ${BASE_URL}`);
  console.log(`Build prompt: ${PROMPT}`);

  const build = await request("/ai/build", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: PROMPT })
  });
  assert(build.res.ok, `Build failed (${build.res.status}): ${pretty(build.data)}`);
  assert(build.data?.success, `Build response invalid: ${pretty(build.data)}`);

  const serviceId = build.data?.data?.serviceId;
  const accessToken = build.data?.data?.accessToken;
  assert(serviceId, "Missing serviceId in build response");
  assert(accessToken, "Missing accessToken in build response");
  console.log(`Service created: ${serviceId}`);

  const authHeaders = { "x-service-token": accessToken };

  const meta = await request(`/generated/${serviceId}/meta`, {
    headers: authHeaders
  });
  assert(meta.res.ok, `Meta failed (${meta.res.status}): ${pretty(meta.data)}`);
  assert(meta.data?.success, `Meta response invalid: ${pretty(meta.data)}`);
  assert(Array.isArray(meta.data?.resources) && meta.data.resources.length > 0, "No resources in meta");

  const resource = meta.data.resources[0]?.key;
  assert(resource, "No resource key found");
  console.log(`Using resource: ${resource}`);

  const resourceDef = meta.data.resources.find((item) => item.key === resource);
  assert(resourceDef, "Resource definition missing in meta");

  const createPayload = {};
  for (const field of resourceDef.fields || []) {
    if (field.required) {
      createPayload[field.name] = sampleByType(field.type, field.name, 1);
    }
  }
  if (Object.keys(createPayload).length === 0) {
    createPayload.name = "smoke-test";
  }

  const create = await request(`/generated/${serviceId}/${resource}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify(createPayload)
  });
  assert(create.res.ok, `Create failed (${create.res.status}): ${pretty(create.data)}`);
  assert(create.data?.success, `Create response invalid: ${pretty(create.data)}`);

  const recordId = create.data?.data?.id;
  assert(recordId, "Missing record id after create");
  console.log(`Record created: ${recordId}`);

  const list = await request(`/generated/${serviceId}/${resource}`, { headers: authHeaders });
  assert(list.res.ok, `List failed (${list.res.status}): ${pretty(list.data)}`);
  assert(Array.isArray(list.data?.data), `List response invalid: ${pretty(list.data)}`);
  assert(list.data.data.some((item) => item.id === recordId), "Created record not found in list");
  console.log("List check passed");

  const updatePayload = { ...createPayload };
  for (const field of resourceDef.fields || []) {
    updatePayload[field.name] = sampleByType(field.type, field.name, 2);
  }
  const update = await request(`/generated/${serviceId}/${resource}/${recordId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify(updatePayload)
  });
  assert(update.res.ok, `Update failed (${update.res.status}): ${pretty(update.data)}`);
  assert(update.data?.data?.title === updatePayload.title, "Update title did not persist");
  console.log("Update check passed");

  const del = await request(`/generated/${serviceId}/${resource}/${recordId}`, {
    method: "DELETE",
    headers: authHeaders
  });
  assert(del.res.ok, `Delete failed (${del.res.status}): ${pretty(del.data)}`);
  assert(del.data?.success, `Delete response invalid: ${pretty(del.data)}`);
  console.log("Delete check passed");

  const listAfterDelete = await request(`/generated/${serviceId}/${resource}`, { headers: authHeaders });
  assert(listAfterDelete.res.ok, `Post-delete list failed (${listAfterDelete.res.status})`);
  assert(
    !listAfterDelete.data?.data?.some((item) => item.id === recordId),
    "Record still exists after delete"
  );
  console.log("Post-delete verification passed");

  console.log("\nSmoke test completed successfully.");
};

main().catch((error) => {
  console.error("\nSmoke test failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
