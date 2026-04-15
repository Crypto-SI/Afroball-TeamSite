import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const docs = [
  {
    title: "Supabase Setup Guide",
    description: "Overview, environment variables, and architecture diagrams.",
    path: "docs/supabase/README.md",
  },
  {
    title: "01. Project Setup",
    description: "Create the project, add keys, install packages, and create storage.",
    path: "docs/supabase/01-project-setup.md",
  },
  {
    title: "02. Schema And RLS",
    description: "Starter SQL, roles, and row-level security policies.",
    path: "docs/supabase/02-schema-and-rls.md",
  },
  {
    title: "03. Next.js Integration",
    description: "How this template is wired to Supabase in code.",
    path: "docs/supabase/03-nextjs-integration.md",
  },
  {
    title: "04. Team Launch Checklist",
    description: "Hand-off checklist for each new club rollout.",
    path: "docs/supabase/04-team-launch-checklist.md",
  },
];

export default function SupabaseDocsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-accent">
              Template Docs
            </p>
            <h1 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
              Supabase Setup
            </h1>
            <p className="text-lg text-muted-foreground">
              This repo ships with Supabase auth and data plumbing. New teams only
              need to create their own Supabase project, run the documented schema,
              and add their environment keys.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {docs.map((doc) => (
              <Card className="border-accent/20 bg-card/60" key={doc.path}>
                <CardHeader>
                  <CardTitle>{doc.title}</CardTitle>
                  <CardDescription>{doc.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-mono text-sm text-accent">{doc.path}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-accent/20 bg-card/50 p-6">
            <p className="text-sm text-muted-foreground">
              These files live in the repo and are meant to be read directly by the
              team working from the template. Use the in-app login flow for auth,
              and use the repo docs for schema and rollout instructions.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Admin entry point:{" "}
              <Link className="font-semibold text-accent hover:underline" href="/login">
                /login
              </Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
