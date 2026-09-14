import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, Sparkles, BookOpen, Target, Calendar } from 'lucide-react';

export default function MentorPage() {
  return (
    <div className="flex h-full max-h-full overflow-hidden animate-in fade-in duration-500">
      
      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col border-r bg-background/50">
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b px-6 bg-surface/50 backdrop-blur">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bot className="h-4 w-4" />
            </div>
            <span className="font-medium text-sm">Academic Mentor</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Online</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* System intro */}
          <div className="flex justify-center">
            <span className="text-xs text-muted font-medium bg-surface/50 px-3 py-1 rounded-full">Today at 10:42 AM</span>
          </div>

          {/* AI Message */}
          <div className="flex gap-4 max-w-3xl">
            <div className="flex-shrink-0 mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bot className="h-4 w-4" />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted">AI Mentor</span>
              <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed">
                <p>Hello Alex. I noticed your recent score in <strong>CS301 (Databases)</strong> dropped to 64%. I&apos;ve analyzed the assessment and it looks like <em>Database Normalization</em> was the main struggle.</p>
                <p>Would you like me to explain 3NF conceptually, or should we jump straight into some practice questions?</p>
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" className="h-7 text-xs rounded-full">Explain 3NF</Button>
                <Button variant="outline" size="sm" className="h-7 text-xs rounded-full">Start Practice</Button>
              </div>
            </div>
          </div>

          {/* User Message */}
          <div className="flex gap-4 max-w-3xl ml-auto flex-row-reverse">
            <div className="flex-shrink-0 mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-surface text-muted">
              A
            </div>
            <div className="space-y-1 text-right">
              <span className="text-xs font-semibold text-muted">You</span>
              <div className="bg-surface/50 px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm text-foreground/90 inline-block text-left">
                Could you explain the difference between 2NF and 3NF simply?
              </div>
            </div>
          </div>

          {/* AI Message Streaming */}
          <div className="flex gap-4 max-w-3xl">
            <div className="flex-shrink-0 mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4 animate-pulse" />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted">AI Mentor is typing...</span>
            </div>
          </div>

        </div>

        {/* Input Area */}
        <div className="p-4 bg-background border-t">
          <div className="max-w-4xl mx-auto relative flex items-center">
            <Input 
              className="pr-12 py-6 rounded-xl bg-surface/50 border-surface focus-visible:ring-primary/20 shadow-sm" 
              placeholder="Ask me anything about your studies..." 
            />
            <Button size="icon" className="absolute right-2 h-8 w-8 rounded-lg">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="max-w-4xl mx-auto flex justify-center gap-4 mt-3 text-xs text-muted">
            <span className="hover:text-foreground cursor-pointer transition-colors">/analyze</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">/plan</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">/practice</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">/review</span>
          </div>
        </div>
      </div>

      {/* Context Sidebar (Premium integrated feel) */}
      <div className="hidden xl:flex w-80 flex-col bg-surface/20 border-l">
        <div className="p-4 border-b bg-surface/30">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Active Context</h3>
        </div>
        <div className="flex-1 p-4 space-y-6 overflow-y-auto">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <BookOpen className="h-4 w-4 text-primary" />
              CS301 - Databases
            </div>
            <div className="p-3 rounded-lg bg-surface/50 border border-border/50 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted">Current Avg:</span>
                <span className="font-medium text-red-400">64%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Status:</span>
                <span className="font-medium">At Risk</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Target className="h-4 w-4 text-primary" />
              Current Focus
            </div>
            <div className="p-3 rounded-lg bg-surface/50 border border-border/50 text-xs space-y-2">
              <p className="text-muted leading-relaxed">
                Mastering Database Normalization before the final project milestone.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-primary" />
              Next Deadline
            </div>
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs space-y-1">
              <p className="font-medium text-red-500">Schema Design Project</p>
              <p className="text-red-500/80">Due in 2 days</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
