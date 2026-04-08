import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface OTPForm {
  email : String;
  otp: string;
}

export default function OTPPage() {
  const nav = useNavigate();
  const [error,setError] = useState("");
  const [Form, SetForm] = useState<OTPForm>({
         email : "",
         otp : ""
        }); 
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!Form.otp) {
      setMessage("Please enter the OTP");
      setError("You Have not Entered OTP");
      setTimeout(()=>{
        setError("");
      },3000)
      return;
    }

    try {
      const user_email = localStorage.getItem("email");
      const response = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email : user_email,
          input_otp : Form.otp
        }),
      });

      const result = await response.json();

      if (response.ok) {
        nav("/home" , {replace : true})
        setMessage("OTP verified successfully!");
        
      } else {
        setError("Invalid OTP Try Again");
        setTimeout(()=>{
          setError("");
        },3000)
        setMessage(result.error || "Invalid OTP Try Again");
        return;
      }
    } catch (err) {
      setError("Check Your Internet Connection.")
      setTimeout(()=>{
        setError("")
      },3000)
      setMessage("Server error. Please try again.");
    }
  };

  return (
    <div className="container-login">
      <form className="login-box-login" onSubmit={handleSubmit}>
        <h2 className="title-login">Enter OTP</h2>
        {error && <p className="error-login">{message}</p>}

        <input
          className="input-login"
          type="text"
          placeholder="Enter OTP"
          value={Form.otp}
          onChange={(e) => SetForm({
            ...Form,
            otp : e.target.value
          })}
        />

        <button className="button-login" type="submit">
          Verify
        </button>
      </form>
    </div>
  );
}