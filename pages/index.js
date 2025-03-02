import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { sender: "Pia", text: `Hei og velkommen til VitaFjord! 
      Jeg er Pia, din personlige rådgiver for kjæledyrernæring. 
      Hvordan kan jeg hjelpe deg i dag?` }
  ]);
  const [input, setInput] = useState("");

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    const newMessages = [...messages, { sender: "Du", text: input }];
    setMessages(newMessages);
    setInput("");
    
    setTimeout(() => {
      const response = getBotResponse(input);
      setMessages([...newMessages, { sender: "Pia", text: response }]);
    }, 1000);
  };

  const getBotResponse = (message) => {
    message = message.toLowerCase();
    
    if (message.includes("hund")) {
      return `Vi har et bredt utvalg av hundefôr tilpasset ulike behov.
              Ønsker du forslag på noen produkter?`;
    } else if (message.includes("katt")) {
      return `Vi tilbyr spesialutviklet kattemat for ulike behov.
              Trenger du hjelp med valg av produkt?`;
    } else if (message.includes("hest")) {
      return `VitaFjord har tilskudd og fôr for hester.
              Hva slags produkt ser du etter?`;
    } else {
      return `Jeg lærer fortsatt! Kan du gi meg mer detaljer om hva du 
leter etter?`;
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>VitaFjord</h1>
      <p>Vi tilbyr kvalitetsfôr og tilskudd for hund, katt og hest.</p>
      <div style={{ 
        maxWidth: "500px", 
        margin: "20px auto", 
        border: "1px solid #ccc", 
        padding: "10px", 
        borderRadius: "8px" 
      }}>
        <div style={{ minHeight: "300px", padding: "10px", overflowY: 
"auto", textAlign: "left" }}>
          {messages.map((msg, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <strong>{msg.sender}:</strong> {msg.text}
            </div>
          ))}
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Skriv din melding her..."
          style={{ width: "80%", padding: "8px", marginTop: "10px" }}
        />
        <button onClick={handleSendMessage} style={{ padding: "8px 15px", 
marginLeft: "10px" }}>Send</button>
      </div>
    </div>
  );
}

