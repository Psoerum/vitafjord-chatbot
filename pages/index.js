import OpenAI from "openai";
import { useState } from "react";

const openai = new OpenAI({ 
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, 
  dangerouslyAllowBrowser: true 
});

const getChatGPTResponse = async (message) => {
  console.log("Sender forespørsel til OpenAI...");
  console.log("Melding:", message);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",  
      messages: [
        { role: "system", content: "Du er Pia, en ekspert på dyreernæring hos VitaFjord. Gi råd om fôr og tilskudd for hunder, katter og hester, og informér om våre produkter." },
        { role: "user", content: message }
      ]
    });

    console.log("Svar fra OpenAI:", response);

    if (response && response.choices && response.choices.length > 0) {
      return response.choices[0].message.content;
    } else {
      console.error("Uventet responsformat:", response);
      return "Beklager, jeg kunne ikke hente svar akkurat nå.";
    }

  } catch (error) {
    console.error("Feil ved OpenAI-kall:", error);
    return "Beklager, jeg kunne ikke hente svar akkurat nå.";
  }
};

export default function Home() {
  const [messages, setMessages] = useState([
    { sender: "Pia", text: "Hei og velkommen til VitaFjord! Jeg hjelper deg gjerne med råd om ernæring, helse og fôr til ditt kjæledyr. Hva lurer du på?" }
  ]);
  const [input, setInput] = useState("");

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { sender: "Du", text: input }];
    setMessages(newMessages);
    setInput("");

    const botResponse = await getChatGPTResponse(input);
    setMessages([...newMessages, { sender: "Pia", text: botResponse }]);
  };

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>VitaFjord</h1>
      <p>Vi tilbyr kvalitetsfôr og tilskudd for hund, katt og hest.</p>
      <div style={{ maxWidth: "500px", margin: "20px auto", border: "1px solid #ccc", padding: "10px", borderRadius: "8px" }}>
        <div style={{ minHeight: "300px", padding: "10px", overflowY: "auto", textAlign: "left" }}>
          {messages.map((msg, index) => (
            <p key={index}><strong>{msg.sender}:</strong> {msg.text}</p>
          ))}
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Skriv en melding..."
          style={{ width: "80%", padding: "10px", marginTop: "10px" }}
        />
        <button onClick={handleSendMessage} style={{ padding: "10px 20px", marginLeft: "10px" }}>Send</button>
      </div>
    </div>
  );
}
