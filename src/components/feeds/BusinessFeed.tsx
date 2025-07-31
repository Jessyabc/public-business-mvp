import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, TrendingUp, Calendar, Plus, BarChart3 } from "lucide-react";

export function BusinessFeed() {
  const businessProjects = [
    {
      id: 1,
      title: "Q4 Marketing Campaign",
      department: "Marketing",
      participants: 12,
      status: "In Progress",
      deadline: "Dec 15, 2024",
      priority: "High"
    },
    {
      id: 2,
      title: "Product Development Sprint",
      department: "Engineering",
      participants: 8,
      status: "Planning",
      deadline: "Jan 30, 2025",
      priority: "Medium"
    },
    {
      id: 3,
      title: "Customer Feedback Analysis",
      department: "Research",
      participants: 5,
      status: "Review",
      deadline: "Nov 20, 2024",
      priority: "Low"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress": return "bg-[#489FE3]/20 text-[#489FE3] border-[#489FE3]/30";
      case "Planning": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Review": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-white/20 text-white border-white/30";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Low": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-white/20 text-white border-white/30";
    }
  };

  return (
    <div className="min-h-screen p-6 relative overflow-hidden pb-32">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#489FE3]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#489FE3]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="glass-card rounded-3xl p-8 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Building2 className="w-10 h-10 text-[#489FE3]" />
                <div>
                  <h1 className="text-4xl font-light text-white tracking-wide">
                    Business Hub
                  </h1>
                  <p className="text-white/80 mt-1 font-light">
                    Manage projects, collaborate with teams, and drive results
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="glass-card rounded-2xl p-4 text-center">
                  <BarChart3 className="w-6 h-6 text-[#489FE3] mx-auto mb-1" />
                  <div className="text-white font-medium">23</div>
                  <div className="text-white/60 text-xs">Active Projects</div>
                </div>
                <div className="glass-card rounded-2xl p-4 text-center">
                  <Users className="w-6 h-6 text-[#489FE3] mx-auto mb-1" />
                  <div className="text-white font-medium">156</div>
                  <div className="text-white/60 text-xs">Team Members</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {businessProjects.map((project) => (
            <Card key={project.id} className="glass-card border-white/20 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg font-medium">
                    {project.title}
                  </CardTitle>
                  <Badge className={getPriorityColor(project.priority)}>
                    {project.priority}
                  </Badge>
                </div>
                <p className="text-white/60 text-sm">{project.department}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                  <div className="flex items-center space-x-1 text-white/60 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{project.participants}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-white/60 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {project.deadline}</span>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full glass-card border-[#489FE3]/30 text-[#489FE3] hover:bg-[#489FE3]/10"
                >
                  View Project
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-3xl p-8 backdrop-blur-xl">
          <h3 className="text-white text-xl font-medium mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="glass-card bg-[#489FE3]/20 hover:bg-[#489FE3]/30 text-white border border-[#489FE3]/50 p-6 h-auto">
              <div className="flex flex-col items-center space-y-2">
                <Plus className="w-6 h-6" />
                <span>New Project</span>
              </div>
            </Button>
            <Button className="glass-card bg-purple-500/20 hover:bg-purple-500/30 text-white border border-purple-500/50 p-6 h-auto">
              <div className="flex flex-col items-center space-y-2">
                <Users className="w-6 h-6" />
                <span>Invite Team</span>
              </div>
            </Button>
            <Button className="glass-card bg-green-500/20 hover:bg-green-500/30 text-white border border-green-500/50 p-6 h-auto">
              <div className="flex flex-col items-center space-y-2">
                <TrendingUp className="w-6 h-6" />
                <span>View Analytics</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}