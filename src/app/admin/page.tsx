import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Ticket, 
  ShoppingBag, 
  TrendingUp, 
  Settings, 
  FileText,
  Activity,
  ArrowUpRight
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATS = [
  { name: "Total Fans", value: "12,405", change: "+12% from last month", icon: Users, color: "text-blue-500" },
  { name: "Tickets Sold", value: "8,920", change: "+5% from last month", icon: Ticket, color: "text-accent" },
  { name: "Merch Revenue", value: "$45,231", change: "+18% from last month", icon: ShoppingBag, color: "text-green-500" },
  { name: "Avg. Attendance", value: "22,500", change: "+2% from last match", icon: TrendingUp, color: "text-orange-500" },
];

const RECENT_ACTIVITY = [
  { id: 1, type: "Sale", item: "2024 Home Kit", user: "Sarah Jenkins", time: "2 mins ago", amount: "$85.00" },
  { id: 2, type: "Ticket", item: "Premium Seating vs Northern Gulls", user: "Mark Thompson", time: "15 mins ago", amount: "$75.00" },
  { id: 3, type: "Sale", item: "Mariner Scarf", user: "Emily Davis", time: "1 hour ago", amount: "$25.00" },
  { id: 4, type: "Ticket", item: "General Admission vs Northern Gulls", user: "John Doe", time: "3 hours ago", amount: "$35.00" },
];

export default function AdminPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-12 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight">ADMIN DASHBOARD</h1>
              <p className="text-muted-foreground">Welcome back, Captain. Here's what's happening with the Mariners today.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> Reports
              </Button>
              <Button className="bg-accent text-accent-foreground font-bold flex items-center gap-2">
                <Settings className="h-4 w-4" /> Club Settings
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
            {STATS.map((stat) => (
              <Card key={stat.name} className="bg-card border-primary/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Activity className="h-3 w-3" /> {stat.change}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Activity Table */}
            <Card className="lg:col-span-2 bg-card border-primary/10">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest ticket sales and merchandise purchases.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {RECENT_ACTIVITY.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell className="font-medium">{activity.user}</TableCell>
                        <TableCell>{activity.type}</TableCell>
                        <TableCell>{activity.item}</TableCell>
                        <TableCell className="text-right font-bold text-accent">{activity.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button variant="ghost" className="w-full mt-4 text-xs font-bold text-muted-foreground hover:text-accent">
                  VIEW ALL ACTIVITY <ArrowUpRight className="h-3 w-3 ml-1" />
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-6">
              <Card className="bg-card border-primary/10">
                <CardHeader>
                  <CardTitle>Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start font-bold">
                    MANAGE FIRST TEAM
                  </Button>
                  <Button variant="outline" className="w-full justify-start font-bold">
                    EDIT FIXTURES
                  </Button>
                  <Button variant="outline" className="w-full justify-start font-bold">
                    POST NEWS UPDATE
                  </Button>
                  <Button variant="outline" className="w-full justify-start font-bold">
                    SHOP INVENTORY
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-accent/10 border-accent/20">
                <CardHeader>
                  <CardTitle className="text-lg">System Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Server Status</span>
                    <span className="text-green-500 font-bold">Online</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Backup</span>
                    <span>1 hour ago</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
