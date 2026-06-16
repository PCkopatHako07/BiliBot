import React, { useState, useEffect, useRef } from "react";
import { 
  Shield, 
  Cpu, 
  Globe, 
  Code2, 
  Award, 
  Send, 
  LogOut, 
  ArrowLeft, 
  Loader2, 
  Sparkles, 
  Trophy, 
  BookOpen, 
  BrainCircuit, 
  RefreshCw, 
  User, 
  Flame, 
  HelpCircle,
  CheckCircle2,
  XCircle,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LEARNING_UNITS, UnitKey, LearningUnit } from "./types";
import { db, StudentStats, StudentSession, ChatMessage } from "./lib/supabase";

export interface FallbackQuestion {
  text: string;
  question: string;
  options: string[];
  correctOption: string;
  feedbackIfCorrect: string;
  feedbackIfIncorrect: string;
}

const FALLBACK_QUESTIONS: Record<UnitKey, FallbackQuestion[]> = {
  [UnitKey.DIGITAL_CITIZENSHIP]: [
    {
      text: "Güvenli internet kullanımı her şeyden önce gelir! Kişisel bilgilerinizin korunması en önemli kurallardandır.",
      question: "Güvendiğimiz bir oyun sitesi bile olsa bizden T.C. Kimlik numaramızı veya ev adresimizi isterse ne yapmalıyız?",
      options: [
        "A) Oyun oynamak için hemen vermeliyiz.",
        "B) Hayır, kişisel bilgilerimizi kesinlikle paylaşmamalıyız.",
        "C) Öylesine uydurma bir numara yazıp devam etmeliyiz."
      ],
      correctOption: "B",
      feedbackIfCorrect: "Harika! Kesinlikle doğru bildin. 🎉 Kişisel bilgiler siber hırsızların eline geçebilir. Kendini korumak en öncelikli kuralımız! +10 XP kazandın!",
      feedbackIfIncorrect: "Dikkatli olmalısın! 💡 Oyun siteleri dahi olsa internette hiçbir platformda T.C. Kimlik numarası, şifre veya adresimizi kesinlikle paylaşmamalıyız. +2 Katılım XP!"
    },
    {
      text: "Süper! Şimdi ikinci konumuz: **Güçlü Şifre Oluşturma**! Hesaplarımızın korunması için şifrelerin başkaları tarafından kolay tahmin edilememesi gerekir.",
      question: "Sence aşağıdaki seçeneklerden hangisi en GÜVENLİ şifre örneğidir?",
      options: [
        "A) 123456bilişim",
        "B) benimbilgisayarım",
        "C) BiliS1m_2026!"
      ],
      correctOption: "C",
      feedbackIfCorrect: "Mükemmel! En az bir büyük harf, küçük harf, rakam ve özel karakter içeren şifreler siber saldırılardan en iyi şekilde korur. +10 XP kazandın!",
      feedbackIfIncorrect: "Denemek öğrenmenin en güzel yoludur! Şifremiz kolay kelimeler, doğum tarihi veya ardışık sayılar barındırmamalı, karmaşık ve özel karakterli olmalıdır. +2 Katılım XP!"
    },
    {
      text: "Harika gidiyorsun! Sırada **Dijital Ayak İzi** var. İnternette paylaştığımız fotoğraf, yorum ve yaptığımız her arama arkamızda silinmeyen kalıcı izler bırakır.",
      question: "Dijital ayak izimizin gelecekte bizi üzmemesi için paylaşım yaparken hangisine en çok dikkat etmeliyiz?",
      options: [
        "A) Her aklımıza geleni hemen paylaşıp ertesi gün silmeliyiz.",
        "B) Paylaşım yapmadan önce iki kez düşünmeli, saygılı ve dikkatli olmalıyız.",
        "C) Sadece arkadaşlarımızın göreceği şekilde her türlü sırrımızı yayınlamalıyız."
      ],
      correctOption: "B",
      feedbackIfCorrect: "Süpersin! İnternete yüklenen bilgiler kolay kolay kaybolmaz; bu yüzden her paylaşımı iyice düşünerek yapmalıyız. +10 XP kazandın!",
      feedbackIfIncorrect: "Hiç üzülme! Dijital dünyada paylaştıklarımız silinse bile başkaları tarafından kaydedilebilir, bu yüzden her yayından önce çok iyi düşünmeliyiz. +2 Katılım XP!"
    }
  ],
  [UnitKey.HARDWARE_SOFTWARE]: [
    {
      text: "Bilgisayarın kapağını kaldırıp içindeki sihirli mikroçipleri keşfetmeye hazır mısın?",
      question: "Bilgisayarın beyni olarak kabul edilen, saniyede milyonlarca işlem yapan ve tüm donanımları yöneten iç donanım bileşeni hangisidir?",
      options: [
        "A) İşlemci (CPU)",
        "B) Anakart",
        "C) Sabit Disk (HDD)"
      ],
      correctOption: "A",
      feedbackIfCorrect: "Aynen öyle! İşlemci (CPU), bilgisayarın beynidir ve tüm komutları o işler. Harika, +10 XP kazandın! 🎉",
      feedbackIfIncorrect: "Öğrenmeye devam! Bilgisayarın beyni, saniyede milyarlarca işi sırayla çözen İşlemci yani CPU'dur. +2 Katılım XP!"
    },
    {
      text: "Süper, şimdi sırada geçici bellek var. Bilgisayar açıkken o an çalışan uygulamaların ve pencerelerin çalışma verilerini geçici hafızasında tutan parça.",
      question: "Bilgisayar kapatıldığında içindeki tüm verileri sıfırlanan bu geçici bellek birimi hangisidir?",
      options: [
        "A) Sabit Disk (Storage)",
        "B) RAM Bellek",
        "C) Ekran Kartı"
      ],
      correctOption: "B",
      feedbackIfCorrect: "Doğru Cevap! RAM (Rastgele Erişimli Bellek) ne kadar yüksekse, bilgisayarımız aynı anda o kadar çok uygulamayı kasmadan ve hızlıca çalıştırabilir. +10 XP!",
      feedbackIfIncorrect: "Çok normal! Doğru cevap **RAM Bellek** olacaktı. Bilgisayar kapatıldığında içindeki verileri sıfırlayan geçici çalışma masası RAM bellektir. +2 Katılım XP!"
    },
    {
      text: "Harika! Şimdi yazılım dünyasına bakalım. Bilgisayarların ve akıllı telefonların açılabilmesini sağlayan, tüm uygulamaları yöneten en temel yazılıma İşletim Sistemi diyoruz.",
      question: "Aşağıdaki yazılımlardan hangisi Türkiye'de geliştirilen açık kaynak kodlu milli işletim sistemimizdir?",
      options: [
        "A) Windows",
        "B) Pardus",
        "C) Android"
      ],
      correctOption: "B",
      feedbackIfCorrect: "Harikasın! Pardus, TÜBİTAK tarafından geliştirilen gururumuz, açık kaynak kodlu milli işletim sistemimizdir. +10 XP!",
      feedbackIfIncorrect: "Hiç üzülme! Doğru cevap TÜBİTAK tarafından geliştirilen milli işletim sistemimiz olan **Pardus** olacaktı. +2 Katılım XP!"
    }
  ],
  [UnitKey.NETWORKS_INTERNET]: [
    {
      text: "Bilgisayarların birbiriyle konuşmasını sağlayan sihirli ağlara göz atalım.",
      question: "Aynı oda, laboratuvar veya aynı okul binası gibi dar bir alandaki bilgisayarları birbirine bağlayan ağ türüne ne denir?",
      options: [
        "A) LAN (Yerel Alan Ağı)",
        "B) WAN (Geniş Alan Ağı)",
        "C) PAN (Kişisel Alan Ağı)"
      ],
      correctOption: "A",
      feedbackIfCorrect: "Tebrikler! LAN (Local Area Network) yerel bir bölgedeki okul, laboratuvar veya ev ağları için kullanılır. +10 XP!",
      feedbackIfIncorrect: "Harika bir deneme! Okul içi veya laboratuvarlardaki gibi kısıtlı ve dar alandaki bağlantılara **LAN (Yerel Alan Ağı)** diyoruz. +2 Katılım XP!"
    },
    {
      text: "Harika! Şimdi internetin adres kurallarına bakalım. İnternete bağlı her cihazın benzersiz bir kimlik numarası vardır.",
      question: "İnternete bağlanan her bilgisayara otomatik verilen, cihazların birbiriyle iletişim kurmasını sağlayan bu adrese ne isim verilir?",
      options: [
        "A) IP Adresi",
        "B) HTML Kodu",
        "C) E-Posta Adresi"
      ],
      correctOption: "A",
      feedbackIfCorrect: "Tam isabet! IP Adresi (Internet Protocol), internete bağlı her cihazın benzersiz adresidir ve iletişimi sağlar. +10 XP!",
      feedbackIfIncorrect: "Yavaş yavaş öğreneceğiz! Cihazların internetteki ev adresi gibi olan benzersiz adreslerine **IP Adresi** denir. +2 Katılım XP!"
    }
  ],
  [UnitKey.ALGORITHMS_CODING]: [
    {
      text: "Harika bir seçim: **Problem Çözme & Algoritmalar**! Bilgilerimizi sıralı adımlarla inşa edeceğiz.",
      question: "Bir problemin çözümü için tasarlanan, başlangıcı ve bitişi belli olan, mantıklı ve sıralı adımlar bütününe ne ad verilir?",
      options: [
        "A) Değişken",
        "B) Algoritma",
        "C) Döngü"
      ],
      correctOption: "B",
      feedbackIfCorrect: "Muhteşem! Algoritma, kodlamanın temel yol haritasıdır ve her program bir algoritmayla başlar. +10 XP kazandın! 🎉",
      feedbackIfIncorrect: "Hiç canını sıkma! Bir problemin adım adım pratik çözüm planına **Algoritma** denir. En başından sonuna kadar planlı adımlardan oluşur. +2 Katılım XP!"
    },
    {
      text: "Süper! Algoritmalarda bazı kararları şartlara bağlarız. Örneğin: 'Hava yağmurlu ise şemsiye al'.",
      question: "Scratch veya blok programlamada, bir işlemin belirli bir şarta bağlı olarak çalıştırılmasını sağlayan blok hangisidir?",
      options: [
        "A) Sürekli Tekrar Et",
        "B) Eğer ... ise (If statement)",
        "C) 10 Defa Dön"
      ],
      correctOption: "B",
      feedbackIfCorrect: "Kesinlikle doğru! 'Eğer ... ise' bloğu yazılımların mantıklı seçimler ve kararlar vermesini sağlar. +10 XP!",
      feedbackIfIncorrect: "Öğrenmeye devam! Bir durumun gerçekleşip gerçekleşmediğini kontrol eden kontrol kodumuz **Eğer ... ise** bloğudur. +2 Katılım XP!"
    },
    {
      text: "Harikasın! Son sorumuza gelelim. Algoritmalarda sürekli tekrarlanan şeyleri tek tek yazarak vakit kaybetmek istemeyiz.",
      question: "Aynı kod grubunu belirli bir sayıda veya şart sağlandığı sürece arka arkaya çalıştırmak için kullanılan yapıya ne denir?",
      options: [
        "A) Döngü (Loop)",
        "B) Değişken",
        "C) Algoritma Başlangıcı"
      ],
      correctOption: "A",
      feedbackIfCorrect: "Müthişsin! Döngüler, kodlarımızın gereksiz yere uzamasını engelleyen akıllı tekrarlama yapılarıdır. +10 XP!",
      feedbackIfIncorrect: "Harika bir deneme! Tekrarlayan kod bloklarını çalıştırmak için kullanılan yapıya **Döngü (Loop)** adı verilir. +2 Katılım XP!"
    }
  ]
};

export default function App() {
  // Session / Authentication state
  const [studentName, setStudentName] = useState<string>(() => {
    return localStorage.getItem("bilibot_student_name") || "";
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!localStorage.getItem("bilibot_student_name");
  });

  // Navigation and dynamic interface states
  const [activeTab, setActiveTab] = useState<"dashboard" | "chat" | "leaderboard" | "profile">("dashboard");
  const [selectedUnit, setSelectedUnit] = useState<LearningUnit | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [fallbackIndex, setFallbackIndex] = useState<number>(0);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  
  // Stats and Rewards Tracker (gamified)
  const [totalXp, setTotalXp] = useState<number>(0);
  const [stats, setStats] = useState<StudentStats[]>([]);
  const [leaderboard, setLeaderboard] = useState<StudentStats[]>([]);
  const [sessionsList, setSessionsList] = useState<StudentSession[]>([]);
  const [showXpPopup, setShowXpPopup] = useState<{ amount: number; visible: boolean }>({ amount: 0, visible: false });
  const [lastFeedback, setLastFeedback] = useState<{ isCorrect: boolean; show: boolean; explanation: string } | null>(null);

  // Mascot Animator states
  const [mascotState, setMascotState] = useState<"hello" | "smile" | "ponder" | "excited" | "sad">("hello");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto Scroll chat to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Load Initial Student Data
  useEffect(() => {
    if (isLoggedIn && studentName) {
      loadStudentData();
    }
  }, [isLoggedIn, studentName]);

  const loadStudentData = async () => {
    const sessions = await db.getStudentSessions(studentName);
    setSessionsList(sessions);

    // Calc total XP across sessions
    const sumXp = sessions.reduce((sum, s) => sum + s.total_xp, 0);
    setTotalXp(sumXp || 10); // Start with 10 free base XP

    // Fetch Leaderboard
    const lb = await db.getLeaderboard();
    setLeaderboard(lb);

    // Keep Mascot Happy
    setMascotState("smile");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentName.trim()) {
      const formattedName = studentName.trim();
      localStorage.setItem("bilibot_student_name", formattedName);
      setStudentName(formattedName);
      setIsLoggedIn(true);
      setTotalXp(10); // Base starting XP
      setMascotState("excited");
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("bilibot_student_name");
    setStudentName("");
    setIsLoggedIn(false);
    setSelectedUnit(null);
    setMessages([]);
    setActiveTab("dashboard");
    setShowLogoutModal(false);
  };

  // Start chatbot learning session with specific topic selection
  const startLearningSession = async (unit: LearningUnit) => {
    setSelectedUnit(unit);
    setActiveTab("chat");
    setIsLoading(true);
    setMascotState("ponder");
    setFallbackIndex(0);

    // Generate unique session ID
    const sessionId = `sess_${unit.key}_${Date.now()}`;
    setCurrentSessionId(sessionId);

    // Inital Welcome prompt injection for backend
    const initialPrompt = `Merhaba! Ben ${studentName}. Bugün "${unit.title}" konusunu tekrar etmek istiyorum. Bana bu ünite hakkında bir başlangıç yap, konuyu kısaca açıkla ve ardından bana ilk sorumu sor!`;

    const initialMessages = [
      { role: "user", text: initialPrompt }
    ];

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: initialMessages,
          currentTopic: unit.title
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setMascotState("smile");

      // Set chat messages state
      const firstAssistantMessage = {
        role: "assistant",
        text: data.explanation,
        question: data.question,
        options: data.options,
        topic: data.topic || unit.title
      };

      setMessages([firstAssistantMessage]);

      // Save Initial Session in DB
      const newSessionObj: StudentSession = {
        id: sessionId,
        student_name: studentName,
        topic: unit.title,
        total_xp: 10,
        last_active: new Date().toISOString()
      };
      await db.saveSession(newSessionObj);
      await db.saveMessage({
        session_id: sessionId,
        role: "assistant",
        text: `${data.explanation}\n\nSoru: ${data.question}`
      });

    } catch (error) {
      console.error("Session start error:", error);
      // Hardcoded offline content fallback inside UI in case API fails
      const currentUnitKey = unit.key || UnitKey.DIGITAL_CITIZENSHIP;
      const questionsList = FALLBACK_QUESTIONS[currentUnitKey] || FALLBACK_QUESTIONS[UnitKey.DIGITAL_CITIZENSHIP];
      const initialFallbackQuestion = questionsList[0];

      setMessages([
        {
          role: "assistant",
          text: `Merhaba ${studentName}! 🤖 Harika bir seçim: **${unit.title}**! Şimdi seninle bu konuyu harika bir şekilde işleyeceğiz.\n\n${initialFallbackQuestion.text}`,
          question: initialFallbackQuestion.question,
          options: initialFallbackQuestion.options,
          topic: unit.title
        }
      ]);
      setMascotState("smile");
    } finally {
      setIsLoading(false);
    }
  };

  // Resume old sessions
  const resumeSession = async (session: StudentSession) => {
    setIsLoading(true);
    setCurrentSessionId(session.id);
    setActiveTab("chat");
    setMascotState("ponder");

    // Clear unit if it does not match
    const foundUnit = LEARNING_UNITS.find(u => u.title === session.topic) || LEARNING_UNITS[0];
    setSelectedUnit(foundUnit);

    try {
      const historicMessages = await db.getSessionChat(session.id);
      
      if (historicMessages.length > 0) {
        // Map messages to local chat state
        const mapped = historicMessages.map((m: ChatMessage) => {
          // Attempt to extract question from bottom of string
          const hasQuestion = m.text.includes("Soru:");
          let cleanText = m.text;
          let questionText = "";
          if (hasQuestion) {
            const parts = m.text.split("Soru:");
            cleanText = parts[0]?.trim();
            questionText = parts[1]?.trim();
          }

          return {
            role: m.role,
            text: cleanText,
            question: questionText || undefined,
            options: m.role === "assistant" && hasQuestion ? ["A) Evet, kesinlikle doğru.", "B) Hayır, yanlış bilgi."] : []
          };
        });
        setMessages(mapped);
      } else {
        await startLearningSession(foundUnit);
      }

      setMascotState("smile");
    } catch (e) {
      console.error("Resume failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle student sending text or selecting a generated response option
  const sendStudentResponse = async (answerText: string) => {
    if (!answerText.trim() || isLoading) return;

    setUserAnswer("");
    setIsLoading(true);
    setMascotState("ponder");

    // Add student message to local chat screen
    const updatedMessages = [
      ...messages,
      { role: "user", text: answerText }
    ];
    setMessages(updatedMessages);

    // Save student reply message in DB
    await db.saveMessage({
      session_id: currentSessionId,
      role: "user",
      text: answerText
    });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, text: m.text + (m.question ? `\nSoru: ${m.question}` : "") })),
          currentTopic: selectedUnit?.title || "Bilişim"
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Handle Dynamic XP Accumulation and mascot mood
      let earn = data.xpEarned || 5;
      if (data.isLastAnswerCorrect === true) {
        setMascotState("excited");
        earn = 10;
        triggerXpAward(10);
        setLastFeedback({
          isCorrect: true,
          show: true,
          explanation: "Harika! Doğru cevap vererek tam +10 XP kazandın! 🌟 🎉"
        });
      } else if (data.isLastAnswerCorrect === false) {
        setMascotState("sad");
        earn = 2;
        triggerXpAward(2);
        setLastFeedback({
          isCorrect: false,
          show: true,
          explanation: "Önemli değil! Denemek öğrenmenin en güzel yoludur. +2 Katılım XP kazandın! 💡"
        });
      } else {
        setMascotState("smile");
        earn = 5;
        triggerXpAward(5);
      }

      // Automatically hide feedback popup after 4 seconds
      setTimeout(() => {
        setLastFeedback(prev => prev ? { ...prev, show: false } : null);
      }, 4500);

      // Save statistics in DB
      if (data.isLastAnswerCorrect !== null) {
        await db.updateStats({
          student_name: studentName,
          topic: data.topic || selectedUnit?.title || "Genel Bilişim",
          correct_answers: data.isLastAnswerCorrect ? 1 : 0,
          total_questions: 1,
          xp: earn
        });
      }

      // Add assistant evaluated statement to local layout
      const nextAssistantMessage = {
        role: "assistant",
        text: data.explanation,
        question: data.question,
        options: data.options,
        topic: data.topic
      };

      setMessages(prev => [...prev, nextAssistantMessage]);

      // Save assistant processed response in DB
      await db.saveMessage({
        session_id: currentSessionId,
        role: "assistant",
        text: `${data.explanation}\n\nSoru: ${data.question}`
      });

      // Update XP Counter & Session Stats
      setTotalXp(prev => prev + earn);

      const sessUpdate: StudentSession = {
        id: currentSessionId,
        student_name: studentName,
        topic: selectedUnit?.title || "Bilişim",
        total_xp: totalXp + earn,
        last_active: new Date().toISOString()
      };
      await db.saveSession(sessUpdate);

    } catch (err) {
      console.error("Chat error:", err);
      // Fallback response inside UI
      setTimeout(async () => {
        const currentUnitKey = selectedUnit?.key || UnitKey.DIGITAL_CITIZENSHIP;
        const questionsList = FALLBACK_QUESTIONS[currentUnitKey] || FALLBACK_QUESTIONS[UnitKey.DIGITAL_CITIZENSHIP];
        const currentQuestionObj = questionsList[fallbackIndex];
        
        let isCorrect = false;
        if (currentQuestionObj) {
          isCorrect = answerText.toUpperCase().trim().startsWith(currentQuestionObj.correctOption.toUpperCase());
        }

        // Handle XP and feedback popup based on correctness
        let earnedXp = 5;
        let feedbackText = "";
        
        if (isCorrect) {
          setMascotState("excited");
          earnedXp = 10;
          triggerXpAward(10);
          feedbackText = currentQuestionObj.feedbackIfCorrect;
          setLastFeedback({
            isCorrect: true,
            show: true,
            explanation: currentQuestionObj.feedbackIfCorrect
          });
        } else {
          setMascotState("sad");
          earnedXp = 2;
          triggerXpAward(2);
          feedbackText = currentQuestionObj ? currentQuestionObj.feedbackIfIncorrect : "Denemek öğrenmenin en güzel yoludur! +2 Katılım XP!";
          setLastFeedback({
            isCorrect: false,
            show: true,
            explanation: feedbackText
          });
        }

        setTimeout(() => {
          setLastFeedback(prev => prev ? { ...prev, show: false } : null);
        }, 4500);

        // Update Stats in Database
        try {
          await db.updateStats({
            student_name: studentName,
            topic: selectedUnit?.title || "Genel Bilişim",
            correct_answers: isCorrect ? 1 : 0,
            total_questions: 1,
            xp: earnedXp
          });
        } catch (dbErr) {
          console.error("Failed to update stats in DB:", dbErr);
        }

        // Go to next question
        const nextIndex = fallbackIndex + 1;
        setFallbackIndex(nextIndex);

        let defaultReply;
        if (nextIndex < questionsList.length) {
          const nextQuestionObj = questionsList[nextIndex];
          defaultReply = {
            role: "assistant",
            text: `${feedbackText}\n\n${nextQuestionObj.text}`,
            question: nextQuestionObj.question,
            options: nextQuestionObj.options,
            topic: selectedUnit?.title || "Bilişim"
          };
        } else {
          // Unit complete!
          defaultReply = {
            role: "assistant",
            text: `${feedbackText}\n\n🎉 Tebrikler! **${selectedUnit?.title}** ünitesinin tüm tekrar sorularını başarıyla tamamladın! Harika bir Bilişim Savaşçısı oldun. Bir diğer üniteyi pekiştirmek için sol üstteki geri tuşuna basarak yeni bir mücadeleye başlayabilirsin! 🏆🚀`,
            question: undefined,
            options: [],
            topic: selectedUnit?.title || "Bilişim"
          };
        }

        setMessages(prev => [...prev, defaultReply]);

        try {
          await db.saveMessage({
            session_id: currentSessionId,
            role: "assistant",
            text: defaultReply.question ? `${defaultReply.text}\n\nSoru: ${defaultReply.question}` : defaultReply.text
          });
        } catch (dbErr) {
          console.error("Failed to save fallback message in DB:", dbErr);
        }

        setTotalXp(prev => prev + earnedXp);

        try {
          const sessUpdate: StudentSession = {
            id: currentSessionId,
            student_name: studentName,
            topic: selectedUnit?.title || "Bilişim",
            total_xp: totalXp + earnedXp,
            last_active: new Date().toISOString()
          };
          await db.saveSession(sessUpdate);
        } catch (dbErr) {
          console.error("Failed to save fallback session in DB:", dbErr);
        }

      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerXpAward = (amount: number) => {
    setShowXpPopup({ amount, visible: true });
    setTimeout(() => {
      setShowXpPopup({ amount: 0, visible: false });
    }, 1500);
  };

  // Dynamic Lucide Icon Mapper
  const renderUnitIcon = (iconName: string, classNameString: string) => {
    const props = { className: classNameString, size: 28 };
    switch (iconName) {
      case "ShieldAlert": return <Shield {...props} />;
      case "Cpu": return <Cpu {...props} />;
      case "Globe": return <Globe {...props} />;
      case "CodeXml": return <Code2 {...props} />;
      default: return <GraduationCap {...props} />;
    }
  };

  // Get active student ranking badge milestones
  const getBadgeMilestones = () => {
    const list = [
      { id: "1", title: "Bilişim Çaylağı", req: "10 XP", unlocked: totalXp >= 10, icon: "🛡️" },
      { id: "2", title: "Sıra Dışı Dijital Vatandaş", req: "40 XP", unlocked: totalXp >= 40, icon: "👤" },
      { id: "3", title: "Donanım Profesörü", req: "80 XP", unlocked: totalXp >= 80, icon: "⚡" },
      { id: "4", title: "Ağların Hakimi", req: "120 XP", unlocked: totalXp >= 120, icon: "🌐" },
      { id: "5", title: "Geleceğin Yazılımcısı", req: "180 XP", unlocked: totalXp >= 180, icon: "🛸" },
      { id: "6", title: "BiliBot Bilgesi", req: "250 XP", unlocked: totalXp >= 250, icon: "👑" },
    ];
    return list;
  };

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-slate-900 flex flex-col font-sans overflow-x-hidden antialiased selection:bg-yellow-300 selection:text-slate-900">
      
      {/* Floating Gamified XP Toast */}
      <AnimatePresence>
        {showXpPopup.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: -20, scale: 1.2 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <div className="bg-yellow-400 text-slate-950 font-black px-8 py-5 rounded-full shadow-2xl flex items-center gap-3 border-4 border-slate-950 text-2xl font-display uppercase tracking-wider animate-bounce">
              <Sparkles className="animate-spin text-slate-950" size={28} />
              <span>+{showXpPopup.amount} XP kazandın! 🎉</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-700 border-b-8 p-6 max-w-sm w-full text-center space-y-4 shadow-2xl"
            >
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/30 text-rose-500 rounded-full flex items-center justify-center mx-auto text-3xl">
                ⚠️
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white font-display uppercase tracking-wider">
                Çıkış Yapılsın Mı?
              </h3>
              <p className="text-slate-600 dark:text-slate-350 text-sm font-semibold leading-relaxed">
                Sevgili <span className="font-extrabold text-blue-600 dark:text-blue-400 uppercase">{studentName}</span>, oturumu kapatmak istediğine emin misin? Kayıtlı bilgilerin ve kazandığın unvanlar bu tarayıcıda saklanmaya devam edecek!
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-black rounded-xl text-sm transition-all cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={confirmLogout}
                  className="flex-1 py-2.5 px-4 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-xl text-sm border-b-4 border-rose-700 active:border-b-0 active:translate-y-1 transition-all cursor-pointer"
                >
                  Evet, Çıkış Yap
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION - Styled with Vibrant Palette colors (blue-600 with yellow components) */}
      <header className="bg-blue-600 text-white shadow-lg py-4 px-6 md:px-12 sticky top-0 z-40 border-b-4 border-blue-700">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-2xl shadow-inner border-2 border-white transform hover:scale-110 transition-transform">
              🤖
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight uppercase font-display">
                Bilişim Tekrar Botu
              </h1>
              <p className="text-xs font-bold text-blue-100 uppercase tracking-widest">
                5. & 6. Sınıf Ünite Tekrarı • Maarif Modeli
              </p>
            </div>
          </div>

          {isLoggedIn && (
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              {/* Vibrant indicators */}
              <div className="px-4 py-2 bg-blue-500 rounded-full text-xs font-black border-2 border-blue-400 flex items-center gap-1.5 shadow-sm text-yellow-300">
                <Flame size={14} className="animate-pulse" />
                <span>PUAN: {totalXp} XP 🏆</span>
              </div>

              <div className="px-4 py-2 bg-blue-700 rounded-full text-xs font-black text-white flex items-center gap-1.5 uppercase">
                <User size={13} className="text-yellow-400" />
                <span>{studentName}</span>
              </div>

              <button
                onClick={handleLogout}
                className="bg-rose-500 hover:bg-rose-600 border-b-4 border-rose-700 text-white px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 active:translate-y-0.5"
                title="Çıkış Yap"
                id="btn-logout"
              >
                <LogOut size={14} />
                <span>ÇIK</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* BEFORE LOGIN LAYER */}
      {!isLoggedIn ? (
        <main className="flex-1 max-w-7xl mx-auto p-6 md:p-12 flex flex-col lg:flex-row items-center justify-center gap-12 w-full">
          <div className="flex-1 space-y-6 max-w-lg">
            <div className="inline-flex items-center gap-2 bg-white text-blue-700 px-4 py-1.5 rounded-full text-sm font-black border-b-4 border-blue-205 shadow-sm uppercase tracking-wider">
              <Sparkles size={16} className="text-yellow-500" />
              <span>Ortaokul Harika Bilişim Dünyası</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black font-display leading-tight text-slate-900 tracking-tight">
              Süper Akıllı Asistanın <span className="text-blue-600 underline decoration-yellow-400 decoration-wavy">BiliBot</span> ile Dersleri Feth Et!
            </h2>
            <p className="text-slate-700 text-lg leading-relaxed font-semibold">
              Donanım parçalarından eğlenceli algoritmaya, internet güvenliğinden harika kodlamalara kadar ders konularını eğlenerek tekrar et. Soruları bil, XP ve unvanları kap!
            </p>

            <div className="bg-yellow-100 border-l-4 border-yellow-400 p-4 rounded-r-2xl shadow-xs">
              <p className="text-sm font-bold text-yellow-905">
                💡 BiliBot her ünitede sana kısa, keyifli ders özetleri anlatır ve öğretici oyun soruları sorar. Her kelimenin altında yeni bir macera gizli!
              </p>
            </div>
          </div>

          <div className="flex-1 w-full max-w-md bg-white shadow-xl rounded-3xl border-2 border-slate-200 border-b-8 p-8 space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-sky-100 rounded-full mx-auto flex items-center justify-center mb-4 border-2 border-slate-200">
                <span className="text-5xl animate-bounce">🤖</span>
              </div>
              <h3 className="text-2xl font-black text-slate-800 font-display uppercase tracking-wide">BiliBot Girişi</h3>
              <p className="text-slate-500 text-sm font-bold">Tekrarlara ve oyunlara başlamak için ismini yaz!</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-1.5">
                  Öğrenci İsmi
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sevgili Bilişimci, adını yaz..."
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400 text-base font-bold"
                  id="student-name-input"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 px-6 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black rounded-2xl shadow-lg border-b-4 border-yellow-750 transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 text-base uppercase tracking-wider active:translate-y-1 active:border-b-0"
                id="btn-login"
              >
                <span>Süper Eğitime Başla! 🚀</span>
              </button>
            </form>
          </div>
        </main>
      ) : (
        /* AFTER LOGIN MAIN APP PANEL - Side panel layout matching Vibrant theme */
        <div className="flex-1 flex flex-col md:flex-row relative">
          
          {/* LEFT UTILITY SIDEBAR */}
          <aside className="w-full md:w-80 bg-white border-r-2 border-slate-100 flex flex-col p-6 space-y-6">
            
            {/* Mascot State & Mood card with blocky borders */}
            <div className="bg-sky-50 rounded-2xl p-4 border border-slate-200 border-b-4 flex items-center gap-3.5 shadow-sm">
              <div className="text-3xl bg-white p-2.5 rounded-xl border border-slate-200 shadow-inner flex items-center justify-center">
                {mascotState === "hello" && "👋🤖"}
                {mascotState === "smile" && "️😊🤖"}
                {mascotState === "ponder" && "🤔🤖"}
                {mascotState === "excited" && "🌟🤖"}
                {mascotState === "sad" && "🥺🤖"}
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">BiliBot Yardımcı</h4>
                <p className="text-xs text-blue-700 font-bold italic mt-0.5">
                  {mascotState === "hello" && "Sana selam getirdim!"}
                  {mascotState === "smile" && "Sıradaki soru hazır!"}
                  {mascotState === "ponder" && "Uçan kodları hazırlıyorum..."}
                  {mascotState === "excited" && "Süpersin evlat! 🎉"}
                  {mascotState === "sad" && "Pes etmek yok, öğreniyoruz!"}
                </p>
              </div>
            </div>

            {/* TAB LINKS with Chunky buttons */}
            <nav className="flex flex-col gap-3 flex-1">
              <button
                onClick={() => { setActiveTab("dashboard"); setSelectedUnit(null); }}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black uppercase tracking-wider transition-all border-2 ${
                  activeTab === "dashboard"
                    ? "bg-blue-600 text-white border-blue-700 border-b-4 shadow-md"
                    : "text-slate-700 bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
                id="tab-dashboard"
              >
                <BookOpen size={18} />
                <span>Tekrar Sınıfı</span>
              </button>

              <button
                onClick={() => setActiveTab("leaderboard")}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black uppercase tracking-wider transition-all border-2 ${
                  activeTab === "leaderboard"
                    ? "bg-blue-600 text-white border-blue-700 border-b-4 shadow-md"
                    : "text-slate-700 bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
                id="tab-leaderboard"
              >
                <Trophy size={18} className="text-yellow-400" />
                <span>Liderlik Sıralaması</span>
              </button>

              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black uppercase tracking-wider transition-all border-2 ${
                  activeTab === "profile"
                    ? "bg-blue-600 text-white border-blue-700 border-b-4 shadow-md"
                    : "text-slate-700 bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
                id="tab-profile"
              >
                <Award size={18} className="text-orange-400" />
                <span>Rozerler & Unvanlar</span>
              </button>
            </nav>

            {/* Quick Informative Badge of Curriculum */}
            <div className="bg-yellow-50 p-4 rounded-2xl text-xs space-y-1.5 border border-yellow-250 border-b-4">
              <h5 className="font-extrabold text-yellow-800 uppercase tracking-widest flex items-center gap-1">
                <span>📚 Maarif Modeli</span>
              </h5>
              <p className="text-yellow-900 font-medium leading-relaxed">
                İçeriklerin tamamı 5. ve 6. sınıf yeni ders programına tam uyumludur. E-Güvenlikten programlamaya her şey burada!
              </p>
            </div>
          </aside>

          {/* MAIN PAGE BODY CONTENT */}
          <main className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto">
            
            {/* TAB: DASHBOARD */}
            {activeTab === "dashboard" && (
              <div className="space-y-8 max-w-6xl">
                <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 border-b-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-black font-display text-slate-800 tracking-tight">
                      MÜCADELEYE HOŞ GELDİN, {studentName.toUpperCase()}! 👋🚀
                    </h2>
                    <p className="text-slate-650 mt-1 font-semibold">
                      Kazanmak için bir üniteden başla ve BiliBot'un sorularına cevap ver!
                    </p>
                  </div>
                  <div className="hidden lg:block text-5xl">🎯</div>
                </div>

                {/* Grid of Learning Chapters */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {LEARNING_UNITS.map((unit) => (
                    <div
                      key={unit.key}
                      className="bg-white rounded-3xl p-6 border-2 border-slate-200 border-b-6 hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className={`p-3 rounded-2xl ${unit.bgColor} border-2 ${unit.borderColor} text-xl flex items-center justify-center`}>
                            {renderUnitIcon(unit.icon, unit.color)}
                          </div>
                          <span className="text-3xl bg-slate-50 p-1.5 rounded-xl border border-slate-200 shadow-inner" title="Başarı Rozeti">{unit.badge}</span>
                        </div>

                        <div>
                          <span className="text-[10px] font-black tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase">
                            {unit.badgeName}
                          </span>
                          <h3 className="text-xl font-black text-slate-800 font-display mt-2">
                            {unit.title}
                          </h3>
                          <p className="text-xs font-bold text-slate-400">{unit.subTitle}</p>
                          <p className="text-slate-600 text-sm mt-3 font-semibold leading-relaxed">
                            {unit.description}
                          </p>
                        </div>

                        {/* Topics */}
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {unit.topics.map((t, idx) => (
                            <span 
                              key={idx}
                              className="text-xs bg-sky-50 text-blue-700 font-bold px-2.5 py-1 rounded-full border border-sky-100"
                            >
                              🚀 {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => startLearningSession(unit)}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-sm transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 shadow-md border-b-4 border-blue-800 active:translate-y-1 active:border-b-0 uppercase tracking-wider"
                      >
                        <BrainCircuit size={16} />
                        <span>Üniteyi Tekrar Et!</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Resuming unfinished work */}
                {sessionsList.length > 0 && (
                  <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-black font-display text-slate-800 uppercase tracking-wide flex items-center gap-2">
                      <RefreshCw size={18} className="text-blue-500 animate-spin-reverse" />
                      <span>Eski Tekrar Oturumların</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sessionsList.map((session) => (
                        <div
                          key={session.id}
                          className="bg-white p-4.5 rounded-2xl border-2 border-slate-200 border-b-4 flex justify-between items-center"
                        >
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{session.topic}</p>
                            <span className="text-xs text-slate-400 font-semibold">
                              Aktiflik: {new Date(session.last_active).toLocaleDateString()}
                            </span>
                          </div>
                          <button
                            onClick={() => resumeSession(session)}
                            className="bg-yellow-400 hover:bg-yellow-500 border-b-2 border-yellow-700 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer"
                          >
                            DEVAM ET
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: CHAT SCREEN - Main Vibrant Palette look */}
            {activeTab === "chat" && selectedUnit && (
              <div className="flex-1 flex flex-col bg-sky-50/20 border-2 border-slate-200 rounded-3xl overflow-hidden shadow-md max-w-5xl mx-auto w-full">
                
                {/* Chat header */}
                <div className="bg-blue-600 text-white px-6 py-4.5 flex items-center justify-between gap-3 border-b-4 border-blue-750">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setActiveTab("dashboard"); setSelectedUnit(null); }}
                      className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full text-white transition-all cursor-pointer flex items-center justify-center border border-white/20"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <div>
                      <h3 className="font-black font-display text-base uppercase tracking-wide">{selectedUnit.title}</h3>
                      <p className="text-xs font-bold text-sky-100">{selectedUnit.subTitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm bg-yellow-400 text-slate-900 px-3.5 py-1.5 rounded-full border-2 border-white font-black uppercase tracking-wider shadow-sm">
                      {selectedUnit.badge} BiliBot
                    </span>
                  </div>
                </div>

                {/* Floating feedback alert */}
                <AnimatePresence>
                  {lastFeedback && lastFeedback.show && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`text-sm px-6 py-3.5 border-b-2 flex items-center justify-between gap-3 ${
                        lastFeedback.isCorrect 
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200 font-bold" 
                          : "bg-red-100 text-red-800 border-red-200 font-bold"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {lastFeedback.isCorrect ? <CheckCircle2 size={18} className="text-emerald-600" /> : <XCircle size={18} className="text-red-500" />}
                        <span>{lastFeedback.explanation}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Messages stream - themed with speech arrows and blocky bottoms */}
                <div className="flex-1 p-6 space-y-6 overflow-y-auto min-h-[380px] max-h-[500px] bg-sky-50/20">
                  {messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {m.role === "assistant" && (
                        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-xl shadow-md border border-slate-200 flex-shrink-0">
                          🤖
                        </div>
                      )}

                      <div className="space-y-3 max-w-[75%] relative">
                        <div
                          className={`p-5 rounded-2xl text-sm leading-relaxed border-b-4 ${
                            m.role === "user"
                              ? "bg-blue-500 text-white font-black border-blue-700 shadow-md"
                              : "bg-white text-slate-800 border-slate-200 shadow-sm relative"
                          }`}
                        >
                          {/* Chat Bubble Arrow left for BiliBot */}
                          {m.role === "assistant" && (
                            <div className="absolute -left-2 top-4 w-4 h-4 bg-white rotate-45 border-l border-b border-slate-200"></div>
                          )}

                          <div className="font-semibold">{m.text}</div>

                          {m.role === "assistant" && m.question && (
                            <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2">
                              {/* Brilliant yellow accent highlights in Vibrant palette */}
                              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-xl">
                                <div className="flex items-center gap-1.5 text-yellow-800 font-black text-xs uppercase tracking-wider mb-1">
                                  <HelpCircle size={14} />
                                  <span>BiliBot Soruyor:</span>
                                </div>
                                <p className="font-black text-slate-850 italic text-[14px]">
                                  {m.question}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Choice options as vibrant pills */}
                        {m.role === "assistant" && m.options && m.options.length > 0 && idx === messages.length - 1 && (
                          <div className="flex flex-col gap-2.5 pt-1.5 w-full">
                            {m.options.map((opt: string, optIdx: number) => (
                              <button
                                key={optIdx}
                                disabled={isLoading}
                                onClick={() => sendStudentResponse(opt)}
                                className="w-full text-left px-5 py-3.5 bg-sky-50 hover:bg-sky-100/80 border-2 border-sky-200 hover:border-blue-400 rounded-full text-xs font-black text-blue-800 cursor-pointer transition-all uppercase tracking-wide text-center"
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {m.role === "user" && (
                        <div className="w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center font-black text-blue-900 border-2 border-white shadow-md flex-shrink-0">
                          {studentName.substring(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-3.5 justify-start">
                      <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-xl shadow-md border border-slate-200">
                        🤖
                      </div>
                      <div className="bg-white p-4.5 rounded-2xl border-2 border-slate-200 border-b-4 flex items-center gap-2.5">
                        <Loader2 className="animate-spin text-blue-500" size={16} />
                        <span className="text-xs text-slate-500 font-bold">BiliBot bilgisayarını çalıştırıyor...</span>
                      </div>
                    </div>
                  )}

                  <div ref={chatBottomRef} />
                </div>

                {/* Input Controls matching bottom footer design of theme */}
                <footer className="bg-white p-6 border-t-2 border-slate-100">
                  <div className="flex flex-col gap-3.5 max-w-4xl mx-auto">
                    
                    {/* Fast help indicator */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>⌨️ Klavyeden yazabilir veya yukarıdaki butonlara basabilirsin!</span>
                      <span className="text-blue-500">Müfredat: 2026 MEB</span>
                    </div>

                    <div className="flex gap-4">
                      <input
                        type="text"
                        disabled={isLoading}
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && userAnswer.trim()) {
                            sendStudentResponse(userAnswer);
                          }
                        }}
                        placeholder="Harika cevabını buraya yazabilirsin..."
                        className="flex-1 bg-slate-100 rounded-2xl px-6 py-4 border-2 border-slate-200 text-slate-800 focus:outline-none focus:border-blue-500 font-semibold"
                        id="chat-text-input"
                      />
                      <button
                        disabled={isLoading || !userAnswer.trim()}
                        onClick={() => sendStudentResponse(userAnswer)}
                        className={`w-20 rounded-2xl flex items-center justify-center text-2xl shadow-lg border-b-4 transition-transform ${
                          userAnswer.trim() 
                            ? "bg-blue-600 border-blue-800 active:translate-y-1 text-white cursor-pointer" 
                            : "bg-slate-240 border-slate-400 text-slate-400 cursor-not-allowed"
                        }`}
                        id="btn-send-message"
                      >
                        ➞
                      </button>
                    </div>
                  </div>
                </footer>
              </div>
            )}

            {/* TAB: LEADERBOARD */}
            {activeTab === "leaderboard" && (
              <div className="space-y-6 max-w-4xl mx-auto w-full">
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 bg-yellow-400 rounded-full mx-auto flex items-center justify-center text-4xl shadow-inner border-2 border-white">
                    🏆
                  </div>
                  <h2 className="text-3xl font-black font-display text-slate-800 uppercase tracking-tight">
                    Sınıfın Süper Bilişimcileri
                  </h2>
                  <p className="text-slate-600 font-semibold text-sm">
                    Soruları çözüp en yüksek XP'ye ulaşan süper kahramanların listesi!
                  </p>
                </div>

                <div className="bg-white border-2 border-slate-200 border-b-8 rounded-3xl overflow-hidden shadow-lg">
                  <div className="bg-blue-600 px-6 py-4 border-b-4 border-blue-700 flex justify-between font-black text-white text-xs tracking-wider uppercase">
                    <span className="w-12 text-center">Sıra</span>
                    <span className="flex-1">Bilişim Kahramanı</span>
                    <span className="w-24 text-right">Skor (XP)</span>
                  </div>

                  <div className="divide-y-2 divide-slate-105">
                    {leaderboard.length > 0 ? (
                      leaderboard.map((student, idx) => (
                        <div
                          key={idx}
                          className={`px-6 py-4 flex justify-between items-center transition-all ${
                            student.student_name.toLowerCase() === studentName.toLowerCase()
                              ? "bg-yellow-50"
                              : ""
                          }`}
                        >
                          <div className="w-12 text-center flex justify-center font-black">
                            {idx === 0 && <span className="text-3xl">🥇</span>}
                            {idx === 1 && <span className="text-3xl">🥈</span>}
                            {idx === 2 && <span className="text-3xl">🥉</span>}
                            {idx > 2 && <span className="font-mono text-slate-650 tracking-wider">#{idx + 1}</span>}
                          </div>

                          <div className="flex-1 font-black text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                            <span>{student.student_name}</span>
                            {student.student_name.toLowerCase() === studentName.toLowerCase() && (
                              <span className="text-[10px] bg-yellow-400 text-slate-900 px-2.5 py-0.5 rounded-full font-black animate-pulse">
                                SEN
                              </span>
                            )}
                          </div>

                          <span className="font-mono font-black text-blue-600 text-sm bg-blue-50 px-3 py-1 rounded-full border border-blue-105">
                            {student.xp} XP
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-450 font-bold text-sm flex flex-col items-center gap-2">
                        <GraduationCap size={44} className="text-slate-300 animate-pulse" />
                        <p>Henüz sıralamaya giren olmamış.</p>
                        <p className="text-xs text-slate-400">İlk üniteyi bitirerek liderlik kürsüsüne tırman!</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={async () => {
                      setIsLoading(true);
                      const lb = await db.getLeaderboard();
                      setLeaderboard(lb);
                      setIsLoading(false);
                    }}
                    className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 border-b-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                    <span>Liderleri Listele</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB: PROFILE & BADGES */}
            {activeTab === "profile" && (
              <div className="space-y-8 max-w-4xl mx-auto w-full">
                
                {/* Visual student profile layout */}
                <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 border-b-8 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4.5">
                    <div className="w-20 h-20 bg-yellow-400 rounded-2xl flex items-center justify-center text-4xl shadow-md border-2 border-slate-200">
                      🎓
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 font-display uppercase tracking-wide">
                        {studentName}
                      </h2>
                      <p className="text-xs text-blue-600 font-extrabold font-mono tracking-widest uppercase">
                        Rütbe: Bilişim Savaşçısı (Sev: {Math.max(1, Math.floor(totalXp / 50))})
                      </p>
                      
                      {/* Next Level Progression Bar */}
                      <div className="w-56 bg-slate-100 border-2 border-slate-200 h-4 rounded-full mt-2.5 overflow-hidden shadow-inner">
                        <div 
                          className="bg-yellow-400 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, (totalXp % 50) * 2)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold block mt-1 uppercase tracking-wider">
                        Bir üst kademe için {(50 - (totalXp % 50))} XP daha lazım! ⚡
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-sky-50 border-2 border-slate-200 border-b-4 px-5 py-3 rounded-2xl text-center">
                      <span className="block text-2xl font-black font-mono text-blue-700">
                        {totalXp}
                      </span>
                      <span className="text-slate-500 text-[10px] font-black uppercase tracking-wider">TOPLAM SKOR</span>
                    </div>

                    <div className="bg-emerald-50 border-2 border-slate-200 border-b-4 px-5 py-3 rounded-2xl text-center">
                      <span className="block text-2xl font-black font-mono text-emerald-700">
                        {Math.max(0, Math.floor((totalXp - 10) / 10))}
                      </span>
                      <span className="text-slate-500 text-[10px] font-black uppercase tracking-wider">BİLİNEN SORU</span>
                    </div>
                  </div>
                </div>

                {/* Badge Milestones */}
                <div className="space-y-4">
                  <h3 className="text-xl font-black font-display text-slate-800 uppercase tracking-widest flex items-center gap-1.5 border-b-2 border-slate-200 pb-2">
                    <Award size={20} className="text-yellow-500" />
                    <span>Maarif Madalyaları & Rozetler</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
                    {getBadgeMilestones().map((m) => (
                      <div
                        key={m.id}
                        className={`p-5 rounded-2xl border-2 transition-all flex items-center gap-3.5 ${
                          m.unlocked
                            ? "bg-white border-emerald-300 border-b-6 shadow-sm"
                            : "bg-slate-105 border-slate-200 opacity-60"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-3xl border ${
                          m.unlocked ? "bg-emerald-100 border-emerald-250 text-emerald-800" : "bg-slate-200 border-slate-300"
                        }`}>
                          {m.unlocked ? m.icon : "🔒"}
                        </div>

                        <div>
                          <p className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">
                            {m.title}
                          </p>
                          <span className={`text-[10px] font-black block mt-0.5 uppercase tracking-wider ${
                            m.unlocked ? "text-emerald-700" : "text-slate-555"
                          }`}>
                            {m.unlocked ? "✓ Açıldı" : `${m.req} KİLİT`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      )}
    </div>
  );
}
