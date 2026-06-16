export enum UnitKey {
  DIGITAL_CITIZENSHIP = "digital_citizenship",
  HARDWARE_SOFTWARE = "hardware_software",
  NETWORKS_INTERNET = "networks_internet",
  ALGORITHMS_CODING = "algorithms_coding"
}

export interface LearningUnit {
  key: UnitKey;
  title: string;
  subTitle: string;
  description: string;
  badge: string;
  badgeName: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color classes
  bgColor: string; // Tailwind bg color classes
  borderColor: string;
  topics: string[];
}

export interface ChatMessageSession {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  topic?: string;
  isEvaluation?: boolean;
  isCorrect?: boolean;
  xpEarned?: number;
  questionText?: string;
  optionsList?: string[];
}

export const LEARNING_UNITS: LearningUnit[] = [
  {
    key: UnitKey.DIGITAL_CITIZENSHIP,
    title: "Dijital Vatandaşlık & Güvenlik",
    subTitle: "E-Etik, Güvenlik ve Siber Haklar",
    description: "İnternette güvenle gezinmeyi, güçlü şifreler tasarlamayı, siber zorbalıklardan korunmayı ve etik kuralları öğren.",
    badge: "🛡️",
    badgeName: "Siber Koruyucu",
    icon: "ShieldAlert",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-55 dark:bg-emerald-950/20",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    topics: ["Güçlü Şifre", "Siber Zorbalık", "Dijital Ayak İzi", "Telif Hakları", "E-Etik"]
  },
  {
    key: UnitKey.HARDWARE_SOFTWARE,
    title: "Donanım & Yazılım Dünyası",
    subTitle: "Bilgisayarların Temel Bileşenleri",
    description: "Kasayı aç ve içindekileri keşfet (İşlemci, RAM, Anakart)! İşletim sistemlerini ve dosya uzantılarının sırlarını çöz.",
    badge: "⚙️",
    badgeName: "Donanım Kaşifi",
    icon: "Cpu",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-55 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    topics: ["İç Donanım", "Dış Donanım", "İşletim Sistemleri", "Dosya Uzantıları", "Uygulamalar"]
  },
  {
    key: UnitKey.NETWORKS_INTERNET,
    title: "Bilgisayar Ağları & İnternet",
    subTitle: "Dünyayı Bağlayan Görünmez Kablolar",
    description: "Ağ türlerini (PAN, LAN, WAN), IP adresinin ne işe yaradığını ve internette bilgi aramanın en pratik yollarını öğren.",
    badge: "🌐",
    badgeName: "Ağ Bağlantı Uzmanı",
    icon: "Globe",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-55 dark:bg-amber-950/20",
    borderColor: "border-amber-200 dark:border-amber-800",
    topics: ["LAN & WAN Ağları", "IP Adresi", "Güvenli Arama Motoru", "E-Hizmetler"]
  },
  {
    key: UnitKey.ALGORITHMS_CODING,
    title: "Problem Çözme & Algoritmalar",
    subTitle: "Programlamaya İlk Adım",
    description: "Algoritma tasarlama basamaklarını, koşul yapılarını, akış şemalarını ve Scratch kodlama mantığını öğrenerek küçük bir dahi ol!",
    badge: "🧩",
    badgeName: "Algoritma Ustası",
    icon: "CodeXml",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-55 dark:bg-purple-950/20",
    borderColor: "border-purple-200 dark:border-purple-800",
    topics: ["Algoritma Adımları", "Akış Şemaları", "Değişkenler", "Döngüler", "Koşullar (Eğer)"]
  }
];
