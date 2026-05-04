import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface DemoUser {
  email: string;
  password: string;
  card_url_id: string;
  name: string;
  title: string;
  company: string;
  bio: string;
  profile_image: string;
  phone: string;
  social_links: { platform: string; url: string; icon: string }[];
  theme: string;
  accent_color: string;
}

const demoUsers: DemoUser[] = [
  {
    email: "alex@meridian.studio",
    password: "demo123",
    card_url_id: "alex-carter",
    name: "Alex Carter",
    title: "Senior Product Designer",
    company: "Meridian Studio",
    bio: "Crafting digital experiences that blend aesthetics with function. 8+ years designing products people love to use.",
    profile_image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300",
    phone: "+1 (415) 555-0142",
    social_links: [
      { platform: "LinkedIn", url: "https://linkedin.com/in/alexcarter", icon: "linkedin" },
      { platform: "Twitter", url: "https://twitter.com/alexcarter", icon: "twitter" },
      { platform: "Dribbble", url: "https://dribbble.com/alexcarter", icon: "globe" },
      { platform: "GitHub", url: "https://github.com/alexcarter", icon: "github" },
      { platform: "Website", url: "https://alexcarter.design", icon: "globe" },
    ],
    theme: "dark",
    accent_color: "#0ea5e9",
  },
  {
    email: "jordan@novatech.io",
    password: "demo123",
    card_url_id: "jordan-lee",
    name: "Jordan Lee",
    title: "Full-Stack Engineer",
    company: "NovaTech",
    bio: "Building the future one commit at a time. Passionate about clean code, open source, and developer tooling.",
    profile_image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300",
    phone: "+1 (628) 555-0198",
    social_links: [
      { platform: "GitHub", url: "https://github.com/jordanlee", icon: "github" },
      { platform: "LinkedIn", url: "https://linkedin.com/in/jordanlee", icon: "linkedin" },
      { platform: "Twitter", url: "https://twitter.com/jordanlee", icon: "twitter" },
      { platform: "Website", url: "https://jordanlee.dev", icon: "globe" },
    ],
    theme: "gradient",
    accent_color: "#10b981",
  },
  {
    email: "sam@brightpath.co",
    password: "demo123",
    card_url_id: "sam-morgan",
    name: "Sam Morgan",
    title: "Marketing Director",
    company: "BrightPath Agency",
    bio: "Turning brands into stories and stories into growth. Specializing in content strategy and brand positioning.",
    profile_image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300",
    phone: "+1 (312) 555-0167",
    social_links: [
      { platform: "LinkedIn", url: "https://linkedin.com/in/sammorgan", icon: "linkedin" },
      { platform: "Twitter", url: "https://twitter.com/sammorgan", icon: "twitter" },
      { platform: "Instagram", url: "https://instagram.com/sammorgan", icon: "instagram" },
      { platform: "Website", url: "https://brightpath.co", icon: "globe" },
    ],
    theme: "light",
    accent_color: "#f59e0b",
  },
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const results: { email: string; status: string; error?: string }[] = [];

    for (const demo of demoUsers) {
      // Create auth user
      const createUserRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: "POST",
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: demo.email,
          password: demo.password,
          email_confirm: true,
        }),
      });

      const createUserJson = await createUserRes.json();

      if (!createUserRes.ok) {
        // If user already exists, try to find their ID
        if (createUserJson.msg?.includes("already registered")) {
          // List users to find existing one
          const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?filter=email.eq.${demo.email}`, {
            headers: {
              apikey: SERVICE_ROLE_KEY,
              Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
            },
          });
          const listJson = await listRes.json();
          const existingUser = listJson.users?.[0];
          if (existingUser) {
            // Upsert profile for existing user
            const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
              method: "POST",
              headers: {
                apikey: SERVICE_ROLE_KEY,
                Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
                "Content-Type": "application/json",
                Prefer: "resolution=merge-duplicates",
              },
              body: JSON.stringify({
                id: existingUser.id,
                card_url_id: demo.card_url_id,
                name: demo.name,
                title: demo.title,
                company: demo.company,
                bio: demo.bio,
                profile_image: demo.profile_image,
                email: demo.email,
                phone: demo.phone,
                social_links: demo.social_links,
                theme: demo.theme,
                accent_color: demo.accent_color,
              }),
            });

            if (profileRes.ok) {
              results.push({ email: demo.email, status: "profile_upserted_existing_user" });
            } else {
              const errText = await profileRes.text();
              results.push({ email: demo.email, status: "profile_upsert_failed", error: errText });
            }
          } else {
            results.push({ email: demo.email, status: "user_exists_but_not_found" });
          }
        } else {
          results.push({ email: demo.email, status: "user_creation_failed", error: createUserJson.msg || JSON.stringify(createUserJson) });
        }
        continue;
      }

      const userId = createUserJson.id;

      // Insert profile
      const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: "POST",
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify({
          id: userId,
          card_url_id: demo.card_url_id,
          name: demo.name,
          title: demo.title,
          company: demo.company,
          bio: demo.bio,
          profile_image: demo.profile_image,
          email: demo.email,
          phone: demo.phone,
          social_links: demo.social_links,
          theme: demo.theme,
          accent_color: demo.accent_color,
        }),
      });

      if (profileRes.ok) {
        results.push({ email: demo.email, status: "created" });
      } else {
        const errText = await profileRes.text();
        results.push({ email: demo.email, status: "profile_insert_failed", error: errText });
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
