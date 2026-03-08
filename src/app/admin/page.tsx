"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  Plus, 
  Trophy, 
  MapPin, 
  Clock, 
  Trash2, 
  Edit3, 
  CheckCircle2,
  User,
  History
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

type Goal = {
  id: string;
  player: string;
  minute: number;
  team: 'Mariners' | 'Opponent';
};

type Fixture = {
  id: string;
  opponent: string;
  date: string;
  time: string;
  venue: string;
  status: 'upcoming' | 'completed';
  result?: {
    marinersScore: number;
    opponentScore: number;
    goals: Goal[];
  };
};

const INITIAL_FIXTURES: Fixture[] = [
  {
    id: "1",
    opponent: "Southern Anchors",
    date: "2024-10-14",
    time: "15:00",
    venue: "Mariner Dome",
    status: "completed",
    result: {
      marinersScore: 3,
      opponentScore: 1,
      goals: [
        { id: "g1", player: "Leo Marino", minute: 12, team: "Mariners" },
        { id: "g2", player: "Opponent", minute: 44, team: "Opponent" },
        { id: "g3", player: "Elias Thorne", minute: 67, team: "Mariners" },
        { id: "g4", player: "Elias Thorne", minute: 82, team: "Mariners" },
      ]
    }
  },
  {
    id: "2",
    opponent: "Northern Gulls",
    date: "2024-10-21",
    time: "18:00",
    venue: "Gulls' Nest",
    status: "upcoming"
  }
];

export default function AdminPage() {
  const [fixtures, setFixtures] = useState<Fixture[]>(INITIAL_FIXTURES);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);

  // Form states for new fixture
  const [newOpponent, setNewOpponent] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newVenue, setNewVenue] = useState("");

  // Form states for match result
  const [mScore, setMScore] = useState(0);
  const [oScore, setOScore] = useState(0);
  const [matchGoals, setMatchGoals] = useState<Omit<Goal, 'id'>[]>([]);

  const handleAddFixture = () => {
    const fixture: Fixture = {
      id: Math.random().toString(36).substr(2, 9),
      opponent: newOpponent,
      date: newDate,
      time: newTime,
      venue: newVenue,
      status: 'upcoming'
    };
    setFixtures([...fixtures, fixture]);
    setIsAddDialogOpen(false);
    resetFixtureForm();
  };

  const resetFixtureForm = () => {
    setNewOpponent("");
    setNewDate("");
    setNewTime("");
    setNewVenue("");
  };

  const handleOpenResultDialog = (fixture: Fixture) => {
    setSelectedFixture(fixture);
    setMScore(0);
    setOScore(0);
    setMatchGoals([]);
    setIsResultDialogOpen(true);
  };

  const addGoalRow = () => {
    setMatchGoals([...matchGoals, { player: "", minute: 0, team: "Mariners" }]);
  };

  const updateGoal = (index: number, field: keyof Omit<Goal, 'id'>, value: any) => {
    const updated = [...matchGoals];
    updated[index] = { ...updated[index], [field]: value };
    setMatchGoals(updated);
  };

  const removeGoalRow = (index: number) => {
    setMatchGoals(matchGoals.filter((_, i) => i !== index));
  };

  const handleSubmitResult = () => {
    if (!selectedFixture) return;

    const updatedFixtures = fixtures.map(f => {
      if (f.id === selectedFixture.id) {
        return {
          ...f,
          status: 'completed' as const,
          result: {
            marinersScore: mScore,
            opponentScore: oScore,
            goals: matchGoals.map(g => ({ ...g, id: Math.random().toString(36).substr(2, 5) }))
          }
        };
      }
      return f;
    });

    setFixtures(updatedFixtures);
    setIsResultDialogOpen(false);
  };

  const deleteFixture = (id: string) => {
    setFixtures(fixtures.filter(f => f.id !== id));
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-12 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight">FIXTURE MANAGEMENT</h1>
              <p className="text-muted-foreground">Schedule matches and record Mariner history.</p>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent text-accent-foreground font-bold flex items-center gap-2">
                  <Plus className="h-4 w-4" /> ADD NEW FIXTURE
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Fixture</DialogTitle>
                  <DialogDescription>Enter details for the upcoming match.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="opponent">Opponent Team</Label>
                    <Input id="opponent" value={newOpponent} onChange={(e) => setNewOpponent(e.target.value)} placeholder="e.g. Northern Gulls" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="time">Kickoff Time</Label>
                      <Input id="time" type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="venue">Venue</Label>
                    <Input id="venue" value={newVenue} onChange={(e) => setNewVenue(e.target.value)} placeholder="e.g. Mariner Dome" />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddFixture} className="w-full">CREATE FIXTURE</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Upcoming
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <History className="h-4 w-4" /> Results
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              <Card className="bg-card border-primary/10">
                <CardHeader>
                  <CardTitle>Upcoming Fixtures</CardTitle>
                  <CardDescription>Matches that haven't been played yet.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Opponent</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Venue</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fixtures.filter(f => f.status === 'upcoming').map((f) => (
                        <TableRow key={f.id}>
                          <TableCell className="font-bold">{f.opponent}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{f.date}</span>
                              <span className="text-xs text-muted-foreground">{f.time}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" /> {f.venue}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleOpenResultDialog(f)} className="text-xs font-bold border-accent text-accent">
                                ENTER RESULT
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteFixture(f.id)} className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {fixtures.filter(f => f.status === 'upcoming').length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            No upcoming fixtures scheduled.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="completed">
              <Card className="bg-card border-primary/10">
                <CardHeader>
                  <CardTitle>Match Results</CardTitle>
                  <CardDescription>Final scores and goalscorers from past matches.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {fixtures.filter(f => f.status === 'completed').map((f) => (
                      <div key={f.id} className="p-6 border rounded-xl bg-accent/5 border-accent/10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Trophy className="h-4 w-4 text-accent" />
                              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">FINAL RESULT</span>
                            </div>
                            <h3 className="text-2xl font-black">MARINERS <span className="text-accent">{f.result?.marinersScore} - {f.result?.opponentScore}</span> {f.opponent.toUpperCase()}</h3>
                          </div>
                          <div className="text-right md:text-right">
                            <p className="text-sm font-medium">{f.date}</p>
                            <p className="text-xs text-muted-foreground">{f.venue}</p>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-8">
                          <div>
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                              <User className="h-3 w-3" /> GOALSCORERS
                            </h4>
                            <div className="space-y-2">
                              {f.result?.goals.map((goal) => (
                                <div key={goal.id} className="flex items-center justify-between text-sm p-2 rounded bg-card/50">
                                  <span className={goal.team === 'Mariners' ? 'text-accent font-bold' : 'text-muted-foreground'}>
                                    {goal.player}
                                  </span>
                                  <Badge variant="outline" className="text-[10px] h-5">{goal.minute}&apos;</Badge>
                                </div>
                              ))}
                              {f.result?.goals.length === 0 && <p className="text-xs italic text-muted-foreground">No goals recorded.</p>}
                            </div>
                          </div>
                          <div className="flex items-end justify-end">
                             <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                                <Edit3 className="h-3 w-3 mr-1" /> EDIT REPORT
                             </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {fixtures.filter(f => f.status === 'completed').length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        No match results recorded yet.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Result Entry Dialog */}
          <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Enter Match Result</DialogTitle>
                <DialogDescription>Record final score and goal details for vs {selectedFixture?.opponent}.</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Score Section */}
                <div className="grid grid-cols-2 gap-8 p-4 bg-muted/30 rounded-lg">
                  <div className="space-y-2 text-center">
                    <Label className="text-accent font-bold">MARINERS</Label>
                    <Input 
                      type="number" 
                      value={mScore} 
                      onChange={(e) => setMScore(parseInt(e.target.value))} 
                      className="text-center text-2xl font-black h-16"
                    />
                  </div>
                  <div className="space-y-2 text-center">
                    <Label className="text-muted-foreground font-bold">{selectedFixture?.opponent.toUpperCase()}</Label>
                    <Input 
                      type="number" 
                      value={oScore} 
                      onChange={(e) => setOScore(parseInt(e.target.value))} 
                      className="text-center text-2xl font-black h-16"
                    />
                  </div>
                </div>

                {/* Goals Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold uppercase tracking-wider">Goalscorers</h4>
                    <Button variant="outline" size="sm" onClick={addGoalRow} className="text-xs h-8">
                      <Plus className="h-3 w-3 mr-1" /> ADD GOAL
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {matchGoals.map((goal, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end border-b pb-3 border-muted">
                        <div className="col-span-5 space-y-1">
                          <Label className="text-[10px] uppercase">Player Name</Label>
                          <Input 
                            placeholder="e.g. Elias Thorne" 
                            value={goal.player} 
                            onChange={(e) => updateGoal(index, 'player', e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <Label className="text-[10px] uppercase">Min</Label>
                          <Input 
                            type="number" 
                            value={goal.minute} 
                            onChange={(e) => updateGoal(index, 'minute', parseInt(e.target.value))}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="col-span-4 space-y-1">
                          <Label className="text-[10px] uppercase">Team</Label>
                          <select 
                            className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background"
                            value={goal.team}
                            onChange={(e) => updateGoal(index, 'team', e.target.value)}
                          >
                            <option value="Mariners">Mariners</option>
                            <option value="Opponent">Opponent</option>
                          </select>
                        </div>
                        <div className="col-span-1">
                          <Button variant="ghost" size="icon" onClick={() => removeGoalRow(index)} className="h-8 w-8 text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {matchGoals.length === 0 && (
                      <p className="text-center py-4 text-xs text-muted-foreground italic">No goals added yet.</p>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={handleSubmitResult} className="w-full bg-accent text-accent-foreground font-bold">
                  <CheckCircle2 className="h-4 w-4 mr-2" /> RECORD FINAL RESULT
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
}