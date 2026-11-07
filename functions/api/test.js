export async function onRequest() {
  return Response.json({
    success: true,
    message: "VYOMA RP API is online"
  });
}
