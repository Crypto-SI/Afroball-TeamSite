"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
  LayoutDashboard,
  Menu as MenuIcon,
  Image as ImageIcon
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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Image from "next/image";

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
  secondPos: string;
  height: string;
  imageUrl: string;
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
  { 
    id: "p1", 
    name: "Leo Marino", 
    pos: "Center Back", 
    secondPos: "Right Back", 
    height: "188cm", 
    imageUrl: "https://picsum.photos/seed/player1/400/500" 
  },
  { 
    id: "p2", 
    name: "Elias Thorne", 
    pos: "Striker", 
    secondPos: "Left Winger", 
    height: "182cm", 
    imageUrl: "https://picsum.photos/seed/player2/400/500" 
  },
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
  const [pSecondPos, setPSecondPos] = useState("");
  const [pHeight, setPHeight] = useState("");
  const [pImageUrl, setPImageUrl] = useState("");

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
      secondPos: pSecondPos,
      height: pHeight,
      imageUrl: pImageUrl || `https://picsum.photos/seed/${Math.random()}/400/500`
    };
    setPlayers([...players, player]);
    setIsAddPlayerOpen(false);
    setPName(""); setPPos(""); setPSecondPos(""); setPHeight(""); setPImageUrl("");
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

  const viewTitle = {
    fixtures: "Fixtures & Results",
    players: "First Team Squad",
    staff: "Leadership & Staff"
  }[view];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <SidebarProvider>
        <div className="flex flex-1">
          <Sidebar collapsible="icon" className="border-r">
            <SidebarHeader className="h-16 flex items-center px-4 border-b">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-accent" />
                <span className="font-black tracking-tight group-data-[collapsible=icon]:hidden">ADMIN</span>
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
                        tooltip="Fixtures"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Fixtures & Results</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => setView('players')} 
                        isActive={view === 'players'}
                        tooltip="Players"
                      >
                        <Users className="h-4 w-4" />
                        <span>First Team Squad</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => setView('staff')} 
                        isActive={view === 'staff'}
                        tooltip="Staff"
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

          <SidebarInset className="flex-1 bg-background">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <h1 className="text-xl font-bold uppercase tracking-tight">{viewTitle}</h1>
            </header>
            
            <main className="p-4 md:p-8">
              {/* --- Fixtures View --- */}
              {view === 'fixtures' && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-3xl font-black">MATCH CENTER</h2>
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
                    <TabsList className="mb-4"><TabsTrigger value="upcoming">Upcoming</TabsTrigger><TabsTrigger value="completed">Results</TabsTrigger></TabsList>
                    <TabsContent value="upcoming">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader><TableRow><TableHead>Opponent</TableHead><TableHead>DateTime</TableHead><TableHead>Venue</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                              <TableBody>
                                {fixtures.filter(f => f.status === 'upcoming').map(f => (
                                  <TableRow key={f.id}>
                                    <TableCell className="font-bold">{f.opponent}</TableCell>
                                    <TableCell>{f.date} at {f.time}</TableCell>
                                    <TableCell>{f.venue}</TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="outline" onClick={() => { setSelectedFixture(f); setMatchGoals([]); setIsResultDialogOpen(true); }}>ENTER RESULT</Button>
                                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setFixtures(fixtures.filter(x => x.id !== f.id))}><Trash2 className="h-4 w-4" /></Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                                {fixtures.filter(f => f.status === 'upcoming').length === 0 && (
                                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">No upcoming fixtures scheduled.</TableCell></TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="completed">
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {fixtures.filter(f => f.status === 'completed').map(f => (
                          <Card key={f.id} className="p-6 border-accent/20">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{f.date}</p>
                                <h3 className="text-lg font-bold uppercase">MARINERS <span className="text-accent mx-1">{f.result?.marinersScore} - {f.result?.opponentScore}</span> {f.opponent}</h3>
                              </div>
                              <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => setFixtures(fixtures.filter(x => x.id !== f.id))}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                            <div className="space-y-1">
                              {f.result?.goals.map((g, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Trophy className="h-3 w-3 text-accent" />
                                  <span>{g.player} ({g.minute}') - {g.team}</span>
                                </div>
                              ))}
                            </div>
                          </Card>
                        ))}
                        {fixtures.filter(f => f.status === 'completed').length === 0 && (
                          <div className="col-span-full py-12 text-center text-muted-foreground italic">No match results recorded yet.</div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* --- Players View --- */}
              {view === 'players' && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-3xl font-black">ROSTER MANAGEMENT</h2>
                      <p className="text-muted-foreground">Maintain the official player roster.</p>
                    </div>
                    <Dialog open={isAddPlayerOpen} onOpenChange={setIsAddPlayerOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-accent text-accent-foreground font-bold">
                          <Plus className="h-4 w-4 mr-2" /> ADD PLAYER
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader><DialogTitle>Add New Player</DialogTitle></DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label>Name</Label>
                            <Input placeholder="Full Name" value={pName} onChange={e => setPName(e.target.value)} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label>Position</Label>
                              <Input placeholder="Primary Pos" value={pPos} onChange={e => setPPos(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                              <Label>Second Position</Label>
                              <Input placeholder="Secondary Pos" value={pSecondPos} onChange={e => setPSecondPos(e.target.value)} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label>Height</Label>
                              <Input placeholder="e.g. 185cm" value={pHeight} onChange={e => setPHeight(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                              <Label>Image URL</Label>
                              <Input placeholder="https://..." value={pImageUrl} onChange={e => setPImageUrl(e.target.value)} />
                            </div>
                          </div>
                        </div>
                        <DialogFooter><Button onClick={handleAddPlayer} className="w-full font-bold">SAVE PLAYER</Button></DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Image</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Position</TableHead>
                              <TableHead>Second Pos</TableHead>
                              <TableHead>Height</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {players.map(p => (
                              <TableRow key={p.id}>
                                <TableCell>
                                  <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted">
                                    <Image 
                                      src={p.imageUrl} 
                                      alt={p.name} 
                                      fill 
                                      className="object-cover"
                                      sizes="40px"
                                    />
                                  </div>
                                </TableCell>
                                <TableCell className="font-bold">{p.name}</TableCell>
                                <TableCell><Badge variant="outline">{p.pos}</Badge></TableCell>
                                <TableCell><Badge variant="secondary" className="bg-muted text-muted-foreground">{p.secondPos}</Badge></TableCell>
                                <TableCell className="text-sm">{p.height}</TableCell>
                                <TableCell className="text-right">
                                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setPlayers(players.filter(x => x.id !== p.id))}><Trash2 className="h-4 w-4" /></Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* --- Staff View --- */}
              {view === 'staff' && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-3xl font-black">CLUB OFFICIALS</h2>
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
                      <div className="overflow-x-auto">
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
                      </div>
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
            <div className="grid grid-cols-2 gap-8 p-4 bg-muted/30 rounded-lg text-center">
              <div><Label className="text-accent font-bold">MARINERS</Label><Input type="number" value={mScore} onChange={e => setMScore(parseInt(e.target.value))} className="text-center text-2xl font-black mt-2" /></div>
              <div><Label className="font-bold">{selectedFixture?.opponent.toUpperCase() || "OPPONENT"}</Label><Input type="number" value={oScore} onChange={e => setOScore(parseInt(e.target.value))} className="text-center text-2xl font-black mt-2" /></div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between"><h4 className="text-sm font-bold uppercase tracking-widest">GOALSCORERS</h4><Button variant="outline" size="sm" onClick={() => setMatchGoals([...matchGoals, { player: "", minute: 0, team: "Mariners" }])}>ADD GOAL</Button></div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {matchGoals.map((g, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input placeholder="Player Name" value={g.player} onChange={e => { const u = [...matchGoals]; u[i].player = e.target.value; setMatchGoals(u); }} className="h-8" />
                    <Input type="number" placeholder="Min" value={g.minute} onChange={e => { const u = [...matchGoals]; u[i].minute = parseInt(e.target.value); setMatchGoals(u); }} className="h-8 w-20" />
                    <select className="h-8 border rounded px-2 text-xs bg-background" value={g.team} onChange={e => { const u = [...matchGoals]; u[i].team = e.target.value as any; setMatchGoals(u); }}>
                      <option value="Mariners">Mariners</option>
                      <option value="Opponent">Opponent</option>
                    </select>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => setMatchGoals(matchGoals.filter((_, idx) => idx !== i))}><Trash2 className="h-3 w-3" /></Button>
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
