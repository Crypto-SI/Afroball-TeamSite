import { CalendarDays, Clock3, MapPin, Trophy } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFixtures, getSiteSettings } from "@/lib/team-data-loaders";

export default async function FixturesPage() {
  const [fixtures, settings] = await Promise.all([getFixtures(), getSiteSettings()]);
  const upcomingFixtures = fixtures.filter((fixture) => fixture.status === "upcoming");
  const completedFixtures = fixtures.filter((fixture) => fixture.status === "completed");
  const nextFixture = upcomingFixtures[0];
  const latestResult = completedFixtures[0];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-accent/10 bg-gradient-to-br from-primary/20 via-background to-background">
          <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="max-w-3xl space-y-6">
              <Badge variant="secondary" className="border border-accent/20 bg-accent/10 px-4 py-1 text-accent">
                Match Centre
              </Badge>
              <h1 className="text-4xl font-black tracking-tight sm:text-6xl">FIXTURES & RESULTS</h1>
              <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                Track the Mariners&apos; upcoming tests and revisit the latest scorelines, venues, and key moments from recent matches.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              {nextFixture ? (
                <FeatureCard
                  eyebrow="Next Up"
                  title={`Mariners vs ${nextFixture.opponent}`}
                  accent="primary"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoRow icon={CalendarDays} label="Date" value={formatFixtureDate(nextFixture.date)} />
                    <InfoRow icon={Clock3} label="Kick-off" value={nextFixture.time} />
                    <InfoRow icon={MapPin} label="Venue" value={nextFixture.venue} />
                    <InfoRow icon={Trophy} label="Status" value="Tickets and travel details coming soon" />
                  </div>
                </FeatureCard>
              ) : null}

              {latestResult?.result ? (
                <FeatureCard
                  eyebrow="Latest Result"
                  title={`Mariners ${latestResult.result.marinersScore} - ${latestResult.result.opponentScore} ${latestResult.opponent}`}
                  accent="accent"
                >
                  <div className="space-y-4">
                    <InfoRow icon={CalendarDays} label="Played" value={formatFixtureDate(latestResult.date)} />
                    <InfoRow icon={MapPin} label="Venue" value={latestResult.venue} />
                    <div className="rounded-xl border border-accent/10 bg-background/40 p-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                        Goals
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {latestResult.result.goals.map((goal) => (
                          <Badge
                            key={goal.id}
                            variant={goal.team === "Mariners" ? "default" : "secondary"}
                            className={goal.team === "Mariners" ? "bg-accent text-accent-foreground" : ""}
                          >
                            {goal.player} {goal.minute}&apos;
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </FeatureCard>
              ) : null}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <SectionHeading
                title="Upcoming Fixtures"
                copy="Every upcoming league date in one place, with clean venue and kick-off details."
              />
              <div className="space-y-4">
                {upcomingFixtures.map((fixture) => (
                  <Card key={fixture.id} className="border-primary/20 bg-card/80">
                    <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-2">
                        <Badge variant="outline" className="border-accent/20 text-accent">
                          Upcoming
                        </Badge>
                        <h2 className="text-2xl font-bold uppercase">Mariners vs {fixture.opponent}</h2>
                        <p className="text-sm text-muted-foreground">{fixture.venue}</p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 md:min-w-[18rem]">
                        <InfoRow icon={CalendarDays} label="Date" value={formatFixtureDate(fixture.date)} />
                        <InfoRow icon={Clock3} label="Time" value={fixture.time} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <SectionHeading
                title="Recent Results"
                copy="Completed matches with final scores and a quick breakdown of who struck when."
              />
              <div className="space-y-4">
                {completedFixtures.map((fixture) => (
                  <Card key={fixture.id} className="overflow-hidden border-accent/20 bg-card/80">
                    <CardHeader className="border-b border-accent/10 bg-accent/5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <CardTitle className="text-xl uppercase">Mariners vs {fixture.opponent}</CardTitle>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {formatFixtureDate(fixture.date)} • {fixture.venue}
                          </p>
                        </div>
                        {fixture.result ? (
                          <div className="rounded-xl bg-background px-4 py-3 text-center shadow-sm">
                            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Final</p>
                            <p className="text-3xl font-black">
                              {fixture.result.marinersScore}
                              <span className="px-2 text-accent">-</span>
                              {fixture.result.opponentScore}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </CardHeader>
                    {fixture.result ? (
                      <CardContent className="p-6">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                          Match Timeline
                        </p>
                        <div className="space-y-3">
                          {fixture.result.goals.map((goal) => (
                            <div
                              key={goal.id}
                              className="flex items-center justify-between rounded-xl border border-border/80 bg-background/50 px-4 py-3"
                            >
                              <div>
                                <p className="font-semibold">{goal.player}</p>
                                <p className="text-sm text-muted-foreground">{goal.team}</p>
                              </div>
                              <Badge variant={goal.team === "Mariners" ? "default" : "secondary"}>
                                {goal.minute}&apos;
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    ) : null}
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </div>
  );
}

function SectionHeading({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="space-y-2">
      <h2 className="text-3xl font-black tracking-tight">{title}</h2>
      <p className="max-w-xl text-sm text-muted-foreground sm:text-base">{copy}</p>
    </div>
  );
}

function FeatureCard({
  eyebrow,
  title,
  accent,
  children,
}: {
  eyebrow: string;
  title: string;
  accent: "primary" | "accent";
  children: ReactNode;
}) {
  return (
    <Card
      className={
        accent === "primary"
          ? "border-primary/30 bg-card/80 shadow-[0_24px_80px_-32px_hsl(var(--primary)/0.55)]"
          : "border-accent/30 bg-card/80 shadow-[0_24px_80px_-32px_hsl(var(--accent)/0.45)]"
      }
    >
      <CardHeader className="space-y-3">
        <Badge
          variant="outline"
          className={accent === "primary" ? "w-fit border-primary/30 text-primary-foreground" : "w-fit border-accent/30 text-accent"}
        >
          {eyebrow}
        </Badge>
        <CardTitle className="text-2xl uppercase sm:text-3xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-background/40 p-4">
      <div className="rounded-lg bg-accent/10 p-2">
        <Icon className="h-4 w-4 text-accent" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <p className="text-sm font-medium sm:text-base">{value}</p>
      </div>
    </div>
  );
}

function formatFixtureDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}
