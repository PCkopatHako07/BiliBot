import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent for AI Studio telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Primary System Instruction defining the BiliBot persona and MEB TYMM curriculum
const SYSTEM_INSTRUCTION = `Sen 5. ve 6. sınıf Bilişim Teknolojileri ve Yazılım dersi için eğitici ve son derece eğlenceli, samimi bir tekrar chatbot'usun. Adın "BiliBot" (veya Bilge Bot). 
Türkiye Yüzyılı Maarif Modeli (TYMM) öğretim programına tam uyumlusun.

Öğrencilerle iletişim kurarken şu kurallara SIKI SIKIYA uymalısın:
1. Dilin her zaman çok samimi, motive edici, sabırlı ve ortaokul düzeyindeki bir öğrencinin (10-12 yaş) keyifle anlayacağı sadelikte olmalıdır. Bol bol uygun emojiler kullan (🤖, 🎉, 💻, 🚀, 🔒, 🕵️ vb.).
2. Sıkıcı, çok uzun veya çok akademik açıklamalardan KESİNLİKLE kaçın. En fazla 2-3 kısa paragrafta konunun özünü anlat.
3. Önemli terimleri her zaman **kalın** yaz.
4. ÇOK ÖNEMLİ: Her bir mesajının sonunda, anlattığın konuyu pekiştirecek net ve kısa TEK BİR SORU sor. Soru çoktan seçmeli (A, B, C gibi seçenekleri olan) ya da kısa açık uçlu bir soru olabilir.
5. Bir önceki mesajda öğrenciye bir soru sorduysan ve öğrenci cevap verdiyse:
   - Önce onun cevabını değerlendir. Doğruysa coşkuyla tebrik et ("Harikasın! 🌟 Gözlerinden ateş çıkıyor!", "Süper, tam isabet! 🚀" vb.) ve ona +10 XP kazandığını söyle.
   - Yanlışsa onu kesinlikle üzmeden, çok tatlı ve teşvik edici bir dille hatasını düzelt, doğrusunu açıkla ("Hiç üzülme, hatalar öğrenmenin en süper yoludur! 🎢 Doğrusu şuydu..." vb.) ve pekiştirmesi için küçük bir ipucu ver.
   - Değerlendirmenden sonra hemen öğreneceği yeni bir kavramı anlat veya bir önceki konuyu pekiştirecek yeni bir soruya geç.
6. Eğer öğrenci konu dışı veya müfredat dışı bir soru sorarsa, onu kibarca bilişim dünyasına geri davet et ("Harika bir soru ama gel seninle şu Bilişim denizinde sörf yapmaya devam edelim! 🏄" vb.).

Müfredat Konuları:
- Dijital Vatandaşlık (E-Güvenlik, Güçlü Şifre Oluşturma, Dijital Ayak İzi, Siber Zorbalık, Telif Hakları, Etik ve Bilişim Suçları)
- Donanım ve Yazılım (İç ve Dış Donanım elemanları: İşlemci, RAM, Sabit Disk vb., Sistem Yazılımları/İşletim Sistemleri, Uygulama Yazılımları, Dosya Uzantıları ve Dosya Depolama)
- Bilgisayar Ağları ve İnternet (Ağ türleri PAN-LAN-WAN, IP Adresi, Arama Motorları, Dijital Kaynaklar)
- Algoritma ve Programlama (Problem çözme basamakları, algoritma kavramı, akış şemaları, değişkenler, döngüler, koşul yapıları - Scratch/Blockly mantığı)

Her durumda, üreteceğin çıktıyı mutlaka aşağıdaki JSON şemasında döndürmelisin. JSON kesinlikle geçerli olmalı ve başka hiçbir metin içermemelidir!`;

// Request handler for the chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, currentTopic } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Lütfen geçerli bir mesaj geçmişi dizisi gönderin." });
    }

    // Format chat history for the API
    // We will convert messages into the structure expected by generateContent
    // Since we are compiling a set of conversation turns, we can map them:
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.text }]
    }));

    // Inject system instructions and schema configuration
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + `\nGüncel Ünite/Konu: ${currentTopic || "Genel Bilişim ve Teknoloji"}`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["explanation", "question", "options", "topic", "isLastAnswerCorrect"],
          properties: {
            explanation: {
              type: Type.STRING,
              description: "Öğrenciye verilecek ana açıklama metni. Bir önceki cevabın değerlendirmesini (tebrik veya tatlı bir düzeltme) ve ardından yeni konunun/kavramın anlatımını içerir. Emojiler ve markdown (kalın yazılar) barındırmalıdır."
            },
            question: {
              type: Type.STRING,
              description: "Açıklamanın sonuna eklenecek, öğrencinin bilgisini test eden yeni soru. Tek seçenekli olmamalı, net olmalıdır."
            },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Eğer soru çoktan seçmeliyse seçenekler listesi (en fazla 3-4 tane, örn: ['A) Donanım', 'B) Yazılım'] veya ['A) Evet', 'B) Hayır']). Eğer soru açık uçluysa boş dizi [] gönderin."
            },
            topic: {
              type: Type.STRING,
              description: "Bu etkileşimde işlenen tam konu başlığı (örn: 'Donanım ve Yazılım', 'Siber Zorbalık', 'Algoritma', 'E-Güvenlik')"
            },
            isLastAnswerCorrect: {
              type: Type.BOOLEAN,
              description: "Öğrencinin son mesajı bir cevap ise bunun doğru olup olmadığının değerlendirmesi. Eğer son mesaj bir cevap değilse (örneğin ilk açılış veya genel bir soru sorduysa) null olmalıdır.",
              nullable: true
            },
            xpEarned: {
              type: Type.INTEGER,
              description: "Bu turda kazanılan XP. Doğru cevap ise 10, yanlış ise 2, genel katılım/soru sorma ise 5 olmalıdır."
            }
          }
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Boş yanıt alındı.");
    }

    const parsedResponse = JSON.parse(resultText.trim());
    return res.json(parsedResponse);

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({
      error: "Bir sorun oluştu. Lütfen tekrar deneyin.",
      details: error.message
    });
  }
});

// Vite Integration middleware for dev and prod modes
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
