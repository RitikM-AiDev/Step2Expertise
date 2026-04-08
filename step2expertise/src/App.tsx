import { User,Bot,Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Logout_icon from "./Logout_icon";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export default function App() {
  const nav = useNavigate();
  const handle_logout = async () =>{
      const response = await fetch(
        "/api/logout",
        {
          method :"POST",
          credentials : "include"
        }

      )
      const data = await response.json();
      if(data.removed){
          nav("/");
      }
      else{
        alert("We are facing some Internal Issues Please try again after some time !")
      }
  }
  const [chatmsg,Setchatmsg] = useState<Message[]>([])
  const [userinput, Setuserinput] = useState("")
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const handleinput=()=>{
    if(!inputRef.current){
      return;
    }
    inputRef.current.style.height = "auto";
    inputRef.current.style.height = inputRef.current.scrollHeight + "px";
  }
  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior : "smooth"})
  },[chatmsg])
  const sendmsg = async()=>{
  const UserMsg : Message = {
    id :Date.now().toString()+Math.random().toString(36).slice(2),
    text : userinput,
    sender : "user",
    timestamp : new Date()
    }
      const updatedUserMsg = [...chatmsg , UserMsg]
      Setchatmsg(updatedUserMsg)
      Setuserinput("")
      const response = await fetch(
        "/api/chat" ,
        {
          method : "POST",
          headers : {"Content-Type" : "application/json"},
          body : JSON.stringify({
            "chatmsg" : updatedUserMsg
          })
        }
       )
      const result = await response.json()
      console.log(result)
      const aimsg = result["message"]
      const botmsg : Message ={
          id : Date.now().toString() + Math.random().toString(36).slice(2)
          ,
          text : aimsg,
          sender : "bot",
          timestamp : new Date()
      }
      const updatedAIMsg = [...updatedUserMsg , botmsg]
      Setchatmsg(updatedAIMsg)
      console.log(aimsg)
  }
 return (
  <>
  <div className="container">
    <div className="header">
    <h1>Step2Expertise</h1>
    <Logout_icon size={40} color="black" onClick = {()=>{handle_logout();}} />
    </div>
    <p id="p">Take Your Step To Become An Expertise In Your Field !!</p>
    
    <div className="chats">
    {
      chatmsg.map(msg => (
        <div key={msg.id} className={msg.sender === "user" ? "msg-wrapper user" : "msg-wrapper bot"} style={{textAlign: msg.sender === "user" ? "right" : "left", marginRight : msg.sender === "user" ? "15%" : 0,marginLeft : msg.sender === "bot" ? "15%" : 0}}>
          <p className="msg-label">
            {msg.sender === "user" ? <User size={14} /> : <Bot size={14} />}
          </p>
          <p className="msg-bubble">{msg.text}</p>
        </div>
      ))
    }
    <div ref={bottomRef}></div>
    <div className="text-input" >
    <textarea placeholder="Get Started Now....... " rows={1} ref={inputRef} className="input-box" id="chat-input" value={userinput} onChange={(e) => {Setuserinput(e.target.value); handleinput()}} required></textarea>
    <button className="send-btn" onClick={sendmsg}><Send size={16}/></button>
    </div>
    </div>
    </div>
  </>
);
}
