import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ── CONFIG ────────────────────────────────────────────────────────────────────
const SUPABASE_URL     = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON    = import.meta.env.VITE_SUPABASE_ANON_KEY;
const ADMIN_EMAIL      = "eagleeyefx1@gmail.com";
const supabase         = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── APP REGISTRY ──────────────────────────────────────────────────────────────
const APPS = [
  { id:"autoshop-pro",        name:"AutoShop Pro",        icon:"🔧", desc:"Auto Repair & Job Card Manager",        color:"#2E86AB" },
  { id:"bevtrack-pro",        name:"BevTrack Pro",         icon:"🍺", desc:"Beverage Retail & Stock Manager",       color:"#f59e0b" },
  { id:"pharmacare-pro",      name:"PharmaCare Pro",       icon:"💊", desc:"Pharmacy Management System",           color:"#00c896" },
  { id:"guesthouse-pro",      name:"GuestHouse Pro",       icon:"🏨", desc:"Hotel & Guesthouse Management",        color:"#c9a84c" },
  { id:"edusmart",            name:"EduSmart School Mgr",  icon:"🏫", desc:"School Management & Staff Portal",     color:"#C9A84C" },
  { id:"shop-inventory",      name:"Shop Inventory",       icon:"🛒", desc:"Multi-Shop Inventory Manager",         color:"#2563eb" },
  { id:"restaurant-manager",  name:"Restaurant Manager",   icon:"🍽️", desc:"Restaurant & Order Management",        color:"#f59e0b" },
  { id:"boutique-inventory",  name:"Boutique Inventory",   icon:"👗", desc:"Fashion & Boutique Stock Manager",     color:"#9333ea" },
  { id:"cosmetics-manager",   name:"Cosmetics Manager",    icon:"💄", desc:"Beauty & Cosmetics Store Manager",     color:"#d946a8" },
  { id:"hosteltrack-pro",     name:"HostelTrack Pro",      icon:"🔑", desc:"Multi-Property Hostel Management",     color:"#c4763f" },
  { id:"schoolms",            name:"SchoolMS",             icon:"📚", desc:"School Management & Staff Portal",     color:"#C9A84C" },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
const fmtDate  = d => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const daysLeft = d => d ? Math.max(0,Math.ceil((new Date(d)-new Date())/86400000)) : null;
const isExpired= d => d ? new Date(d)<new Date() : false;

// ── TOAST ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null;
  const bg = type==="ok" ? "#16a34a" : type==="warn" ? "#d97706" : "#dc2626";
  return (
    <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:bg,color:"#fff",borderRadius:10,padding:"12px 24px",fontWeight:700,fontSize:14,zIndex:1000,boxShadow:"0 8px 32px rgba(0,0,0,0.4)",whiteSpace:"nowrap"}}>
      {msg}
    </div>
  );
}

// ── AUTH SCREEN ───────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode,   setMode]   = useState("login");
  const [email,  setEmail]  = useState("");
  const [pass,   setPass]   = useState("");
  const [name,   setName]   = useState("");
  const [phone,  setPhone]  = useState("");
  const [biz,    setBiz]    = useState("");
  const [err,    setErr]    = useState("");
  const [loading,setLoading]= useState(false);

  const submit = async () => {
    setErr(""); setLoading(true);
    try {
      if (mode==="login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) { setErr(error.message || "Login failed. Check your email and password."); setLoading(false); return; }
        if (data?.session) onAuth(data.session);
      } else {
        if (!name||!email||!pass) { setErr("Please fill in all required fields."); setLoading(false); return; }
        if (pass.length < 6) { setErr("Password must be at least 6 characters."); setLoading(false); return; }
        const { data, error } = await supabase.auth.signUp({ email, password: pass, options:{ data:{ full_name:name, phone, business_name:biz } } });
        if (error) { setErr(error.message || "Registration failed. Please try again."); setLoading(false); return; }
        if (data?.session) {
          onAuth(data.session);
        } else if (data?.user) {
          // User created, try signing in immediately
          const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({ email, password: pass });
          if (loginErr) { setErr("Account created! Please sign in."); setMode("login"); }
          else if (loginData?.session) onAuth(loginData.session);
        } else {
          setErr("Something went wrong. Please try signing in instead.");
        }
      }
    } catch(e) {
      setErr("Connection error. Please check your internet and try again.");
    }
    setLoading(false);
  };

  const inp = { width:"100%", padding:"11px 13px", background:"#0f1628", border:"1.5px solid #1d3a6a", borderRadius:8, color:"#e2f0ff", fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit" };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#050d1a 0%,#0a1628 50%,#06101f 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Inter','Segoe UI',sans-serif"}}>
      <div style={{width:"min(94vw,440px)"}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:40,marginBottom:8}}>🦅</div>
          <div style={{fontSize:26,fontWeight:900,color:"#c9a84c",letterSpacing:1}}>EagleEyE Portal</div>
          <div style={{color:"#7aabcc",fontSize:13,marginTop:4}}>EagleEyE Business Software · Gilbert Oscar Prah</div>
        </div>

        <div style={{background:"#0f2040",border:"1px solid #1d3a6a",borderRadius:16,padding:"32px 28px",boxShadow:"0 24px 80px rgba(0,0,0,0.5)"}}>
          {/* Tabs */}
          <div style={{display:"flex",gap:8,marginBottom:24}}>
            {["login","register"].map(m=>(
              <button key={m} onClick={()=>{setMode(m);setErr("");}} style={{flex:1,padding:"10px 0",borderRadius:8,border:`2px solid ${mode===m?"#c9a84c":"#1d3a6a"}`,background:mode===m?"#c9a84c18":"transparent",color:mode===m?"#c9a84c":"#7aabcc",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"inherit",transition:"all .15s"}}>
                {m==="login"?"Sign In":"Create Account"}
              </button>
            ))}
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {mode==="register"&&(
              <>
                <div>
                  <label style={{fontSize:11,color:"#7aabcc",display:"block",marginBottom:5}}>Full Name *</label>
                  <input value={name} onChange={e=>setName(e.target.value)} placeholder="Kwame Asante" style={inp}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div>
                    <label style={{fontSize:11,color:"#7aabcc",display:"block",marginBottom:5}}>Phone</label>
                    <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="0244 123 456" style={inp}/>
                  </div>
                  <div>
                    <label style={{fontSize:11,color:"#7aabcc",display:"block",marginBottom:5}}>Business Name</label>
                    <input value={biz} onChange={e=>setBiz(e.target.value)} placeholder="Asante Shops" style={inp}/>
                  </div>
                </div>
              </>
            )}
            <div>
              <label style={{fontSize:11,color:"#7aabcc",display:"block",marginBottom:5}}>Email Address *</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" style={inp} onKeyDown={e=>e.key==="Enter"&&submit()}/>
            </div>
            <div>
              <label style={{fontSize:11,color:"#7aabcc",display:"block",marginBottom:5}}>Password *</label>
              <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" style={inp} onKeyDown={e=>e.key==="Enter"&&submit()}/>
            </div>
          </div>

          {err&&<div style={{color:"#f87171",fontSize:12,marginTop:10,padding:"8px 12px",background:"#7f1d1d22",borderRadius:6,border:"1px solid #f8717144"}}>{err}</div>}

          <button onClick={submit} disabled={loading} style={{width:"100%",marginTop:20,padding:"13px 0",background:"linear-gradient(135deg,#c9a84c,#a07830)",color:"#000",border:"none",borderRadius:10,fontWeight:900,fontSize:15,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit",opacity:loading?.7:1}}>
            {loading?"Please wait…":mode==="login"?"Sign In →":"Create Account →"}
          </button>

          <p style={{textAlign:"center",fontSize:12,color:"#7aabcc",marginTop:16,lineHeight:1.7}}>
            Need help? Contact <strong style={{color:"#c9a84c"}}>0597147460</strong> · <strong style={{color:"#c9a84c"}}>eagleeyefx1@gmail.com</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── APP CARD ──────────────────────────────────────────────────────────────────
function AppCard({ licence, appDef, onCopyKey }) {
  const dl     = daysLeft(licence.expiry_date);
  const exp    = isExpired(licence.expiry_date);
  const urgent = dl!==null && dl<=7 && !exp;

  const statusColor = exp?"#ef4444":urgent?"#f59e0b":"#16a34a";
  const statusLabel = exp?"Expired":licence.plan==="TRIAL"?`Trial · ${dl}d left`:`Active · ${dl}d left`;

  const launch = () => {
    if (!licence.app_url) { alert("App URL not set yet. Contact eagleeyefx1@gmail.com"); return; }
    const url = `${licence.app_url}?key=${encodeURIComponent(licence.licence_key)}`;
    window.open(url, "_blank");
  };

  return (
    <div style={{background:"#0f2040",border:`1px solid ${exp?"#ef444444":urgent?"#f59e0b44":"#1d3a6a"}`,borderRadius:14,padding:20,display:"flex",flexDirection:"column",gap:12,transition:"all .2s"}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:44,height:44,borderRadius:10,background:`${appDef.color}22`,border:`1px solid ${appDef.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>
          {appDef.icon}
        </div>
        <div style={{flex:1}}>
          <div style={{fontWeight:800,fontSize:15,color:"#e2f0ff"}}>{appDef.name}</div>
          <div style={{fontSize:11,color:"#7aabcc"}}>{appDef.desc}</div>
        </div>
        <div style={{fontSize:11,fontWeight:700,color:statusColor,background:`${statusColor}18`,border:`1px solid ${statusColor}44`,borderRadius:20,padding:"3px 10px",whiteSpace:"nowrap"}}>
          {statusLabel}
        </div>
      </div>

      {/* Licence key */}
      <div style={{background:"#06101f",borderRadius:8,padding:"10px 12px",display:"flex",alignItems:"center",gap:10}}>
        <code style={{flex:1,fontSize:12,color:"#c9a84c",letterSpacing:2,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{licence.licence_key}</code>
        <button onClick={()=>{navigator.clipboard.writeText(licence.licence_key);onCopyKey();}} style={{background:"transparent",border:"1px solid #1d3a6a",borderRadius:6,color:"#7aabcc",padding:"4px 10px",fontSize:11,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit"}}>Copy key</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
        {[["Plan",licence.plan],["Issued",fmtDate(licence.issued_at)],["Expires",fmtDate(licence.expiry_date)]].map(([l,v])=>(
          <div key={l} style={{background:"#06101f",borderRadius:6,padding:"7px 10px"}}>
            <div style={{fontSize:10,color:"#7aabcc",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{l}</div>
            <div style={{fontSize:12,color:"#e2f0ff",fontWeight:600}}>{v}</div>
          </div>
        ))}
      </div>

      <button onClick={launch} disabled={exp} style={{width:"100%",padding:"11px 0",background:exp?"#1d3a6a":`linear-gradient(135deg,${appDef.color},${appDef.color}cc)`,color:exp?"#7aabcc":"#fff",border:"none",borderRadius:8,fontWeight:800,fontSize:13,cursor:exp?"not-allowed":"pointer",fontFamily:"inherit",letterSpacing:.5}}>
        {exp?"⚠ Licence Expired":"🚀 Launch App"}
      </button>
    </div>
  );
}

// ── CLIENT DASHBOARD ──────────────────────────────────────────────────────────
function ClientDashboard({ profile, licences, onSignOut, showToast }) {
  const appLicences = licences.map(lic => ({
    ...lic,
    appDef: APPS.find(a=>a.id===lic.app_id) || { name:lic.app_id, icon:"📦", desc:"", color:"#7aabcc" }
  }));

  return (
    <div style={{minHeight:"100vh",background:"#050d1a",fontFamily:"'Inter','Segoe UI',sans-serif",color:"#e2f0ff"}}>
      {/* Header */}
      <div style={{background:"#0a1628",borderBottom:"1px solid #1d3a6a",padding:"14px 28px",display:"flex",alignItems:"center",gap:16}}>
        <span style={{fontSize:22}}>🦅</span>
        <div>
          <div style={{fontWeight:800,fontSize:16,color:"#c9a84c"}}>EagleEyE Portal</div>
          <div style={{fontSize:11,color:"#7aabcc"}}>Welcome back, {profile?.name||profile?.email}</div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:10,alignItems:"center"}}>
          {profile?.business_name&&<span style={{fontSize:12,color:"#7aabcc",background:"#0f2040",border:"1px solid #1d3a6a",borderRadius:20,padding:"4px 12px"}}>{profile.business_name}</span>}
          <button onClick={onSignOut} style={{background:"transparent",border:"1px solid #1d3a6a",borderRadius:8,color:"#7aabcc",padding:"7px 14px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Sign Out</button>
        </div>
      </div>

      <div style={{padding:"28px 28px",maxWidth:1100,margin:"0 auto"}}>
        {/* Stats bar */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:28}}>
          {[["Apps Licensed",licences.length],["Active",licences.filter(l=>!isExpired(l.expiry_date)).length],["Expiring Soon",licences.filter(l=>{ const d=daysLeft(l.expiry_date); return d!==null&&d<=30&&!isExpired(l.expiry_date); }).length]].map(([l,v])=>(
            <div key={l} style={{background:"#0f2040",border:"1px solid #1d3a6a",borderRadius:10,padding:"14px 18px"}}>
              <div style={{fontSize:11,color:"#7aabcc",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{l}</div>
              <div style={{fontSize:28,fontWeight:900,color:"#c9a84c"}}>{v}</div>
            </div>
          ))}
        </div>

        {appLicences.length===0?(
          <div style={{textAlign:"center",padding:"80px 20px",color:"#7aabcc"}}>
            <div style={{fontSize:48,marginBottom:16}}>📦</div>
            <div style={{fontWeight:700,fontSize:18,color:"#e2f0ff",marginBottom:8}}>No apps licensed yet</div>
            <p style={{fontSize:14,lineHeight:1.7}}>Contact EagleEyE to purchase a licence.<br/>Contact <strong style={{color:"#c9a84c"}}>0597147460</strong> or <strong style={{color:"#c9a84c"}}>eagleeyefx1@gmail.com</strong></p>
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:16}}>
            {appLicences.map(lic=>(
              <AppCard key={lic.id} licence={lic} appDef={lic.appDef} onCopyKey={()=>showToast("Licence key copied!","ok")} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── ADMIN PANEL ───────────────────────────────────────────────────────────────
function AdminPanel({ profile, onSignOut, showToast }) {
  const [tab,        setTab]        = useState("clients");
  const [clients,    setClients]    = useState([]);
  const [licences,   setLicences]   = useState([]);
  const [appUrls,    setAppUrls]    = useState({});
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(null);

  // Assign licence form
  const [selClient,  setSelClient]  = useState("");
  const [selApp,     setSelApp]     = useState("");
  const [licKey,     setLicKey]     = useState("");
  const [licPlan,    setLicPlan]    = useState("12M");
  const [licExpiry,  setLicExpiry]  = useState("");
  const [appUrlEdit, setAppUrlEdit] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    const { data: profs } = await supabase.from("profiles").select("*").order("created_at",{ascending:false});
    const { data: lics }  = await supabase.from("licences").select("*").order("issued_at",{ascending:false});
    const { data: aurls } = await supabase.from("app_urls").select("*");
    setClients(profs||[]);
    setLicences(lics||[]);
    const urlMap = {};
    (aurls||[]).forEach(r=>{ urlMap[r.app_id]=r.url; });
    setAppUrls(urlMap);
    setAppUrlEdit(urlMap);
    setLoading(false);
  },[]);

  useEffect(()=>{ load(); },[load]);

  const assignLicence = async () => {
    if (!selClient||!selApp||!licKey) { showToast("Fill in all fields","err"); return; }
    const appDef = APPS.find(a=>a.id===selApp);
    const { error } = await supabase.from("licences").insert({
      client_id: selClient,
      app_id: selApp,
      app_name: appDef?.name||selApp,
      app_url: appUrls[selApp]||"",
      licence_key: licKey.toUpperCase().trim(),
      plan: licPlan,
      expiry_date: licExpiry||null,
      status: "active"
    });
    if (error) { showToast("Error: "+error.message,"err"); return; }
    showToast("Licence assigned successfully!","ok");
    setModal(null); setSelClient(""); setSelApp(""); setLicKey(""); setLicPlan("12M"); setLicExpiry("");
    load();
  };

  const saveAppUrls = async () => {
    for (const [app_id, url] of Object.entries(appUrlEdit)) {
      await supabase.from("app_urls").upsert({ app_id, url },{ onConflict:"app_id" });
    }
    showToast("App URLs saved!","ok");
    load();
  };

  const deleteLicence = async (id) => {
    if (!confirm("Delete this licence?")) return;
    await supabase.from("licences").delete().eq("id",id);
    showToast("Licence deleted","warn");
    load();
  };

  const inp = { width:"100%", padding:"9px 11px", background:"#06101f", border:"1px solid #1d3a6a", borderRadius:7, color:"#e2f0ff", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" };

  return (
    <div style={{minHeight:"100vh",background:"#050d1a",fontFamily:"'Inter','Segoe UI',sans-serif",color:"#e2f0ff"}}>
      {/* Header */}
      <div style={{background:"#0a1628",borderBottom:"1px solid #1d3a6a",padding:"14px 28px",display:"flex",alignItems:"center",gap:16}}>
        <span style={{fontSize:22}}>🦅</span>
        <div>
          <div style={{fontWeight:800,fontSize:16,color:"#c9a84c"}}>EagleEyE Admin</div>
          <div style={{fontSize:11,color:"#7aabcc"}}>Portal Management · {profile?.email}</div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:10}}>
          <button onClick={()=>setModal("assign")} style={{background:"linear-gradient(135deg,#c9a84c,#a07830)",color:"#000",border:"none",borderRadius:8,padding:"8px 16px",fontWeight:800,cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>+ Assign Licence</button>
          <button onClick={onSignOut} style={{background:"transparent",border:"1px solid #1d3a6a",borderRadius:8,color:"#7aabcc",padding:"7px 14px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Sign Out</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{padding:"20px 28px 0",maxWidth:1200,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
          {[["Total Clients",clients.length],["Active Licences",licences.filter(l=>!isExpired(l.expiry_date)).length],["Expired",licences.filter(l=>isExpired(l.expiry_date)).length],["Total Licences",licences.length]].map(([l,v])=>(
            <div key={l} style={{background:"#0f2040",border:"1px solid #1d3a6a",borderRadius:10,padding:"14px 18px"}}>
              <div style={{fontSize:11,color:"#7aabcc",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{l}</div>
              <div style={{fontSize:28,fontWeight:900,color:"#c9a84c"}}>{v}</div>
            </div>
          ))}
        </div>

        {/* Nav tabs */}
        <div style={{display:"flex",gap:4,marginBottom:20,borderBottom:"1px solid #1d3a6a"}}>
          {[["clients","👥 Clients"],["licences","🔑 Licences"],["apps","🔗 App URLs"]].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{padding:"9px 18px",border:"none",background:"transparent",color:tab===id?"#c9a84c":"#7aabcc",borderBottom:tab===id?"2px solid #c9a84c":"2px solid transparent",cursor:"pointer",fontWeight:tab===id?800:400,fontSize:13,fontFamily:"inherit",marginBottom:-1}}>
              {label}
            </button>
          ))}
        </div>

        {loading?<div style={{textAlign:"center",padding:40,color:"#7aabcc"}}>Loading…</div>:(
          <>
            {/* CLIENTS TAB */}
            {tab==="clients"&&(
              <div style={{background:"#0f2040",border:"1px solid #1d3a6a",borderRadius:12,overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead>
                    <tr style={{borderBottom:"1px solid #1d3a6a"}}>
                      {["Name","Email","Business","Phone","Joined","Apps","Action"].map(h=>(
                        <th key={h} style={{padding:"12px 16px",textAlign:"left",fontSize:11,color:"#7aabcc",textTransform:"uppercase",letterSpacing:1,fontWeight:600}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {clients.filter(c=>c.role!=="admin").map((c,i)=>{
                      const cLics = licences.filter(l=>l.client_id===c.id);
                      return (
                        <tr key={c.id} style={{borderBottom:"1px solid #1d3a6a22",background:i%2===0?"transparent":"#06101f22"}}>
                          <td style={{padding:"11px 16px",fontWeight:600,color:"#e2f0ff"}}>{c.name||"—"}</td>
                          <td style={{padding:"11px 16px",color:"#7aabcc"}}>{c.email}</td>
                          <td style={{padding:"11px 16px",color:"#7aabcc"}}>{c.business_name||"—"}</td>
                          <td style={{padding:"11px 16px",color:"#7aabcc"}}>{c.phone||"—"}</td>
                          <td style={{padding:"11px 16px",color:"#7aabcc"}}>{fmtDate(c.created_at)}</td>
                          <td style={{padding:"11px 16px"}}>
                            <span style={{background:"#c9a84c22",color:"#c9a84c",border:"1px solid #c9a84c44",borderRadius:20,padding:"2px 10px",fontSize:12,fontWeight:700}}>{cLics.length}</span>
                          </td>
                          <td style={{padding:"11px 16px"}}>
                            <button onClick={()=>{ setSelClient(c.id); setModal("assign"); }} style={{background:"transparent",border:"1px solid #1d3a6a",borderRadius:6,color:"#7aabcc",padding:"4px 10px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>+ Licence</button>
                          </td>
                        </tr>
                      );
                    })}
                    {clients.filter(c=>c.role!=="admin").length===0&&(
                      <tr><td colSpan={7} style={{padding:"40px 16px",textAlign:"center",color:"#7aabcc"}}>No clients yet. Share your portal URL so clients can register.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* LICENCES TAB */}
            {tab==="licences"&&(
              <div style={{background:"#0f2040",border:"1px solid #1d3a6a",borderRadius:12,overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead>
                    <tr style={{borderBottom:"1px solid #1d3a6a"}}>
                      {["Client","App","Key","Plan","Expires","Status","Action"].map(h=>(
                        <th key={h} style={{padding:"12px 16px",textAlign:"left",fontSize:11,color:"#7aabcc",textTransform:"uppercase",letterSpacing:1,fontWeight:600}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {licences.map((l,i)=>{
                      const client = clients.find(c=>c.id===l.client_id);
                      const exp    = isExpired(l.expiry_date);
                      const appDef = APPS.find(a=>a.id===l.app_id);
                      return (
                        <tr key={l.id} style={{borderBottom:"1px solid #1d3a6a22",background:i%2===0?"transparent":"#06101f22"}}>
                          <td style={{padding:"11px 16px",color:"#e2f0ff",fontWeight:600}}>{client?.name||client?.email||"—"}</td>
                          <td style={{padding:"11px 16px"}}><span style={{fontSize:15}}>{appDef?.icon||"📦"}</span> {l.app_name}</td>
                          <td style={{padding:"11px 16px"}}><code style={{fontSize:11,color:"#c9a84c",letterSpacing:1}}>{l.licence_key}</code></td>
                          <td style={{padding:"11px 16px",color:"#7aabcc"}}>{l.plan}</td>
                          <td style={{padding:"11px 16px",color:"#7aabcc"}}>{fmtDate(l.expiry_date)}</td>
                          <td style={{padding:"11px 16px"}}>
                            <span style={{fontSize:11,fontWeight:700,color:exp?"#ef4444":"#16a34a",background:exp?"#ef444418":"#16a34a18",border:`1px solid ${exp?"#ef444444":"#16a34a44"}`,borderRadius:20,padding:"2px 8px"}}>{exp?"Expired":"Active"}</span>
                          </td>
                          <td style={{padding:"11px 16px"}}>
                            <button onClick={()=>deleteLicence(l.id)} style={{background:"transparent",border:"1px solid #ef444444",borderRadius:6,color:"#ef4444",padding:"4px 10px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Delete</button>
                          </td>
                        </tr>
                      );
                    })}
                    {licences.length===0&&(
                      <tr><td colSpan={7} style={{padding:"40px 16px",textAlign:"center",color:"#7aabcc"}}>No licences issued yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* APP URLS TAB */}
            {tab==="apps"&&(
              <div>
                <p style={{fontSize:13,color:"#7aabcc",marginBottom:16,lineHeight:1.7}}>
                  Enter each app's Vercel URL below. These are used to auto-activate licences when clients click Launch.
                </p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(420px,1fr))",gap:12}}>
                  {APPS.map(app=>(
                    <div key={app.id} style={{background:"#0f2040",border:"1px solid #1d3a6a",borderRadius:10,padding:16,display:"flex",alignItems:"center",gap:12}}>
                      <div style={{fontSize:22,flexShrink:0}}>{app.icon}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:700,color:"#e2f0ff",marginBottom:5}}>{app.name}</div>
                        <input value={appUrlEdit[app.id]||""} onChange={e=>setAppUrlEdit(prev=>({...prev,[app.id]:e.target.value}))} placeholder="https://your-app.vercel.app" style={{...inp,padding:"7px 9px",fontSize:12}}/>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={saveAppUrls} style={{marginTop:18,background:"linear-gradient(135deg,#c9a84c,#a07830)",color:"#000",border:"none",borderRadius:9,padding:"12px 28px",fontWeight:800,cursor:"pointer",fontSize:14,fontFamily:"inherit"}}>
                  💾 Save All URLs
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ASSIGN LICENCE MODAL */}
      {modal==="assign"&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}} onClick={()=>setModal(null)}>
          <div style={{background:"#0f2040",border:"1px solid #1d3a6a",borderRadius:16,padding:28,width:"min(94vw,480px)",boxShadow:"0 24px 80px rgba(0,0,0,0.6)"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:800,fontSize:18,color:"#c9a84c",marginBottom:20}}>🔑 Assign Licence</div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <label style={{fontSize:11,color:"#7aabcc",display:"block",marginBottom:5}}>Client *</label>
                <select value={selClient} onChange={e=>setSelClient(e.target.value)} style={{...inp}}>
                  <option value="">— Select client —</option>
                  {clients.filter(c=>c.role!=="admin").map(c=>(
                    <option key={c.id} value={c.id}>{c.name||c.email} {c.business_name?`· ${c.business_name}`:""}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{fontSize:11,color:"#7aabcc",display:"block",marginBottom:5}}>App *</label>
                <select value={selApp} onChange={e=>setSelApp(e.target.value)} style={{...inp}}>
                  <option value="">— Select app —</option>
                  {APPS.map(a=><option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:11,color:"#7aabcc",display:"block",marginBottom:5}}>Licence Key *</label>
                <input value={licKey} onChange={e=>setLicKey(e.target.value.toUpperCase())} placeholder="AUTOSHP-12M-XXXX-XXXX" style={{...inp,fontFamily:"monospace",letterSpacing:1}}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <label style={{fontSize:11,color:"#7aabcc",display:"block",marginBottom:5}}>Plan</label>
                  <select value={licPlan} onChange={e=>setLicPlan(e.target.value)} style={{...inp}}>
                    {["TRIAL","1M","6M","12M","2Y","3Y","5Y"].map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{fontSize:11,color:"#7aabcc",display:"block",marginBottom:5}}>Expiry Date</label>
                  <input type="date" value={licExpiry} onChange={e=>setLicExpiry(e.target.value)} style={{...inp}}/>
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button onClick={()=>setModal(null)} style={{flex:1,background:"transparent",border:"1px solid #1d3a6a",borderRadius:8,padding:"10px 0",color:"#7aabcc",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
              <button onClick={assignLicence} style={{flex:2,background:"linear-gradient(135deg,#c9a84c,#a07830)",color:"#000",border:"none",borderRadius:8,padding:"10px 0",fontWeight:900,cursor:"pointer",fontFamily:"inherit",fontSize:14}}>✅ Assign Licence</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function EagleEyEPortal() {
  const [session,  setSession]  = useState(null);
  const [profile,  setProfile]  = useState(null);
  const [licences, setLicences] = useState([]);
  const [toast,    setToast]    = useState({ msg:"", type:"ok" });
  const [loading,  setLoading]  = useState(true);

  const showToast = (msg, type="ok") => {
    setToast({ msg, type });
    setTimeout(()=>setToast({ msg:"", type:"ok" }), 3000);
  };

  const loadProfile = useCallback(async (sess) => {
    if (!sess) { setLoading(false); return; }
    const { data: prof } = await supabase.from("profiles").select("*").eq("id",sess.user.id).single();
    setProfile(prof);
    if (prof?.role!=="admin") {
      const { data: lics } = await supabase.from("licences").select("*").eq("client_id",sess.user.id);
      setLicences(lics||[]);
    }
    setLoading(false);
  },[]);

  useEffect(()=>{
    supabase.auth.getSession().then(({ data: { session: s } })=>{
      setSession(s);
      loadProfile(s);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_,s)=>{
      setSession(s);
      if (s) loadProfile(s); else { setProfile(null); setLicences([]); setLoading(false); }
    });
    return ()=>subscription.unsubscribe();
  },[loadProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null); setProfile(null); setLicences([]);
  };

  if (loading) return (
    <div style={{minHeight:"100vh",background:"#050d1a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Inter,sans-serif"}}>
      <div style={{textAlign:"center",color:"#7aabcc"}}>
        <div style={{fontSize:40,marginBottom:12}}>🦅</div>
        <div style={{fontWeight:700,color:"#c9a84c"}}>EagleEyE Portal</div>
        <div style={{fontSize:13,marginTop:8}}>Loading…</div>
      </div>
    </div>
  );

  if (!session) return <AuthScreen onAuth={(s)=>{ setSession(s); loadProfile(s); }} />;

  const isAdmin = session.user.email===ADMIN_EMAIL || profile?.role==="admin";

  return (
    <>
      {isAdmin
        ? <AdminPanel profile={profile} onSignOut={signOut} showToast={showToast} />
        : <ClientDashboard profile={profile} licences={licences} onSignOut={signOut} showToast={showToast} />
      }
      <Toast msg={toast.msg} type={toast.type} />
    </>
  );
}
