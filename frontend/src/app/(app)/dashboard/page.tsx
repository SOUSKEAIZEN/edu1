import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Clock, Target, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <section className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Good morning, Alex.</h1>
          <p className="text-sm text-muted mt-1">Here is your academic overview for the Spring Semester.</p>
        </div>
        <Button size="sm" className="h-8 px-4">
          Ask AI Mentor
        </Button>
      </section>

      {/* KPI Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-surface/50 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Overall GPA</span>
              <Target className="h-4 w-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tighter">3.8</span>
              <span className="text-xs text-green-500 font-medium flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> 0.2
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-surface/50 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Attendance</span>
              <Clock className="h-4 w-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tighter">94%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-surface/50 shadow-sm md:col-span-2">
          <CardContent className="p-5 flex items-center justify-between h-full">
            <div>
              <div className="flex items-center gap-2 text-orange-500 mb-1">
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Attention Required</span>
              </div>
              <p className="text-sm font-medium">DBMS Normalization Assignment due in 2 days</p>
            </div>
            <Button variant="outline" size="sm">View Task</Button>
          </CardContent>
        </Card>
      </section>

      {/* Main Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Performance */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-medium text-muted uppercase tracking-wider">Recent Performance</h3>
          <Card className="border-surface/50 shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface/30 border-b text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Assessment</th>
                  <th className="px-4 py-3 font-medium text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                <tr className="hover:bg-surface/30 transition-colors">
                  <td className="px-4 py-3 font-medium">CS301 - Databases</td>
                  <td className="px-4 py-3 text-muted">Midterm Exam</td>
                  <td className="px-4 py-3 text-right font-medium text-red-500">64%</td>
                </tr>
                <tr className="hover:bg-surface/30 transition-colors">
                  <td className="px-4 py-3 font-medium">MATH201 - Linear Algebra</td>
                  <td className="px-4 py-3 text-muted">Quiz 4</td>
                  <td className="px-4 py-3 text-right font-medium">92%</td>
                </tr>
                <tr className="hover:bg-surface/30 transition-colors">
                  <td className="px-4 py-3 font-medium">CS305 - Algorithms</td>
                  <td className="px-4 py-3 text-muted">Assignment 2</td>
                  <td className="px-4 py-3 text-right font-medium">88%</td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>

        {/* Right Column: AI Insights */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted uppercase tracking-wider">AI Recommendations</h3>
          <Card className="border-surface/50 shadow-sm bg-gradient-to-b from-background to-surface/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Priority Action</CardTitle>
              <CardDescription className="text-xs">Based on your recent 64% in Databases.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                Review Database Normalization (1NF to 3NF). I have prepared a personalized practice set focusing on the concepts you missed.
              </p>
              <Button size="sm" className="w-full">Start Practice Session</Button>
            </CardContent>
          </Card>
        </div>

      </section>
    </div>
  );
}
