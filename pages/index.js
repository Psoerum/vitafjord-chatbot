import OpenAI from "openai";
import { useState, useEffect } from "react";
import { firebaseConfig, auth } from "@/lib/firebaseConfig"; // Import Firebase setup
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore"; // Firestore imports

// ✅ Debugging Logs
console.log("✅ Firebase Config:", firebaseConfig);
console.log("✅ Auth Object:", auth);

// ✅ Only attach auth to window in the browser (fixes ReferenceError)
if (typeof window !== "undefined") {
  window.auth = auth;
}

export default function Home() {
  const [messages, setMessages] = useState([
    { sender: "Pia", text: "Hei og velkommen til VitaFjord! Jeg er Pia, din personlige rådgiver for kjæledyrernæring. Hvordan kan jeg hjelpe deg i dag?" }
  ]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("User state changed:", currentUser);
      setUser(currentUser);

      if (currentUser) {
        // 🔍 Hent fornavn fra Firestore
        const userDoc = await getDoc(doc(getFirestore(), "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().firstName);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const openai = new OpenAI({ 
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, 
    dangerouslyAllowBrowser: true 
  });

  const getChatGPTResponse = async (message, user) => {
    console.log("Sender forespørsel til OpenAI...");
    console.log("Melding:", message);

    try {
      let responseText = "";
      
      if (message.toLowerCase().includes("log in") || message.toLowerCase().includes("sign up")) {
        if (user) {
          responseText = `Du er allerede logget inn som ${userName || user.email}. Hva ønsker du å gjøre?`;
        } else {
          responseText = "Vil du logge inn eller opprette en konto? Skriv 'logg inn [email] [passord]' eller 'registrer [fornavn] [email] [passord]'.";
        }
      } else if (message.toLowerCase().startsWith("logg inn")) {
        const [, email, password] = message.split(" ");
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const loggedInUser = userCredential.user;

          // 🔍 Hent fornavn fra Firestore
          const userDoc = await getDoc(doc(getFirestore(), "users", loggedInUser.uid));
          if (userDoc.exists()) {
            setUserName(userDoc.data().firstName);
          }

          responseText = `Velkommen tilbake, ${userDoc.exists() ? userDoc.data().firstName : loggedInUser.email}!`;
        } catch (error) {
          responseText = "Feil ved innlogging. Sjekk e-post og passord og prøv igjen.";
        }
      } else if (message.toLowerCase().startsWith("registrer")) {
        const [, firstName, email, password] = message.split(" ");
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const newUser = userCredential.user;

          // 📌 Lagre fornavn i Firestore
          await setDoc(doc(getFirestore(), "users", newUser.uid), {
            firstName: firstName
          });

          setUserName(firstName);

          responseText = `Konto opprettet! Velkommen, ${firstName}.`;
        } catch (error) {
          responseText = "Kunne ikke opprette konto. Prøv igjen med en annen e-post.";
        }
      } else {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",  // ✅ Updated to GPT-4o
          messages: [{ role: "user", content: message }]
        });

        // ✅ Improved response handling
        if (response && response.choices && response.choices.length > 0) {
          responseText = response.choices[0].message.content;
        } else {
          console.error("❌ Unexpected API response:", response);
          responseText = "Beklager, jeg kunne ikke hente svar akkurat nå.";
        }
      }

      return responseText;
    } catch (error) {
      console.error("Feil ved OpenAI-kall:", error);
      return "Beklager, jeg kunne ikke hente svar akkurat nå.";
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: "Du", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    const responseText = await getChatGPTResponse(input, user);
    setMessages((prev) => [...prev, { sender: "Pia", text: responseText }]);
  };

  return (
    <div>
      <h1>VitaFjord Chat</h1>
      <p>{user ? `Innlogget som: ${userName || user.email}` : "Ikke innlogget"}</p>
      <div>
        {messages.map((msg, index) => (
          <p key={index}><strong>{msg.sender}:</strong> {msg.text}</p>
        ))}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Skriv en melding..." />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
}
