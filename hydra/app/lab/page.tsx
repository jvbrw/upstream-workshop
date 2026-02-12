import Link from "next/link";
import fs from "fs";
import path from "path";

type Experiment = {
  slug: string;
  hasPage: boolean;
};

function getExperiments(): Experiment[] {
  const labDir = path.join(process.cwd(), "app/lab");
  const excludeSlugs = new Set(["viewfinder"]);

  try {
    const entries = fs.readdirSync(labDir, { withFileTypes: true });
    return entries
      .filter(
        (entry) =>
          entry.isDirectory() &&
          entry.name !== "." &&
          !entry.name.startsWith("_") &&
          !excludeSlugs.has(entry.name)
      )
      .map((entry) => ({
        slug: entry.name,
        hasPage: fs.existsSync(
          path.join(labDir, entry.name, "page.tsx")
        ),
      }))
      .filter((exp) => exp.hasPage);
  } catch {
    return [];
  }
}

export default function LabIndex() {
  const experiments = getExperiments();

  return (
    <main className="min-h-screen bg-background px-4 py-12 font-sans">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Hydra
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            Prototype Lab
          </h1>
          <p className="mt-2 text-muted-foreground">
            Front-end experiments and validated experiences. Built with{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
              /prototype
            </code>
          </p>
        </div>

        {/* Viewfinder CTA */}
        <Link
          href="/lab/viewfinder"
          className="group mb-6 flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 transition-colors hover:border-primary/40 hover:bg-primary/10"
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          </div>
          <div className="flex-1">
            <span className="font-medium text-foreground group-hover:text-primary">
              Open Viewfinder
            </span>
            <p className="text-sm text-muted-foreground">
              Preview prototypes in a mobile device frame
            </p>
          </div>
          <span className="text-sm text-muted-foreground">→</span>
        </Link>

        {/* Experiments list */}
        {experiments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
            <p className="text-muted-foreground">
              No experiments yet.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Run{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                /prototype
              </code>{" "}
              to create your first one.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {experiments.map((exp) => (
              <li key={exp.slug}>
                <Link
                  href={`/lab/${exp.slug}`}
                  className="group flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:border-primary/30 hover:bg-accent"
                >
                  <span className="font-medium text-card-foreground group-hover:text-primary">
                    {exp.slug}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    /lab/{exp.slug}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12 border-t border-border pt-6">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Back to app
          </Link>
        </div>
      </div>
    </main>
  );
}
