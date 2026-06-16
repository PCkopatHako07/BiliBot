import { createClient } from "@supabase/supabase-js";

// Configured values with direct fallback to the target workspace project credentials
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || "https://fgnuqmwzchzbyfgpmhvr.supabase.co";
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnbnVxbXd6Y2h6YnlmZ3BtaHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxODM5NjcsImV4cCI6MjA4NTc1OTk2N30.A_Enpvfn1MnlEJJto0EdxCBBg_E32XIZV85zHqMKnXc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface StudentStats {
  id?: string;
  student_name: string;
  topic: string;
  correct_answers: number;
  total_questions: number;
  xp: number;
  last_updated?: string;
}

export interface ChatMessage {
  id?: string;
  session_id: string;
  role: "user" | "assistant";
  text: string;
  created_at?: string;
}

export interface StudentSession {
  id: string;
  student_name: string;
  topic: string;
  total_xp: number;
  last_active: string;
}

// Resilient fallback storage using LocalStorage if Supabase tables aren't provisioned or throw an error.
export const db = {
  // Save or Update student session
  async saveSession(session: StudentSession): Promise<void> {
    try {
      const { error } = await supabase
        .from("student_sessions")
        .upsert({
          id: session.id,
          student_name: session.student_name,
          topic: session.topic,
          total_xp: session.total_xp,
          last_active: new Date().toISOString()
        });
      if (error) throw error;
    } catch (err) {
      console.warn("Supabase table 'student_sessions' not found or errored. Falling back to LocalStorage:", err);
      // Fallback
      const sessions = this.getLocalSessions();
      sessions[session.id] = session;
      localStorage.setItem("ed_sessions", JSON.stringify(sessions));
    }
  },

  // Save chat message
  async saveMessage(msg: ChatMessage): Promise<void> {
    try {
      const { error } = await supabase
        .from("chat_messages")
        .insert({
          session_id: msg.session_id,
          role: msg.role,
          text: msg.text,
          created_at: new Date().toISOString()
        });
      if (error) throw error;
    } catch (err) {
      console.warn("Supabase table 'chat_messages' not found or errored. Falling back to LocalStorage:", err);
      const messages = this.getLocalMessages(msg.session_id);
      messages.push({
        ...msg,
        id: Math.random().toString(36).substring(7),
        created_at: new Date().toISOString()
      });
      localStorage.setItem(`ed_msg_${msg.session_id}`, JSON.stringify(messages));
    }
  },

  // Log or update stats for student
  async updateStats(stats: StudentStats): Promise<void> {
    try {
      // Find if stats already exist for student on this topic
      const { data, error: selectError } = await supabase
        .from("student_stats")
        .select("*")
        .eq("student_name", stats.student_name)
        .eq("topic", stats.topic)
        .maybeSingle();

      if (selectError) throw selectError;

      if (data) {
        // Update existing record
        const { error: updateError } = await supabase
          .from("student_stats")
          .update({
            correct_answers: data.correct_answers + stats.correct_answers,
            total_questions: data.total_questions + stats.total_questions,
            xp: data.xp + stats.xp,
            last_updated: new Date().toISOString()
          })
          .eq("id", data.id);
        if (updateError) throw updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from("student_stats")
          .insert({
            student_name: stats.student_name,
            topic: stats.topic,
            correct_answers: stats.correct_answers,
            total_questions: stats.total_questions,
            xp: stats.xp,
            last_updated: new Date().toISOString()
          });
        if (insertError) throw insertError;
      }
    } catch (err) {
      console.warn("Supabase table 'student_stats' not found or errored. Falling back to LocalStorage:", err);
      const allStats = this.getLocalStats();
      const key = `${stats.student_name}_${stats.topic}`;
      if (allStats[key]) {
        allStats[key].correct_answers += stats.correct_answers;
        allStats[key].total_questions += stats.total_questions;
        allStats[key].xp += stats.xp;
        allStats[key].last_updated = new Date().toISOString();
      } else {
        allStats[key] = {
          student_name: stats.student_name,
          topic: stats.topic,
          correct_answers: stats.correct_answers,
          total_questions: stats.total_questions,
          xp: stats.xp,
          last_updated: new Date().toISOString()
        };
      }
      localStorage.setItem("ed_stats", JSON.stringify(allStats));
    }
  },

  // Get Leaderboard across all topics or specific topic
  async getLeaderboard(topic?: string): Promise<StudentStats[]> {
    try {
      let query = supabase
        .from("student_stats")
        .select("*")
        .order("xp", { ascending: false })
        .limit(10);
      
      if (topic) {
        query = query.eq("topic", topic);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn("Supabase leaderboard fetch failed. Returning local fallback leaderboard:", err);
      const allStats = this.getLocalStats();
      const statsList = Object.values(allStats) as StudentStats[];
      const filtered = topic ? statsList.filter(s => s.topic === topic) : statsList;
      
      // Group by student_name to sum scores for general leaderboard if no topic
      if (!topic) {
        const studentAgg: { [key: string]: StudentStats } = {};
        filtered.forEach(s => {
          if (studentAgg[s.student_name]) {
            studentAgg[s.student_name].xp += s.xp;
            studentAgg[s.student_name].correct_answers += s.correct_answers;
            studentAgg[s.student_name].total_questions += s.total_questions;
          } else {
            studentAgg[s.student_name] = { ...s };
          }
        });
        return Object.values(studentAgg).sort((a, b) => b.xp - a.xp).slice(0, 10);
      }

      return filtered.sort((a, b) => b.xp - a.xp).slice(0, 10);
    }
  },

  // Load chat messages for session
  async getSessionChat(sessionId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (err) {
      return this.getLocalMessages(sessionId);
    }
  },

  // Load sessions list for a student
  async getStudentSessions(studentName: string): Promise<StudentSession[]> {
    try {
      const { data, error } = await supabase
        .from("student_sessions")
        .select("*")
        .eq("student_name", studentName)
        .order("last_active", { ascending: false });
      if (error) throw error;
      return (data as StudentSession[]) || [];
    } catch (err) {
      const sessions = this.getLocalSessions();
      return (Object.values(sessions) as StudentSession[])
        .filter((s: StudentSession) => s.student_name.toLowerCase() === studentName.toLowerCase())
        .sort((a: StudentSession, b: StudentSession) => new Date(b.last_active).getTime() - new Date(a.last_active).getTime());
    }
  },

  // Helper local accessors
  getLocalSessions(): { [key: string]: StudentSession } {
    const raw = localStorage.getItem("ed_sessions");
    return raw ? JSON.parse(raw) : {};
  },

  getLocalMessages(sessionId: string): ChatMessage[] {
    const raw = localStorage.getItem(`ed_msg_${sessionId}`);
    return raw ? JSON.parse(raw) : [];
  },

  getLocalStats(): { [key: string]: any } {
    const raw = localStorage.getItem("ed_stats");
    return raw ? JSON.parse(raw) : {};
  }
};
