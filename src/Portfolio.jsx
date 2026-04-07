import { useState, useEffect } from "react";

const LANG_COLORS = {
  JavaScript: "#f7df1e",
  TypeScript: "#3178c6",
  Python: "#3776ab",
  SQL: "#e38c00",
  R: "#276dc3",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  "Jupyter Notebook": "#da5b0b",
  Scala: "#c22d40",
  Go: "#00add8",
  Rust: "#dea584",
  Java: "#b07219",
  Ruby: "#701516",
};

function useGitHub(username) {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [userRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${username}`),
          fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`),
        ]);
        if (!userRes.ok) throw new Error("User not found");
        const userData = await userRes.json();
        const reposData = await reposRes.json();
        setUser(userData);
        setRepos(
          reposData
            .filter((r) => !r.fork)
            .sort(
              (a, b) =>
                b.stargazers_count - a.stargazers_count ||
                new Date(b.updated_at) - new Date(a.updated_at)
            )
        );
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [username]);

  return { user, repos, loading, error };
}

function RepoCard({ repo, index }) {
  const color = LANG_COLORS[repo.language] || "#888780";
  const isRecent =
    Date.now() - new Date(repo.updated_at) < 1000 * 60 * 60 * 24 * 30;

  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        flexDirection: "column",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "24px",
        textDecoration: "none",
        color: "inherit",
        transition: "border-color 0.2s, transform 0.2s",
        animation: `fadeUp 0.4s ease ${index * 0.04}s both`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border2)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.querySelector(".arrow").style.opacity = "1";
        e.currentTarget.querySelector(".arrow").style.transform =
          "translate(2px, -2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.querySelector(".arrow").style.opacity = "0";
        e.currentTarget.querySelector(".arrow").style.transform =
          "translate(0, 0)";
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "15px",
            fontWeight: 700,
            color: "var(--text)",
            flex: 1,
            marginRight: "8px",
            lineHeight: 1.3,
            wordBreak: "break-word",
          }}
        >
          {repo.name}
        </span>
        <span
          className="arrow"
          style={{
            color: "var(--accent)",
            fontSize: "18px",
            opacity: 0,
            transition: "all 0.2s",
            flexShrink: 0,
            marginTop: "2px",
          }}
        >
          ↗
        </span>
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: "12px",
          color: "var(--muted)",
          lineHeight: 1.65,
          flex: 1,
          marginBottom: "20px",
          margin: "0 0 20px",
        }}
      >
        {repo.description || "no description provided."}
      </p>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
        {repo.language && (
          <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "var(--muted)" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: color,
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            {repo.language}
          </span>
        )}
        {repo.stargazers_count > 0 && (
          <span style={{ fontSize: "11px", color: "var(--muted)" }}>
            ★ {repo.stargazers_count}
          </span>
        )}
        {repo.forks_count > 0 && (
          <span style={{ fontSize: "11px", color: "var(--muted)" }}>
            ⑂ {repo.forks_count}
          </span>
        )}
        {isRecent && (
          <span
            style={{
              fontSize: "10px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "3px 8px",
              borderRadius: "100px",
              background: "rgba(200,240,96,0.1)",
              color: "var(--accent)",
              border: "1px solid rgba(200,240,96,0.2)",
              marginLeft: "auto",
            }}
          >
            recent
          </span>
        )}
      </div>
    </a>
  );
}

export default function Portfolio() {
  const USERNAME = "thestronganalyst";
  const { user, repos, loading, error } = useGitHub(USERNAME);
  const [activeFilter, setActiveFilter] = useState("all");

  const langs = [...new Set(repos.map((r) => r.language).filter(Boolean))].sort();
  const filtered =
    activeFilter === "all"
      ? repos
      : repos.filter((r) => r.language === activeFilter);

  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap');

    :root {
      --bg: #0a0a0b;
      --surface: #111113;
      --border: rgba(255,255,255,0.07);
      --border2: rgba(255,255,255,0.13);
      --text: #f0efe8;
      --muted: #6b6a64;
      --accent: #c8f060;
      --accent2: #60d4f0;
      --font-display: 'Syne', sans-serif;
      --font-mono: 'DM Mono', monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-mono);
      min-height: 100vh;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    @keyframes slide {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(350%); }
    }
  `;

  return (
    <>
      <style>{styles}</style>

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "60px 32px 80px",
          position: "relative",
        }}
      >
        {loading && (
          <div style={{ textAlign: "center", padding: "120px 0", color: "var(--muted)", fontSize: "13px" }}>
            <div style={{ animation: "pulse 1.4s ease infinite" }}>fetching repos_</div>
            <div
              style={{
                width: "120px",
                height: "2px",
                background: "rgba(255,255,255,0.07)",
                margin: "16px auto 0",
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "40%",
                  background: "var(--accent)",
                  borderRadius: "2px",
                  animation: "slide 1s ease-in-out infinite",
                }}
              />
            </div>
          </div>
        )}

        {error && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#e24b4a", fontSize: "13px" }}>
            could not load GitHub data — {error}
          </div>
        )}

        {!loading && !error && user && (
          <>
            {/* Header */}
            <header style={{ marginBottom: "64px" }}>
              {user.avatar_url && (
                <img
                  src={user.avatar_url}
                  alt={USERNAME}
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.13)",
                    marginBottom: "20px",
                    animation: "fadeUp 0.5s ease 0.05s both",
                  }}
                />
              )}

              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  letterSpacing: "0.18em",
                  color: "var(--accent)",
                  textTransform: "uppercase",
                  marginBottom: "16px",
                  animation: "fadeUp 0.6s ease 0.1s both",
                }}
              >
                ◆ portfolio
              </div>

              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(38px, 7vw, 68px)",
                  fontWeight: 800,
                  lineHeight: 1.0,
                  letterSpacing: "-0.03em",
                  animation: "fadeUp 0.6s ease 0.2s both",
                }}
              >
                {user.name || USERNAME}
                <span style={{ color: "var(--accent)" }}>.</span>
              </h1>

              {user.bio && (
                <p
                  style={{
                    marginTop: "20px",
                    fontSize: "14px",
                    color: "var(--muted)",
                    lineHeight: 1.7,
                    maxWidth: "480px",
                    animation: "fadeUp 0.6s ease 0.35s both",
                  }}
                >
                  {user.bio}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "24px",
                  flexWrap: "wrap",
                  marginTop: "28px",
                  animation: "fadeUp 0.6s ease 0.45s both",
                }}
              >
                {user.location && (
                  <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--muted)" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
                    {user.location}
                  </span>
                )}
                {user.blog && (
                  <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--muted)" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
                    <a href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent2)", textDecoration: "none" }}>
                      {user.blog}
                    </a>
                  </span>
                )}
                <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--muted)" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
                  <a href={`https://github.com/${USERNAME}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent2)", textDecoration: "none" }}>
                    github.com/{USERNAME}
                  </a>
                </span>
              </div>
            </header>

            {/* Stats */}
            <div
              style={{
                display: "flex",
                gap: "32px",
                flexWrap: "wrap",
                marginBottom: "48px",
                animation: "fadeUp 0.5s ease 0.5s both",
              }}
            >
              {[
                { num: repos.length, label: "Repos" },
                { num: user.followers, label: "Followers" },
                { num: totalStars, label: "Stars" },
                { num: langs.length, label: "Languages" },
              ].map(({ num, label }) => (
                <div key={label}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 800, color: "var(--accent)" }}>
                    {num}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "2px" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* Section label */}
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                letterSpacing: "0.18em",
                color: "var(--muted)",
                textTransform: "uppercase",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              projects
              <span style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            </div>

            {/* Filters */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginBottom: "32px",
                animation: "fadeUp 0.5s ease 0.55s both",
              }}
            >
              {["all", ...langs].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveFilter(lang)}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    letterSpacing: "0.08em",
                    padding: "6px 14px",
                    borderRadius: "100px",
                    border: `1px solid ${activeFilter === lang ? "var(--accent)" : "rgba(255,255,255,0.13)"}`,
                    background: activeFilter === lang ? "var(--accent)" : "transparent",
                    color: activeFilter === lang ? "#0a0a0b" : "var(--muted)",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    fontWeight: activeFilter === lang ? 500 : 400,
                    transition: "all 0.15s",
                  }}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "16px",
              }}
            >
              {filtered.length === 0 ? (
                <p style={{ color: "var(--muted)", fontSize: "13px", padding: "40px 0" }}>
                  no repos found for this filter_
                </p>
              ) : (
                filtered.map((repo, i) => (
                  <RepoCard key={repo.name} repo={repo} index={i} />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
