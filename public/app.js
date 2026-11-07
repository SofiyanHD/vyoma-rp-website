const $ = (s) => document.querySelector(s);
async function loadStatus(){
  try {
    const r = await fetch("/api/status"); const d = await r.json();
    $("#status-dot").className = "dot " + (d.online ? "online" : "offline");
    $("#status-text").textContent = d.online ? "SERVER ONLINE" : "SERVER OFFLINE";
    $("#player-count").textContent = d.online ? `${d.playersOnline}/${d.playersMax}` : "—";
    $("#server-players").textContent = d.online ? `${d.playersOnline} / ${d.playersMax}` : "Offline";
    $("#server-version").textContent = d.version || "Paper 26.3";
    $("#server-address").textContent = d.host || "vyomarp.raznar.net:25045";
  } catch { $("#status-text").textContent = "STATUS UNAVAILABLE"; }
}
loadStatus(); setInterval(loadStatus, 30000);
fetch("/api/config").then(r=>r.json()).then(d=>{ if(d.discord) $("#discord-link").href=d.discord; });
$("#apply-form").addEventListener("submit", async e => {
  e.preventDefault(); const msg=$("#form-message"); msg.textContent="Mengirim…";
  const data=Object.fromEntries(new FormData(e.currentTarget));
  try { const r=await fetch("/api/apply",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)}); const d=await r.json(); msg.textContent=d.message||d.error; if(r.ok)e.currentTarget.reset(); }
  catch { msg.textContent="Gagal mengirim. Coba lagi nanti."; }
});