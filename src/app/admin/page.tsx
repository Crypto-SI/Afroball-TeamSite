"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, 
  Plus, 
  Trophy, 
  MapPin, 
  Clock, 
  Trash2, 
  Edit3, 
  CheckCircle2,
  Users,
  ShieldCheck,
  History,
  LayoutDashboard
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
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

// --- Types ---

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

type Player = {
  id: string;
  name: string;
  pos: string;
  no: string;
  bio: string;
};

type StaffMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
};

// --- Initial Data ---

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

const INITIAL_PLAYERS: Player[] = [
  { id: "p1", name: "Leo Marino", pos: "Defender", no: "4", bio: "The rock of the defense and club captain." },
  { id: "p2", name: "Elias Thorne", pos: "Forward", no: "9", bio: "A clinical finisher with a record-breaking season." },
];

const INITIAL_STAFF: StaffMember[] = [
  { id: "s1", name: "Victor Helm", role: "Head Coach", bio: "A master tactician with 20 years of experience." },
  { id: "s2", name: "Sarah Anchor", role: "Sporting Director", bio: "Leading the club's long-term vision and recruitment." },
];

export default function AdminPage() {
  const [view, setView] = useState<'fixtures' | 'players' | 'staff'>('fixtures');
  
  // Data States
  const [fixtures, setFixtures] = useState<Fixture[]>(INITIAL_FIXTURES);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);

  // Dialog States
  const [isAddFixtureOpen, setIsAddFixtureOpen] = useState(false);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);

  // Form States - Fixtures
  const [newOpponent, setNewOpponent] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newVenue, setNewVenue] = useState("");
  const [mScore, setMScore] = useState(0);
  const [oScore, setOScore] = useState(0);
  const [matchGoals, setMatchGoals] = useState<Omit<Goal, 'id'>[]>([]);

  // Form States - Players
  const [pName, setPName] = useState("");
  const [pPos, setPPos] = useState("");
  const [pNo, setPNo] = useState("");
  const [pBio, setPBio] = useState("");

  // Form States - Staff
  const [sName, setSName] = useState("");
  const [sRole, setSRole] = useState("");
  const [sBio, setSBio] = useState("");

  // --- Handlers ---

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
    setIsAddFixtureOpen(false);
    setNewOpponent(""); setNewDate(""); setNewTime(""); setNewVenue("");
  };

  const handleSubmitResult = () => {
    if (!selectedFixture) return;
    setFixtures(fixtures.map(f => f.id === selectedFixture.id ? {
      ...f,
      status: 'completed',
      result: {
        marinersScore: mScore,
        opponentScore: oScore,
        goals: matchGoals.map(g => ({ ...g, id: Math.random().toString(36).substr(2, 5) }))
      }
    } : f));
    setIsResultDialogOpen(false);
  };

  const handleAddPlayer = () => {
    const player: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name: pName,
      pos: pPos,
      no: pNo,
      bio: pBio
    };
    setPlayers([...players, player]);
    setIsAddPlayerOpen(false);
    setPName(""); setPPos(""); setPNo(""); setPBio("");
  };

  const handleAddStaff = () => {
    const member: StaffMember = {
      id: Math.random().toString(36).substr(2, 9),
      name: sName,
      role: sRole,
      bio: sBio
    };
    setStaff([...staff, member]);
    setIsAddStaffOpen(false);
    setSName(""); setSRole(""); setSBio("");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <SidebarProvider>
        <div className="flex flex-1">
          <Sidebar collapsible="none" className="hidden lg:flex border-r w-64 bg-card">
            <SidebarHeader className="p-4 border-b">
              <div className="flex items-center gap-2 px-2">
                <LayoutDashboard className="h-5 w-5 text-accent" />
                <span className="font-black tracking-tight">ADMIN PANEL</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Management</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => setView('fixtures')} 
                        isActive={view === 'fixtures'}
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Fixtures & Results</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => setView('players')} 
                        isActive={view === 'players'}
                      >
                        <Users className="h-4 w-4" />
                        <span>First Team Squad</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => setView('staff')} 
                        isActive={view === 'staff'}
                      >
                        <ShieldCheck className="h-4 w-4" />
                        <span>Leadership & Staff</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <SidebarInset className="flex-1 bg-background/50">
            <main className="p-8">
              {/* --- Fixtures View --- */}
              {view === 'fixtures' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-3xl font-black">FIXTURES & RESULTS</h1>
                      <p className="text-muted-foreground">Manage the Mariner match schedule.</p>
                    </div>
                    <Dialog open={isAddFixtureOpen} onOpenChange={setIsAddFixtureOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-accent text-accent-foreground font-bold">
                          <Plus className="h-4 w-4 mr-2" /> ADD FIXTURE
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Fixture</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2"><Label>Opponent</Label><Input value={newOpponent} onChange={e => setNewOpponent(e.target.value)} /></div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2"><Label>Date</Label><Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} /></div>
                            <div className="grid gap-2"><Label>Time</Label><Input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} /></div>
                          </div>
                          <div className="grid gap-2"><Label>Venue</Label><Input value={newVenue} onChange={e => setNewVenue(e.target.value)} /></div>
                        </div>
                        <DialogFooter><Button onClick={handleAddFixture} className="w-full">CREATE</Button></DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Tabs defaultValue="upcoming" className="w-full">
                    <TabsList><TabsTrigger value="upcoming">Upcoming</TabsTrigger><TabsTrigger value="completed">Results</TabsTrigger></TabsList>
                    <TabsContent value="upcoming">
                      <Card>
                        <CardContent className="pt-6">
                          <Table>
                            <TableHeader><TableRow><TableHead>Opponent</TableHead><TableHead>DateTime</TableHead><TableHead>Venue</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                              {fixtures.filter(f => f.status === 'upcoming').map(f => (
                                <TableRow key={f.id}>
                                  <TableCell className="font-bold">{f.opponent}</TableCell>
                                  <TableCell>{f.date} at {f.time}</TableCell>
                                  <TableCell>{f.venue}</TableCell>
                                  <TableCell className="text-right">
                                    <Button size="sm" variant="outline" onClick={() => { setSelectedFixture(f); setMatchGoals([]); setIsResultDialogOpen(true); }}>ENTER RESULT</Button>
                                    <Button size="icon" variant="ghost" className="text-destructive ml-2" onClick={() => setFixtures(fixtures.filter(x => x.id !== f.id))}><Trash2 className="h-4 w-4" /></Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="completed">
                      <div className="space-y-4">
                        {fixtures.filter(f => f.status === 'completed').map(f => (
                          <Card key={f.id} className="p-6">
                            <div className="flex justify-between items-center">
                              <h3 className="text-xl font-bold uppercase tracking-tight">MARINERS <span className="text-accent">{f.result?.marinersScore} - {f.result?.opponentScore}</span> {f.opponent}</h3>
                              <Button variant="ghost" size="icon" onClick={() => setFixtures(fixtures.filter(x => x.id !== f.id))}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* --- Players View --- */}
              {view === 'players' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-3xl font-black">FIRST TEAM SQUAD</h1>
                      <p className="text-muted-foreground">Maintain the official player roster.</p>
                    </div>
                    <Dialog open={isAddPlayerOpen} onOpenChange={setIsAddPlayerOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-accent text-accent-foreground font-bold">
                          <Plus className="h-4 w-4 mr-2" /> ADD PLAYER
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Add New Player</DialogTitle></DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2"><Label>Name</Label><Input value={pName} onChange={e => setPName(e.target.value)} /></div>
                            <div className="grid gap-2"><Label>Number</Label><Input value={pNo} onChange={e => setPNo(e.target.value)} /></div>
                          </div>
                          <div className="grid gap-2"><Label>Position</Label><Input value={pPos} onChange={e => setPPos(e.target.value)} /></div>
                          <div className="grid gap-2"><Label>Bio</Label><Textarea value={pBio} onChange={e => setPBio(e.target.value)} /></div>
                        </div>
                        <DialogFooter><Button onClick={handleAddPlayer} className="w-full">SAVE PLAYER</Button></DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Card>
                    <CardContent className="pt-6">
                      <Table>
                        <TableHeader><TableRow><TableHead>No.</TableHead><TableHead>Name</TableHead><TableHead>Position</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {players.map(p => (
                            <TableRow key={p.id}>
                              <TableCell className="font-black text-accent">{p.no}</TableCell>
                              <TableCell className="font-bold">{p.name}</TableCell>
                              <TableCell><Badge variant="outline">{p.pos}</Badge></TableCell>
                              <TableCell className="text-right">
                                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setPlayers(players.filter(x => x.id !== p.id))}><Trash2 className="h-4 w-4" /></Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* --- Staff View --- */}
              {view === 'staff' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-3xl font-black">LEADERSHIP & STAFF</h1>
                      <p className="text-muted-foreground">Manage coaching and administrative roles.</p>
                    </div>
                    <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-accent text-accent-foreground font-bold">
                          <Plus className="h-4 w-4 mr-2" /> ADD STAFF MEMBER
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Add Staff Member</DialogTitle></DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2"><Label>Name</Label><Input value={sName} onChange={e => setSName(e.target.value)} /></div>
                          <div className="grid gap-2"><Label>Role</Label><Input value={sRole} onChange={e => setSRole(e.target.value)} /></div>
                          <div className="grid gap-2"><Label>Bio</Label><Textarea value={sBio} onChange={e => setSBio(e.target.value)} /></div>
                        </div>
                        <DialogFooter><Button onClick={handleAddStaff} className="w-full">SAVE MEMBER</Button></DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Card>
                    <CardContent className="pt-6">
                      <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {staff.map(s => (
                            <TableRow key={s.id}>
                              <TableCell className="font-bold">{s.name}</TableCell>
                              <TableCell className="text-accent text-sm font-semibold">{s.role}</TableCell>
                              <TableCell className="text-right">
                                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setStaff(staff.filter(x => x.id !== s.id))}><Trash2 className="h-4 w-4" /></Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              )}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>

      {/* Shared Result Dialog */}
      <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>Enter Match Result</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-8 p-4 bg-muted/30 rounded-lg">
              <div className="text-center"><Label className="text-accent font-bold">MARINERS</Label><Input type="number" value={mScore} onChange={e => setMScore(parseInt(e.target.value))} className="text-center text-2xl font-black" /></div>
              <div className="text-center"><Label className="font-bold">{selectedFixture?.opponent.toUpperCase()}</Label><Input type="number" value={oScore} onChange={e => setOScore(parseInt(e.target.value))} className="text-center text-2xl font-black" /></div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between"><h4 className="text-sm font-bold">GOALSCORERS</h4><Button variant="outline" size="sm" onClick={() => setMatchGoals([...matchGoals, { player: "", minute: 0, team: "Mariners" }])}>ADD GOAL</Button></div>
              <div className="space-y-2">
                {matchGoals.map((g, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input placeholder="Player" value={g.player} onChange={e => { const u = [...matchGoals]; u[i].player = e.target.value; setMatchGoals(u); }} className="h-8" />
                    <Input type="number" placeholder="Min" value={g.minute} onChange={e => { const u = [...matchGoals]; u[i].minute = parseInt(e.target.value); setMatchGoals(u); }} className="h-8 w-20" />
                    <select className="h-8 border rounded px-2 text-xs" value={g.team} onChange={e => { const u = [...matchGoals]; u[i].team = e.target.value as any; setMatchGoals(u); }}>
                      <option value="Mariners">Mariners</option>
                      <option value="Opponent">Opponent</option>
                    </select>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setMatchGoals(matchGoals.filter((_, idx) => idx !== i))}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSubmitResult} className="w-full bg-accent text-accent-foreground font-bold">RECORD FINAL RESULT</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}
